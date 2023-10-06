import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DEFAULT_LOGGER_TOKEN } from '../../logging/constants';
import { ConnectLogger } from "../../logging/ConnectLogger";
import { TaskQueueItem, TaskQueueItemRecurrence, TaskQueueItemStatusOutcome } from '@blockspaces/shared/models/task-queue/TaskQueueItem';
import { TaskQueueItemTaskType } from '@blockspaces/shared/models/task-queue/TaskQueueItemTaskType';
import { TaskQueueItemDataService } from './TaskQueueItemDataService';
import { DateTime } from 'luxon';
import { TaskRunnerResult } from '../types/Types';
import { ConnectSubscriptionService } from '../../connect-subscription/services/ConnectSubscriptionService';
import { QuickbooksClient } from '../../quickbooks/clients/QuickbooksClient';
import { AppIdService } from "../../app-id";
import { VaultService } from '../../vault';
import { ConnectDbDataContext } from '../../connect-db/services/ConnectDbDataContext';
import { SecretService } from '../../secrets/services/SecretService';
import { ICredentialReference } from '@blockspaces/shared/models/flows/Credential';
import { SecretType } from '../../secrets/types/secret';
import { IUser, RevokedToken } from '@blockspaces/shared/models/users';
import { LightningTasksService } from '../../networks/lightning/onboarding/services/LightningTasksService';
import { CancellationService } from '../../connect-subscription/services/CancellationService';
import { EndpointsService } from '../../endpoints/services';
import { ENV_TOKEN, EnvironmentVariables } from '../../env';
import { EmailService } from '../../notifications/services';
import { LndService } from '../../networks/lightning/lnd/services/LndService';

@Injectable()
export class TasksRunnerService {
  private MAX_ATTEMPTS = 0;;
  constructor(@Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly taskQueueItemDataService: TaskQueueItemDataService,
    private readonly connectSubscriptionService: ConnectSubscriptionService,
    private readonly qbClient: QuickbooksClient,
    private readonly appIdService: AppIdService,
    private readonly vaultService: VaultService,
    private readonly secretService: SecretService,
    private readonly db: ConnectDbDataContext,
    private readonly lightningTasksService: LightningTasksService,
    private readonly cancellationService: CancellationService,
    private readonly endpointsService: EndpointsService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,

  ) {
    logger.setModule(this.constructor.name);
    this.MAX_ATTEMPTS = taskQueueItemDataService.MAX_ATTEMPTS;
  }

