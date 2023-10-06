import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { LightningInvoiceService } from "../../invoices/services/LightningInvoiceService";
import { SnsTransportClient } from "../../../../sns-transport/sns-transport-client";
import { catchError, firstValueFrom } from "rxjs";
import { DEFAULT_LOGGER_TOKEN } from "../../../../logging/constants";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { ENV_TOKEN, EnvironmentVariables } from "../../../../env";
import { LndService } from "../../lnd/services/LndService";
import { EmailService } from "../../../../notifications/services";

@Injectable()
export class LightningTasksService {
  constructor(
    private readonly db: ConnectDbDataContext,
    private readonly lightningInvoiceService: LightningInvoiceService,
    private readonly lndService: LndService,
    private readonly emailService: EmailService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    @Inject('SNS_CLIENT') private readonly snsClient: SnsTransportClient,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
  ) { }

  /**
   * 
   * refreshAllObjectsForAllUsers - called to retrieve all the transactions posted to a Lightning Node to trigger events
   *
   * @returns 
   * 
   */
  refreshAllObjectsForAllUsers = async (): Promise<void> => {
    // TODO: [BSPLT-2456] Remove the feature flag for Cyclr when removing that feature flag
    const lightningUsersWithCyclr = await this.db.users.find({ "featureFlags.cyclrUserBIP": true, connectedNetworks: 'lightning' || 'lightning-reporter' });
    for (let i = 0; i < lightningUsersWithCyclr?.length; i++) {
      await this.lightningInvoiceService.refreshAllObjects(lightningUsersWithCyclr[i].tenants[0], lightningUsersWithCyclr[i])
    }
    return;
  };

  private provisionSingleLightningNode = async () => {
    try {
      const provisionerResponse = await firstValueFrom(this.snsClient.send('send', JSON.stringify({ category: "lightningNodeConsumed" })).pipe(
        catchError((error) => {
          this.logger.error(error.response.data);
          throw new InternalServerErrorException('Lightning node Provisioner request failed.');
        })));
      if (provisionerResponse.$metadata.httpStatusCode !== 200) {
        throw new InternalServerErrorException('Lightning node Provisioner request failed.');
      }
      return {success: true, data: provisionerResponse};
    } catch (e) {
      this.logger.error('Lightning node Provisioner request failed.');
      return {success: false, error: e};
    }
  };

  /**
   * provisionLightningNodes - gets the number of nodes in the pool and provisions 
   * more until the pool reaches the max size 
   */
  provisionLightningNodes = async () => {
    if (!this.env.isProduction) {
      this.logger.info('Not provisioning Lightning node as not in production environment.');
      return {success: true, data: 'Not provisioning Lightning node as not in production environment.'};
    }
    const poolNodes = await this.db.lightningNodes.find({ 
      tenantId: null
    });
    const poolNodeCount = poolNodes.length;
    const maxPoolSize = parseInt(this.env.lightning.maxNodePoolSize ?? '3');
    if (poolNodeCount >= maxPoolSize) { 
      this.logger.info(`Pool full (${poolNodeCount}) - not provisioning Lightning nodes.`);
      return {success: true, data: `Pool full (${poolNodeCount}) - not provisioning Lightning nodes.`};
    } else {
      this.logger.info(`Pool contains ${poolNodeCount}. provisioning ${maxPoolSize - poolNodeCount} nodes`);
    }
    const results = [];
    for (let i = 0; i < maxPoolSize - poolNodeCount; i++) {
      const result = await this.provisionSingleLightningNode();
      results.push(result);
    }
    const failedResults = results.filter((result) => !result.success);
    if (failedResults.length > 0) {
      this.logger.error(`Failed to provision ${failedResults.length} nodes.`);
      return {success: false, error: `Failed to provision ${failedResults.length} nodes.`};
    } else {
      this.logger.info(`Successfully provisioned ${results.length} nodes.`);
      return {success: true, data: `Successfully provisioned ${results.length} nodes.`};
    }
  };

  lockedNodesCheck = async () => {
    try {
      const lockedNodes: string[] = []
      const lightningNodes = await this.db.lightningNodes.find({tenantId: {$exists: true}})
      lightningNodes.map(async (node) => {
        const info = await this.lndService.getInfo(node.tenantId);
        if (info["message"] && info["message"].startsWith("wallet locked")) {
          const tenant = await this.db.tenants.findOne({ tenantId: node.tenantId })
          const user = await this.db.users.findOne({ id: tenant.ownerId })
          const host = this.env.isProduction ? "app.blockspaces.com" : this.env.isStaging ? "staging.blockspaces.com" : "localhost"
          const uri = `https://${host}/multi-web-app/lightning?modal=unlock`
          const emailTemplateId = "d-6ef161ea09484557b0acc69252c57288";
          const emailTemplateData = { 
            uri,
          };
          const emailConfig = {
            user_id: tenant.ownerId,
            email_id: user.email,
            dynamic_email_data: emailTemplateData,
            dynamic_email_template_id: emailTemplateId,
            title: `Your Lightning Node needs to be unlocked!`,
            message: `Please unlock your node to continue using it.`,
            action_url: uri
          };
          await this.emailService.sendEmail(emailConfig)
          lockedNodes.push(node.tenantId)
        }
      })
      this.logger.info(`TasksRunnerService(LOCKED_NODES_CHECK): Emailed ${lockedNodes.length} locked nodes.`);
      return {success: true, data: "Successfully notified users to unlock their nodes."};
    } catch (e) {
      return {success: false, data: "Failed to notify users to unlock their nodes."};
    }
  }
}
