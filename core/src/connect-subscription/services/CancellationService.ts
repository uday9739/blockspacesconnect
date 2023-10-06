import { Inject, Injectable } from "@nestjs/common";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { IUser } from "@blockspaces/shared/models/users";
import { NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { UserNetworkDataService } from "../../user-network/services/UserNetworkDataService";
import { UserDataService } from "../../users/services/UserDataService";
import { NetworkId, UserNetworkStatus } from "@blockspaces/shared/models/networks";
import { EndpointsService } from "../../endpoints/services";
import { ValidationException, BadRequestException, NotFoundException } from "../../exceptions/common";
import { TaskQueueItemDataService } from "../../task-queue/services/TaskQueueItemDataService";
import { TaskQueueItemTaskType } from "@blockspaces/shared/models/task-queue/TaskQueueItemTaskType";
import { TaskQueueItemRecurrence } from "@blockspaces/shared/models/task-queue/TaskQueueItem";
import { DateTime } from "luxon";
import { LndService } from "../../networks/lightning/lnd/services/LndService";
import { LightningWalletService } from "../../networks/lightning/wallet/services/LightningWalletService";
import { JiraService } from "../../jira/services/JiraService";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";

@Injectable()
export class CancellationService {
  constructor(
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly userNetworkDataService: UserNetworkDataService,
    private readonly userDataService: UserDataService,
    private readonly endpointsService: EndpointsService,
    private readonly taskQueueItemDataService: TaskQueueItemDataService,
    private readonly lightningWalletService: LightningWalletService,
    private readonly lndService: LndService,
    private readonly jiraService: JiraService,
    private readonly dataContext: ConnectDbDataContext
  ) {
    logger.setModule(this.constructor.name);
  }
  /**
   * This will Disable (soft-delete) all associated resource for a given network and its billing category. 
   * Used to prevent user from using services. for the rest of billing cycle 
   * @param userId 
   * @param networkId i.e. lighting , ethereum , optimism 
   * @param billingCategoryId i.e. Developer_Endpoint, Lighting , Enterprise_Connect  ,... etc
   */
  async disableNetworkServiceOffering(user: IUser, networkId: string, billingCategory: NetworkPriceBillingCategory): Promise<void> {

    if (!billingCategory) throw new ValidationException(`billingCategory is required`);

    const userNetworkEntry = await this.userNetworkDataService.findByUserAndNetwork(user.id, networkId, billingCategory._id);
    if (userNetworkEntry.status === UserNetworkStatus.PendingCancelation) return;

    // update user-network status
    userNetworkEntry.status = UserNetworkStatus.PendingCancelation;
    await this.userNetworkDataService.update(userNetworkEntry);


    // clean up billingCategory related resources 
    switch (billingCategory.code) {
      case NetworkPriceBillingCodes.Infrastructure: {
        // remove user details connectNetworks
        user.connectedNetworks = user.connectedNetworks?.filter(x => x !== networkId);
        const updateUserResponse = await this.userDataService.update(user);
        if (updateUserResponse.status !== ApiResultStatus.Success) {
          throw new BadRequestException("error updating user");
        }
        user = updateUserResponse.data;

        const endPoints = await this.endpointsService.getEndpoints(user.activeTenant?.tenantId, networkId);
        await Promise.all(endPoints.map(x => this.endpointsService.deleteEndpoint(x.endpointId, user.activeTenant?.tenantId)));
        break;
      }
      case NetworkPriceBillingCodes.MultiWebApp: {

        if (networkId === NetworkId.LIGHTNING) {
          await this.handleBipCancelationRequestHelper(user);
        }
        break;
      }
      default:
        break;
    }

  }


  /**
   * This will Terminate all associated resource for a given network and its billing category. 
   * Only to be used after all service usage has been reported and accounted for 
   * @param userId 
   * @param networkId i.e. lighting , ethereum , optimism 
   * @param billingCategoryId i.e. Developer_Endpoint, Lighting , Enterprise_Connect  ,... etc
   */
  async terminateNetworkServiceOffering(user: IUser, networkId: string, billingCategory: NetworkPriceBillingCategory): Promise<void> {

    if (!billingCategory) throw new ValidationException(`billingCategory is required`);

    const userNetworkEntry = await this.userNetworkDataService.findByUserAndNetwork(user.id, networkId, billingCategory._id);

    // clean up billingCategory related resources 
    switch (billingCategory.code) {
      case NetworkPriceBillingCodes.Infrastructure: {
        // delete user networks entry
        await this.userNetworkDataService.deleteUserNetwork(userNetworkEntry._id);
        break;
      }
      case NetworkPriceBillingCodes.MultiWebApp: {

        if (networkId === NetworkId.LIGHTNING) {
          if (userNetworkEntry.status !== UserNetworkStatus.PendingCancelation) {
            userNetworkEntry.status = UserNetworkStatus.PendingCancelation;
            await this.userNetworkDataService.update(userNetworkEntry);
            await this.handleBipCancelationRequestHelper(user);
          }
        }
        break;
      }
      default:
        break;
    }

  }

  /**
   * This will handle resuming all paused resources associated  for a given network and its billing category. 
   * @param user 
   * @param networkId 
   * @param billingCategory 
   * @returns 
   */
  async resumeNetworkServiceOffering(user: IUser, networkId: string, billingCategory: NetworkPriceBillingCategory): Promise<void> {

    if (networkId === NetworkId.LIGHTNING) throw new ValidationException(`Lightning is pending cancelation`);
    if (!billingCategory) throw new ValidationException(`billingCategory is required`);

    // update user-network status
    const userNetworkEntry = await this.userNetworkDataService.findByUserAndNetwork(user.id, networkId, billingCategory._id);
    if (!userNetworkEntry) throw new NotFoundException(`user network not found userId:${user.id},networkId:${networkId}`);

    userNetworkEntry.status = null;
    await this.userNetworkDataService.update(userNetworkEntry);


    // clean up billingCategory related resources 
    switch (billingCategory.code) {
      case NetworkPriceBillingCodes.Infrastructure: {
        // add user details connectNetworks
        if (user.connectedNetworks.indexOf(networkId) === -1) user.connectedNetworks?.push(networkId);
        const updateUserResponse = await this.userDataService.update(user);
        if (updateUserResponse.status !== ApiResultStatus.Success) {
          throw new BadRequestException("error updating user");
        }
        user = updateUserResponse.data;
        break;
      }
      case NetworkPriceBillingCodes.MultiWebApp: {
        break;
      }
      default:
        break;
    }

  }

  // #region MultiWebApp 

  // #region BIP 

  /**
   * Confirm Node's Channels are closed and Wallet is empty.
   * @param tenantId 
   * @returns True if node is ready to be wiped, false if node is not ready to be wiped 
   */
  private async isBipNodeReadyToCancel(tenantId: string): Promise<boolean> {
    const BTC_DUST_LIMIT = 546;
    // confirm node has no active channels
    const channels = await this.lndService.getChannelsList(tenantId);
    if (channels?.channelsList?.filter(x => x.active)?.length > 0) return false;

    // confirm node wallet is empty
    const walletResults = await this.lightningWalletService.getWalletBalance(tenantId);
    if (!walletResults) return false;
    if (Number(walletResults.total_balance) > BTC_DUST_LIMIT) return false;

    return true;
  }

  /**
   * Create Jira ticket to handle channel close and cron job to check wallet status
   * @param user 
   */
  private async handleBipCancelationRequestHelper(user: IUser): Promise<void> {
    // Will need to refactor when we introduce LIGHTNING_NODE infrastructure 
    const userId = user.id;
    const tenantId = user.activeTenant?.tenantId ;

    try {
      await this.jiraService.createInternalIssue(`Close BIP Lightning node Channels`, `
          The following user has canceled BIP services. Please confirm with user once channel(s) have been closed, so they can clear their node wallet.
          Once their node wallet is empty a ticket to decommission will be automatically created. 
          User email : ${user.email}
          User id : ${userId}
          TenantId: ${tenantId}
          Company: ${user.companyName}
      `);
    } catch (error) {
      this.logger.error(`Error creating Jira Internal Issue for Bip Cancelation Request.`, error);
    }


    // create cron job to check wallet status
    const task = await this.taskQueueItemDataService.createScheduledTask(TaskQueueItemTaskType.BIP_NODE_TERMINATION, TaskQueueItemRecurrence.HOURLY, {
      userId,
      tenantId
    }, DateTime.utc().plus({ hour: 1 }).toMillis());
  }

  /**
   * Create Jira ticket to Decommission Lightning Node
   * @param tenantId 
   * @param user 
   */
  private async createBipNodeWipeDevOpsRequest(tenantId: string, user: IUser): Promise<void> {

    try {
      await this.jiraService.createInternalIssue(`Decommission Lightning Node`, `
        The following user has canceled BIP services. Please decommission lightning node.
        User email : ${user.email}
        User id : ${user.id}
        TenantId: ${tenantId}

        Refer to https://blockspaces.atlassian.net/wiki/spaces/GRC/pages/399802452/Lightning+Cancellation+Process 
      `);
    } catch (error) {
      this.logger.error(`Error creating Jira Internal Issue for Devops to decommission Lightning Node for Bip Cancelation Request.`, error);
    }

  }

  /**
   * Used by Cron job to process TaskQueueItemTaskType.BIP_NODE_TERMINATION
   * @param tenantId 
   * @returns True if BipNodeTermination is complete
   */
  async processBipNodeTermination(tenantId: string, userId: string): Promise<boolean> {
    if (await this.isBipNodeReadyToCancel(tenantId) === false) return false;

    // clean up user network reference 
    const user = await this.userDataService.getUserById(userId);
    user.connectedNetworks = user.connectedNetworks?.filter(x => x !== NetworkId.LIGHTNING);
    const updateUserResponse = await this.userDataService.update(user);
    if (updateUserResponse.status !== ApiResultStatus.Success) {
      //
    } else {
      const billingCategory = await this.dataContext.networkPriceBillingCategories.findOne({ code: NetworkPriceBillingCodes.MultiWebApp });
      const userNetworkEntry = await this.userNetworkDataService.findByUserAndNetwork(user.id, NetworkId.LIGHTNING, billingCategory._id);
      await this.userNetworkDataService.deleteUserNetwork(userNetworkEntry._id);
    }

    // create ticket to wipe node
    await this.createBipNodeWipeDevOpsRequest(tenantId, user);

    return true;
  }
  // #endregion

  // #endregion


}