  //  @Cron('*/5 * * * * *') // for debugging ONLY!! :)
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    const items = await this.taskQueueItemDataService.getPendingTask();
    // process tasks in parallel
    await Promise.all(items.map(item => this.processTask(item)));
  }

  /**
 * This gets called by cron job.
 * This method will house logic for each supported {@link TaskQueueItemTaskType}
 * @param task pending task, passed in by cron job
 * @returns
 */
  private async processTaskItemHelper(task: TaskQueueItem): Promise<TaskRunnerResult> {
    const payload = task.payload;
    let results: TaskRunnerResult = TaskRunnerResult.failure(`Default Not Handled Exception`);
    this.logger.debug(`processing task id${task._id}, type : ${task.type}, payload: ${JSON.stringify(payload)}`);
    /**
     *  Add case to handle service call for the given {@link TaskQueueItemTaskType}
     *  Make sure any service called always returns, and doesnt throw exceptions . 
     *  If call returns an error capture the error and return TaskRunnerResult.failure()
     */
    switch (task.type) {
      /*
      case 'EXAMPLE': {
        const callResult = await this.someService.methodAsyncCall(payload);
        if (callResult.isFailure) {
          results = TaskRunnerResult.failure(callResult.error);
        } else {
          results = TaskRunnerResult.success(callResult.data);
        }
        break;
      }
     */
      case TaskQueueItemTaskType.REPORT_SUBSCRIPTION_USAGE: {
        if (payload.connectSubscriptionId) {

          try {
            const callResult = await this.connectSubscriptionService.processSubscriptionMeteredUsage(payload.connectSubscriptionId);
            results = TaskRunnerResult.success(callResult);
          } catch (e) {
            this.logger.error('TasksRunnerService(REPORT_SUBSCRIPTION_USAGE): ' + e.message, e);
            results = TaskRunnerResult.failure(e.message + ' :: ' + e.stack);
          }

        } else {
          this.logger.fatal(`payload was empty for task type ${task.type}, id: ${task._id.toString()}`);
        }
        break;
      }
      case TaskQueueItemTaskType.BLOCKSPACES_INTERNAL_QUICKBOOKS_TOKEN_REFRESH: {
        try {
          // refresh token
          const qbOAuthToken = await this.qbClient.getOAuthClientToken();
          if (!qbOAuthToken) {
            results = TaskRunnerResult.failure("Token Refresh Failed.");
          } else {
            results = TaskRunnerResult.success("Token Refreshed");
          }
        } catch (e) {
          this.logger.error('TasksRunnerService(BLOCKSPACES_INTERNAL_QUICKBOOKS_TOKEN_REFRESH): ' + e.message, e);
          results = TaskRunnerResult.failure(e.message + ' :: ' + e.stack);
        }
        break;
      }
      case TaskQueueItemTaskType.SUBSCRIPTION_TERMINATION: {
        const {
          connectSubscriptionId
        } = payload;
        try {
          await this.connectSubscriptionService.processSubscriptionTermination(connectSubscriptionId);
          results = TaskRunnerResult.success();
        } catch (e) {
          this.logger.error('TasksRunnerService(SUBSCRIPTION_TERMINATION): ' + e.message, e);
          results = TaskRunnerResult.failure(e.message + ' :: ' + e.stack);
        }

        break;
      }
      case TaskQueueItemTaskType.SUBSCRIPTION_NETWORK_TERMINATION: {
        {
          const {
            connectSubscriptionId,
            networkId,
            billingCategoryId
          } = payload;
          try {
            await this.connectSubscriptionService.processSubscriptionNetworkTermination(connectSubscriptionId, networkId, billingCategoryId);
            results = TaskRunnerResult.success();
          } catch (e) {
            this.logger.error('TasksRunnerService(SUBSCRIPTION_NETWORK_TERMINATION): ' + e.message,);
            results = TaskRunnerResult.failure(e.message + ' :: ' + e.stack);
          }


        }
        break;
      }
      case TaskQueueItemTaskType.E2E_PURGE_TEST_USER: {
        try {
          const users = await this.db.users.find({ email: { $regex: /\b[eE]2[eE](\+[\w-]+)*@blockspaces\.com\b/ } });

          for await (const userData of users) {
            // 1: Delete USER from App Id
            const appIdResponse = await this.appIdService.deleteUser(userData.id);
            if (appIdResponse.isFailure) {
              this.logger.warn(`${appIdResponse.message}. UserId ${userData.id} - Email ${userData.email}`);
            }

            // 2: PURGE USER SECRETS FROM VAULT AND MONGO
            const userSecrets: ICredentialReference[] = await this.secretService.list(userData.activeTenant?.tenantId);
            let secretsResponse: any;
            if (userSecrets) {
              userSecrets.forEach(async (credential) => {
                for (let i = 0; i < Object.keys(SecretType).length / 2; i++) {
                  secretsResponse = await this.secretService.delete({
                    credentialId: credential.credentialId,
                    tenantId: credential.tenantId
                  },
                  SecretType[i]
                  );
                  if (!secretsResponse.success) {
                    this.logger.warn(`${secretsResponse.failureReason} for tenant ${userData.activeTenant?.tenantId} - Email ${userData.email}`);
                  }
                }
              });
            }

            // 3: Now CLEAN UP USER from Mongo
            //    ~ Mongo also needs to have any table cleaned up that relate to the user being purged.
            // Use mongo and search for all documents with the user sub and delete them.
            const deletedDocuments = await Promise.all([
              this.db.users.findOneAndDelete({ "id": userData.id }),
              this.db.cart.findOneAndDelete({ "userId": userData.id }),
              this.db.connectSubscriptionInvoices.findOneAndDelete({ "userId": userData.id }),
              this.db.connectSubscriptions.findOneAndDelete({ "userId": userData.id }),
              this.db.lightningNodes.findOneAndDelete({ "tenantId": userData.activeTenant?.tenantId }),
              this.db.tenants.findOneAndDelete({ "tenantId": userData.activeTenant?.tenantId }),
              this.db.userSecrets.findOneAndDelete({ "userId": userData.id }),
              this.db.lightningBalances.findOneAndDelete({ "tenantId": userData.activeTenant?.tenantId }),
              this.db.endpoints.findOneAndDelete({ "tenantId": userData.activeTenant?.tenantId }),
              this.db.userNetworks.findOneAndDelete({ "userId": userData.id })
            ]);

            // const successfulDeletes = deletedDocuments.filter(doc => doc != null);
            const unsuccessfulDeletes = deletedDocuments.filter(doc => doc == null);

            if (unsuccessfulDeletes.length > 0) {
              this.logger.warn(`Unsuccessful Purge from mongo: ${unsuccessfulDeletes}`);
            }
          }

          results = TaskRunnerResult.success("E2E Purge complete.");
        } catch (e) {
          this.logger.error('E2E_PURGE_TEST_USER: ' + e.message, e);
          results = TaskRunnerResult.failure(e.message, e);
        }
        break;
      }
      case TaskQueueItemTaskType.LIGHTNING_NODE_REFRESH_ALL_OBJECTS: {
        try {
          await this.lightningTasksService.refreshAllObjectsForAllUsers();
          results = TaskRunnerResult.success();
        } catch (e) {
          this.logger.error('TasksRunnerService(LIGHTNING_NODE_REFRESH_ALL_OBJECTS): ' + e.message, e);
          results = TaskRunnerResult.failure(e.message + ' :: ' + e.stack);
        }
        break;
      }
      case TaskQueueItemTaskType.BIP_NODE_TERMINATION: {
        try {
          const {
            userId,
            tenantId
          } = payload;
          const readyToWipe = await this.cancellationService.processBipNodeTermination(tenantId, userId);
          results = TaskRunnerResult.success();
          if (readyToWipe === true) {
            task.recurrence = TaskQueueItemRecurrence.DONE;
          }
        } catch (e) {
          this.logger.error('TasksRunnerService(BIP_NODE_TERMINATION): ' + e.message, e);
          results = TaskRunnerResult.failure(e.message + ' :: ' + e.stack);
        }
        break;
      }
      case TaskQueueItemTaskType.FREE_TIER_WEB3_ENDPOINTS_DAILY_CHECK: {
        try {
          await this.endpointsService.processFreeEndpoints();
          results = TaskRunnerResult.success();
        } catch (e) {
          this.logger.error('TasksRunnerService(FREE_TIER_WEB3_ENDPOINTS_DAILY_CHECK): ' + e.message, e, e);
          results = TaskRunnerResult.failure(e.message + ' :: ' + e.stack);
        }
        break;
      }
      case TaskQueueItemTaskType.REVOKED_JWT_EXPIRY_CHECK: {
        try {
          const timeNow = DateTime.now().toSeconds()
          let tokensDeleted = 0
          const tokens: RevokedToken[] = await this.db.revokedTokens.find({})
          tokens.map(async token => {
            if (token.expiry < timeNow) {
              await this.db.revokedTokens.model.deleteOne({tokenId: token.tokenId})
              tokensDeleted++
            }
          })
          this.logger.info(`TasksRunnerService(REVOKED_JWT_EXPIRY_CHECK): Deleted ${tokensDeleted} jwt tokens that were expired.`)
          results = TaskRunnerResult.success()
        } catch (e) {
          this.logger.error('TasksRunnerService(REVOKED_JWT_EXPIRY_CHECK): ' + e.message, e, e);
          results = TaskRunnerResult.failure(e.message + ' :: ' + e.stack); 
        }
        break;
      }
      case TaskQueueItemTaskType.CHECK_PROVISION_NODES: {
        try {
          const result = await this.lightningTasksService.provisionLightningNodes();
          if (result.success) {
            results = TaskRunnerResult.success();
          } else {
            results = TaskRunnerResult.failure(result.error);
          }
        } catch (e) {
          this.logger.error('TasksRunnerService(CHECK_PROVISION_NODES): ' + e.message, e, e);
          results = TaskRunnerResult.failure(e.message + ' :: ' + e.stack); 
        }
        break;
      }
      case TaskQueueItemTaskType.LOCKED_NODES_CHECK: {
        try {
          const result = await this.lightningTasksService.lockedNodesCheck()
          if (result.success) {
            results = TaskRunnerResult.success();
          } else {
            results = TaskRunnerResult.failure(result.data);
          }
        } catch (e) {
          this.logger.error('TasksRunnerService(LOCKED_NODES_CHECK): ' + e.message, e, e);
          results = TaskRunnerResult.failure(e.message + ' :: ' + e.stack); 
        }
        break;
      }
      default: {
        this.logger.debug(`Unhandled task type ${task.type}`);
      }
    }
    return results;
  }

  // #region Helper Methods

  private async processTask(task: TaskQueueItem): Promise<void> {
    let results: TaskRunnerResult = TaskRunnerResult.failure();

    task = await this.preProcessHelper(task);

    try {
      // do the magic
      results = await this.processTaskItemHelper(task);

    } catch (error) {
      this.logger.fatal(`error processing task ${task._id}, type: ${task.type};`, error);
      results = TaskRunnerResult.failure(error);
    }
    finally {
      task = await this.postProcessHelper(task, results);
    }

  }

  private async preProcessHelper(task: TaskQueueItem): Promise<TaskQueueItem> {
    // Pre task Processing 
    task.status = TaskQueueItemStatusOutcome.PROCESSING;
    task.attempts = task.attempts + 1;

    if (task.attempts === this.MAX_ATTEMPTS) {
      this.logger.debug(`task id: ${task._id}, type: ${task.type} has reach max attempts, this will be its last run`);
    }

    // persist/update task
    return this.taskQueueItemDataService.updateTask(task);
  }

  private async postProcessHelper(task: TaskQueueItem, result: TaskRunnerResult): Promise<TaskQueueItem> {

    // check results
    const resultsFailed = result.isFailure;
    if (resultsFailed) {
      this.logger.debug(`task id ${task._id} has failed processing; total attempts: ${task.attempts}`);
    }

    // update status & audit 
    task.status = resultsFailed ? TaskQueueItemStatusOutcome.ERROR : TaskQueueItemStatusOutcome.SUCCESS;
    task.auditTrail = (task.auditTrail || []);
    task.auditTrail.push({
      attempts: task.attempts,
      timestamp: DateTime.utc().toMillis(),
      outcome: task.status,
      payload: resultsFailed ? (result.error || result.message) : result.data
    });


    if (task.status === TaskQueueItemStatusOutcome.SUCCESS) {
      // check recurrence & re scheduled if applicable 
      switch (task.recurrence) {
        case TaskQueueItemRecurrence.HOURLY: {
          task.status = TaskQueueItemStatusOutcome.QUEUED;
          task.attempts = 0;
          task.runDate = DateTime.fromMillis(task.runDate || DateTime.utc().toMillis()).plus({ hour: 1 }).toMillis();
          break;
        }
        case TaskQueueItemRecurrence.DAILY: {
          task.status = TaskQueueItemStatusOutcome.QUEUED;
          task.attempts = 0;
          task.runDate = DateTime.fromMillis(task.runDate || DateTime.utc().toMillis()).plus({ day: 1 }).toMillis();
          break;
        }
        case TaskQueueItemRecurrence.WEEKLY: {
          task.status = TaskQueueItemStatusOutcome.QUEUED;
          task.attempts = 0;
          task.runDate = DateTime.fromMillis(task.runDate || DateTime.utc().toMillis()).plus({ week: 1 }).toMillis();
          break;
        }
        case TaskQueueItemRecurrence.MONTHLY: {
          task.status = TaskQueueItemStatusOutcome.QUEUED;
          task.attempts = 0;
          task.runDate = DateTime.fromMillis(task.runDate || DateTime.utc().toMillis()).plus({ month: 1 }).toMillis();
          break;
        }
        case TaskQueueItemRecurrence.YEARLY: {
          task.status = TaskQueueItemStatusOutcome.QUEUED;
          task.attempts = 0;
          task.runDate = DateTime.fromMillis(task.runDate || DateTime.utc().toMillis()).plus({ year: 1 }).toMillis();
          break;
        }
      }
    }

    // persist/update task
    return this.taskQueueItemDataService.updateTask(task);

  }
  // #endregion

}