import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { IUser } from "@blockspaces/shared/models/users";
import { HttpResponse, HttpService } from "@blockspaces/shared/services/http";
import { Injectable, Inject, HttpStatus } from "@nestjs/common";
import { AppIdService } from "../../app-id";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { ENV_TOKEN, EnvironmentVariables } from "../../env";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { UserNotificationsService } from "../../notifications/services/UserNotificationsService";
import { SecretService } from "../../secrets/services/SecretService";
import { SecretType } from "../../secrets/types/secret";
// TODO: Can make dynamic if different nodes are required.
const _node: string = "tate";
const _nodeId: string = "e2eNode";
@Injectable()
export class E2eService {
  constructor(
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    private readonly db: ConnectDbDataContext,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly secretService: SecretService,
    private readonly appIdService: AppIdService,
    private readonly httpService: HttpService,
    private readonly userNotificationsService: UserNotificationsService,
  ) {
    logger.setModule(this.constructor.name);
  }

  async resetTestNode(user: IUser): AsyncApiResult<string> {

    // Delete the "e2eNode" lightning node and recreate document.
    await this.db.lightningNodes.findOneAndDelete({ nodeId: _nodeId });
    const createdNode: LightningNodeReference = await this.db.lightningNodes.create({
      nodeId: "e2eNode",
      apiEndpoint: `https://${_node}.ln.blockspaces.com`,
      gossipEndpoint: `143.244.162.128:9737`
    });

    if(createdNode){
      try {
      // wipe node.
        const wipeNode: HttpResponse = await this.httpService.request({
          method: "GET",
          url: `http://143.244.162.128:1998/wipe`,
          params: {
            name: _node
          },
          validErrorStatuses: [HttpStatus.BAD_REQUEST, HttpStatus.FORBIDDEN, HttpStatus.GATEWAY_TIMEOUT, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.REQUEST_TIMEOUT],
          headers: {
            Authorization: `Bearer ${user.accessToken}`
          }
        });

        if(wipeNode.status >= 200 && wipeNode.status < 300){
          const gen6Blocks: ApiResult<string> = await this.gen6Blocks(user);
          if(gen6Blocks.isSuccess){
            return ApiResult.success(`${createdNode.apiEndpoint} is ready to be claimed.`);
          } else {
            this.logger.error(`${wipeNode.statusText}`, null, wipeNode);
            return ApiResult.failure(`${wipeNode.statusText}`, wipeNode.data);
          }
        } else {
          this.logger.error(`${wipeNode.statusText}`, null, wipeNode);
          return ApiResult.failure(`${wipeNode.statusText}`, wipeNode.data);
        }
      } catch (error) {
        this.logger.error(error.message, error, user);
        return ApiResult.failure(`${error.message}.`);
      }
    } else {
      this.logger.error(`Lightning Nodes "e2eNode" was not created in Mongo. Not cannot be claimed.`);
      return ApiResult.failure(`Lightning Nodes "e2eNode" was not created in Mongo. Not cannot be claimed.`);
    }
  }
  async gen6Blocks(user: IUser): AsyncApiResult<string> {
    const gen6Blocks: HttpResponse = await this.httpService.request({
      method: "GET",
      url: `http://143.244.162.128:1998/generate`,
      params: {
        num: 6
      },
      validErrorStatuses: [HttpStatus.BAD_REQUEST, HttpStatus.FORBIDDEN, HttpStatus.GATEWAY_TIMEOUT, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.REQUEST_TIMEOUT],
      headers: {
        Authorization: `Bearer ${user.accessToken}`
      }
    });
    if(gen6Blocks.status >= 200 && gen6Blocks.status < 300){
      return ApiResult.success(`6 Blocks has been created.`);
    } else {
      this.logger.error(`${gen6Blocks.statusText}`, null, gen6Blocks);
      return ApiResult.failure(`${gen6Blocks.statusText}`, gen6Blocks.data);
    }
  }

