import { Inject, Injectable } from "@nestjs/common";
import { HaproxyService } from "../../haproxy/services/HaproxyService";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { AddEndpointDto, GetEndpointsResponseDto, UpdateEndpointDto } from "@blockspaces/shared/dtos/endpoints";
import { Endpoint } from "@blockspaces/shared/models/endpoints/Endpoint";
import { Network, NetworkId, UserNetworkStatus } from "@blockspaces/shared/models/networks";
import { BillingTier, BillingTierCode } from "@blockspaces/shared/models/network-catalog/Tier";
import { NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { DateTime } from 'luxon';
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { EndpointsDashboardQueries } from "../../node-monitoring-db";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { UserNetworkDataService } from "../../user-network/services/UserNetworkDataService";
import { FeatureFlagsService } from "../../feature-flags";
import { UserNotificationsService } from "../../notifications/services";

@Injectable()
export class EndpointsService {

  constructor(
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    private readonly haproxyService: HaproxyService,
    private readonly db: ConnectDbDataContext,
    private readonly endpointUsageDataService: EndpointsDashboardQueries,
    private readonly userNetworkDataService: UserNetworkDataService,
    public readonly featureFlagService: FeatureFlagsService,
    private readonly userNotificationsService: UserNotificationsService
  ) {
    logger.setModule(this.constructor.name);
  }

  // TODO: [BSPLT-1656] Create a mongodb collection that identifies the HAProxy Backend that will process this endpoint
  private getProvider = async (networkId: string): Promise<string> => {
    const network: Network = await this.db.networks.findById(networkId);
    let provider: string = network?.protocolRouterBackend;
    return provider;
  }

  /**
   * 
   * AddEndpoint - method to add an endpoint to the protocol router
   * 
   * @param  {string} endpointId - a unique id (guid) for the endpoint
   * @param  {string} tenantId - the tenant id of the owner of the endpoint
   * @param  {string} networkId - the network id of the requested endpoint
   * @param  {string} alias - the alias of the endpoint
   * @param  {string=} token - the optional token to add to the endpoint for additional security
   * 
   */
  async addEndpoint(endpoint: AddEndpointDto, tenantId: string): Promise<void> {
    const provider = await this.getProvider(endpoint.networkId);
    await this.haproxyService.addMapEntry(endpoint.endpointId, provider);
    await this.db.endpoints.create({ endpointId: endpoint.endpointId, tenantId: tenantId, active: true, description: endpoint.description, networkId: endpoint.networkId, alias: endpoint.alias, token: endpoint.token })
    return;
  }

  /**
   * 
   * UpdateEndpoint - method to update an existing endpoint to the protocol router
   * 
   * @param  {UpdateEndpointDto} - the alias and token to update on the endpoint
   * @param  {string} endpointId - the Id of the endpoint to update
   * @param  {string} tenantId - the tenant id of the owner of the endpoint
   * 
   */
  async updateEndpoint(endpoint: UpdateEndpointDto, endpointId: string, tenantId: string): Promise<void> {
    await this.db.endpoints.updateOneAndSave({ endpointId: endpointId, tenantId: tenantId }, { alias: endpoint.alias, description: endpoint.description, token: endpoint.token })
    return;
  }

  /**
     * 
     * deleteEndpoint - method to delete an endpoint to the protocol router
     * 
     * @param  {string} endpointId - the endpoint id 
     * 
     */
  async deleteEndpoint(endpointId: string, tenantId: string): Promise<void> {
    await this.db.endpoints.findOneAndUpdate({ endpointId: endpointId, tenantId: tenantId }, { $set: { active: false } });
    await this.haproxyService.deleteMapEntry(endpointId);
    return;
  }

  /**
   * Re-create ha proxy entry and mark endpoint as active
   * @param networkId 
   * @param endpointId 
   * @param tenantId 
   */
  async enableEndpoint(networkId: string, endpointId: string, tenantId: string): Promise<void> {
    const provider = await this.getProvider(networkId);
    await Promise.allSettled([
      this.db.endpoints.findOneAndUpdate({ endpointId: endpointId, tenantId: tenantId }, { $set: { active: true } }),
      this.haproxyService.addMapEntry(endpointId, provider)
    ]);
  }

  /**
     * 
     * GetEndpoints - method to get endpoints for a tenant
     * 
     * @param  {string} tenantId - the tenant id of the owner of the endpoint
     * 
     * @returns Array of
     * @returns string endpointId - the route id of the endpoint
     * @returns string networkId - the network id of the requested endpoint
     * @returns string alias - the alias of the endpoint
     * @returns  string token - the optional token to add to the endpoint for additional security
     * 
     */
  async getEndpoints(tenantId: string, networkId: string): Promise<GetEndpointsResponseDto> {
    const endpoints = await this.db.endpoints.find({ tenantId: tenantId, networkId: networkId, active: true });
    const response = await endpoints.map((endpoint) => { return { endpointId: endpoint.endpointId, tenantId: endpoint.tenantId, active: endpoint.active, networkId: endpoint.networkId, description: endpoint.description, alias: endpoint.alias, token: endpoint.token, endpointUrl: `${this.env.protocolRouter.baseUrl}${endpoint.endpointId}` } });
    return response;
  }

  /**
   * Used By Cron Job
   */
  async processFreeEndpoints(): Promise<void> {
    const FIRST_OF_MONTH = 1;
    const today = DateTime.utc();
    const batchSize = 25;
    const freeTier = await this.db.billingTier.findOne({ code: BillingTierCode.Free });
    const infrastructureCategory = await this.db.networkPriceBillingCategories.findOne({ code: NetworkPriceBillingCodes.Infrastructure });


    if (today.day === FIRST_OF_MONTH) {
      // enable all disabled 
      const temporarilyPausedUserCount = await this.db.userNetworks.find({ billingCategory: infrastructureCategory, billingTier: freeTier, status: { $in: [UserNetworkStatus.TemporarilyPaused] } }).count();
      const batch = Array(Math.floor(temporarilyPausedUserCount / batchSize)).fill(batchSize);
      if (temporarilyPausedUserCount % batchSize > 0) batch.push(temporarilyPausedUserCount % batchSize);
      await Promise.allSettled(batch.map((limit, index) => this.reEnableFreeEndpoints(freeTier, infrastructureCategory, limit, (index * batchSize))));

    } else {
      const systemFeatureFlags = await this.featureFlagService.getSystemFeatureFlagList();
      const LIMIT = systemFeatureFlags.find(x => x.FreeWeb3EndpointTransactionLimit).FreeWeb3EndpointTransactionLimit;
      const activeFreeUserCount = await this.db.userNetworks.find({ billingCategory: infrastructureCategory, billingTier: freeTier, status: null }).count();
      const batch = Array(Math.floor(activeFreeUserCount / batchSize)).fill(batchSize);
      if (activeFreeUserCount % batchSize > 0) batch.push(activeFreeUserCount % batchSize);
      await Promise.allSettled(batch.map((limit, index) => this.checkFreeEndpointsUsageHelper(LIMIT, freeTier, infrastructureCategory, limit, (index * batchSize))));
    }

  }

  private async reEnableFreeEndpoints(freeTier: BillingTier, infrastructureCategory: NetworkPriceBillingCategory, take: number, skip: number) {
    const userNetworks = await this.db.userNetworks.find({ billingCategory: infrastructureCategory, billingTier: freeTier, status: { $in: [UserNetworkStatus.TemporarilyPaused] } })
      .limit(take)
      .skip(skip);

    for await (const userNetwork of userNetworks) {
      try {
        const userDetails = await this.db.users.findOne({ id: userNetwork.userId });
        const userEndpoints = await this.getEndpoints(userDetails.activeTenant?.tenantId, userNetwork.networkId);

        userNetwork.status = null;
        await this.userNetworkDataService.update(userNetwork);
        // enable endpoints
        await Promise.allSettled(userEndpoints.map(x => this.enableEndpoint(userNetwork.networkId, x.endpointId, x.tenantId)));

      } catch (error) {
        this.logger.error(`Error inside reEnableFreeEndpoints`, error);
      }
    }
  }

  private async checkFreeEndpointsUsageHelper(LIMIT: number, freeTier: BillingTier, infrastructureCategory: NetworkPriceBillingCategory, take: number, skip: number) {

    const startOfMonth = DateTime.utc().startOf('month');
    const today = DateTime.utc();

    const userNetworks = await this.db.userNetworks.find({ billingCategory: infrastructureCategory, billingTier: freeTier, status: null })
      .limit(take)
      .skip(skip);

    for await (const userNetwork of userNetworks) {
      try {
        const userDetails = await this.db.users.findOne({ id: userNetwork.userId });
        const userEndpoints = await this.getEndpoints(userDetails.activeTenant?.tenantId, userNetwork.networkId);
        const networkUsageAmounts = await this.endpointUsageDataService.getNetworkUsageByInterval(startOfMonth, today, userEndpoints, NetworkDataInterval.DAILY);
        const totalUsage = networkUsageAmounts?.reduce((total, data) => total + Number(data.usage), 0) ?? 0;
        const _80_Percent = LIMIT * 0.80;
        if (totalUsage >= LIMIT) {
          // mark user network as Temporarily Paused
          userNetwork.status = UserNetworkStatus.TemporarilyPaused;
          await this.userNetworkDataService.update(userNetwork);
          // disable endpoints
          await Promise.allSettled(userEndpoints.map(x => this.deleteEndpoint(x.endpointId, x.tenantId)));
        } else if (totalUsage >= _80_Percent && totalUsage < LIMIT) {
          // alert user
          await this.userNotificationsService.sendUserNotification({
            tenant_id: userDetails.activeTenant?.tenantId,
            user_id: userDetails.id,
            title: `You have reached 80% of available free transactions for ${userNetwork.networkId}`,
            message: `Check out or paid services for unlimited transactions`
          });
        }

      } catch (error) {
        this.logger.error(`Error inside checkFreeEndpointsUsageHelper`, error);
      }
    }


  }

}