  async paymentRequest(data: {payment_request: string, timeout_seconds: Number}, user: IUser): AsyncApiResult<boolean> {

    const paymentRequest: HttpResponse = await this.httpService.request({
      method: "POST",
      url: `https://ben1.ln.blockspaces.com/v2/router/send`,
      data: data,
      validErrorStatuses: [HttpStatus.BAD_REQUEST, HttpStatus.FORBIDDEN, HttpStatus.GATEWAY_TIMEOUT, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.REQUEST_TIMEOUT],
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        "Grpc-Metadata-macaroon": "0201036c6e6402f801030a104cb4ff5f8ecf680fb82b49c810f7559d1201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e657261746512047265616400000620c4182393da98ede2e18f380d772425997969fdd3f95d0ca8ffaef1706530cb5d"
      }
    });
    if(paymentRequest.status >= 200 && paymentRequest.status < 300){
      return ApiResult.success();
    } else {
      this.logger.error(`${paymentRequest.statusText}`, null, paymentRequest);
      return ApiResult.failure();
    }
  }

  async createInvoice(user: IUser): AsyncApiResult<any> {

    const paymentRequest: HttpResponse = await this.httpService.request({
      method: "POST",
      url: `https://ben1.ln.blockspaces.com/v1/invoices`,
      data: {
        "value": 50,
        "memo": "e2e-Testing"
      },
      validErrorStatuses: [HttpStatus.BAD_REQUEST, HttpStatus.FORBIDDEN, HttpStatus.GATEWAY_TIMEOUT, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.REQUEST_TIMEOUT],
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        "Grpc-Metadata-macaroon": "0201036c6e6402f801030a104cb4ff5f8ecf680fb82b49c810f7559d1201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e657261746512047265616400000620c4182393da98ede2e18f380d772425997969fdd3f95d0ca8ffaef1706530cb5d"
      }
    });
    if(paymentRequest.status >= 200 && paymentRequest.status < 300){
      return ApiResult.success(paymentRequest.data.payment_request);
    } else {
      this.logger.error(`${paymentRequest.statusText}`, null, paymentRequest);
      return ApiResult.failure();
    }
  }

  async createUserNotification(user: IUser): AsyncApiResult<boolean> {
    const result = await this.userNotificationsService.sendUserNotification({
      user_id: user.id,
      tenant_id: user.activeTenant?.tenantId,
      title: "e2e testing",
      message: "Some awe inspiring message",
      action_url: "mailto:support@blockspaces.com"
    });
    if(result){
      return ApiResult.success();
    }
    return ApiResult.failure();
  }

  async test(user: IUser): AsyncApiResult<IUser> {
    return ApiResult.success(user);
  }

  /**
   * Purge test users from the system.
   *
   * @returns success or fail
   */
  async purgeE2E(data: string[]): AsyncApiResult<string[]> {
    try {
      // Read purge file.
      // const file = await readFile(path.join(__dirname, "../../../../e2e/cypress/fixtures/PurgeUsers.json"));
      const purge = data;
      if (purge.length === 0) {
        return ApiResult.success([]);
      }
      // this.logger.debug(`E2E_PURGE_TEST_USER: emails to purge ${JSON.stringify(purge)}`);

      // LOOP EACH E2E USER IN REVERSE ORDER AND REMOVE FROM ARRAY
      for (let i = purge.length - 1; i >= 0; i--) {
        // USER TO PURGE
        const userData: IUser = await this.db.users.findOne({ email: purge[i] });
        if (!userData) {
          // Without finding the user in mongo we cannot clean up AppId or Secrets. Log and on to the next purge.
          this.logger.warn(`E2E User was not found in MongoDb ${purge[i]}.`);
          continue;
        }

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
              secretsResponse = await this.secretService.delete(
                {
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
          this.db.users.findOneAndDelete({ id: userData.id }),
          this.db.cart.findOneAndDelete({ userId: userData.id }),
          this.db.connectSubscriptionInvoices.findOneAndDelete({ userId: userData.id }),
          this.db.connectSubscriptions.findOneAndDelete({ userId: userData.id }),
          this.db.lightningNodes.findOneAndDelete({ tenantId: userData.activeTenant?.tenantId }),
          this.db.tenants.findOneAndDelete({ tenantId: userData.activeTenant?.tenantId }),
          this.db.userSecrets.findOneAndDelete({ userId: userData.id }),
          this.db.lightningBalances.findOneAndDelete({ tenantId: userData.activeTenant?.tenantId }),
          this.db.userNetworks.findOneAndDelete({ userId: userData.id })
        ]);

        // const successfulDeletes = deletedDocuments.filter(doc => doc != null);
        const unsuccessfulDeletes = deletedDocuments.filter((doc) => doc == null);

        if (unsuccessfulDeletes.length > 0) {
          this.logger.warn(`Unsuccessful Purge from mongo: ${unsuccessfulDeletes}`);
        }

        // REMOVE FROM LIST.
        purge.splice(i, 1);
      }

      // Write new file with purged users removed.
      // await writeFile(path.join(__dirname, "../../../../e2e/cypress/fixtures/PurgeUsers.json"), JSON.stringify(purge));
      if (!purge) {
        this.logger.warn(`Purge complete. The following users have not been purged: ${purge}`);
      }
      return ApiResult.success(purge);
    } catch (e) {
      this.logger.error("Purge E2E: " + e.message, e);
      return ApiResult.failure();
    }
  }
}
