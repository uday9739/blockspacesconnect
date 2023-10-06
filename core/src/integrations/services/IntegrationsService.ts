import { Inject, Injectable } from "@nestjs/common/decorators";
import { CyclrService, CyclrAuthTypes, CyclrCycle, CyclrAccountConnector } from "../../cyclr/services/CyclrService";
import { ExternalIntegration } from "@blockspaces/shared/models/external-integration";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { BadRequestException, UnauthorizedException } from "../../exceptions/common";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { IntegrationDto, ConnectorDto } from "@blockspaces/shared/dtos/integrations";
import { ApiKeyService } from "../../auth/services/ApiKeyService";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { WebhookService } from "../../webhooks/services/WebhookService";
import { WebhookEventTypes, WebhookSubscription } from "../../../../shared/models/webhooks/WebhookTypes";

export type InstalledIntegration = {
  tenantId: string;
  integration: IntegrationDto;
};

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly cyclrService: CyclrService,
    private readonly db: ConnectDbDataContext,
    private readonly apiKeyService: ApiKeyService,
    private readonly webhookService: WebhookService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
  ) {
    this.logger.setModule(IntegrationsService.name)
  }

  /**
   * 
   * getAvailableIntegrations - Gets a list of integrations and the associated templates
   * 
   * @returns {@link IntegrationDto[]} - list of integrations and associated templates
   * 
   * @throws {@link ServiceUnavailableException} - An error when the Cyclr Service is unavailable
   * @throws {@link UnauthorizedException} - An error when the data passed is invalid
   * 
   */
  async getAvailableIntegrations(tenantId: string): Promise<IntegrationDto[]> {
    let externalIntegrationDbResponse: ExternalIntegration[] = [];
    let availableIntegrationsResponse: IntegrationDto[] = [];
    externalIntegrationDbResponse = await this.db.externalIntegration.find();

    availableIntegrationsResponse = await Promise.all(externalIntegrationDbResponse.map(async (externalIntegration) => {
      const tag = `integration_id:${externalIntegration.id}`;
      const tenantIntegrationStatus = await this.getIntegrationStatus(tenantId, tag)
      let integration: IntegrationDto = {
        description: externalIntegration.description,
        name: externalIntegration.name,
        integrationId: externalIntegration.id,
        installed: tenantIntegrationStatus?.installed,
        active: tenantIntegrationStatus?.active,
        connectors: []
      }
      const templates = await this.cyclrService.getTemplatesByTag(tag);
      let connectorIds: Record<string, ConnectorDto> = {};
      for (let j = 0; j < templates?.length; j++) {
        for (let k = 0; k < templates[j].connectors?.length; k++) {
          templates[j].connectors[k].systemConnector ?
            null :
            connectorIds[templates[j].connectors[k].connectorId?.toString()] = templates[j].connectors[k];
        }
      };
      for (let l = 0; l < Object.keys(connectorIds)?.length; l++) {
        const connector: ConnectorDto = Object.values(connectorIds)[l];
        integration.connectors.push(connector);
      }
      return integration;
    }));
    return availableIntegrationsResponse;
  }

  private async updateBlockSpacesConnectorSettings(tenantId: string): Promise<void> {
    const accountConnectors = await this.cyclrService.getAccountConnectors(tenantId);
    let authObject: Record<string, any> = {}
    let filteredAccountConnectors = accountConnectors?.filter((accountConnector) => accountConnector.name === "BlockSpaces" && accountConnector.authenticated === false)
    if (filteredAccountConnectors.length === 1) {
      let blockSpacesAccountConnector = filteredAccountConnectors[0];
      const apiKey = await this.apiKeyService.generate('blockspaces_connector', tenantId, 'BlockSpaces Integration Connector', 'Used to authenticate Cyclr Cycle with BlockSpaces Multiweb Platform', 'cyclr');
      authObject = {
        AuthValue: apiKey?.data,
        Properties: [{
          Name: "Hostname",
          Value: this.env.cyclr.callbackBaseUrl
        }]
      }

      await this.cyclrService.authenticateNonOAuthConnector(blockSpacesAccountConnector.accountConnectorId, tenantId, authObject);
      return
    }
  }

  /**
   * 
   * updateConnectorSettings - There are specific settings required for various connectors
   * 
   * @param  {string} tenantId - the Tenant ID 
   * 
   * @returns {Promise<void>}
   * 
   */
  async updateConnectorSettings(tenantId: string, accountConnectorId: number, parameterUpdates: any[]): Promise<void> {

    let authObject: Record<string, any> = {}
    // BlockSpaces requires an API Key and the Hostname which is the baseUrl of the current environment (i.e. dev.blockspaces.dev, staging.blockspaces.dev, etc.)
    // QuickBooks requires the environment url be set for authentication (sandbox-quickbooks.api.intuit.com for non-prod vs quickbooks.api.intuit.com for prod)
    authObject = {
      Properties:
        parameterUpdates.map((parameterUpdate) => {
          return {
            Name: parameterUpdate.name,
            Value: parameterUpdate.value
          }
        })
    }
    await this.cyclrService.authenticateNonOAuthConnector(accountConnectorId, tenantId, authObject);
    return
  };

  /**
   * 
   * activateIntegration - Activates an integration to an account 
   * 
   * @param  {string} tenantId - The integration account id (should be tenant)
   * @param  {string} integrationId - The selected integration to add
   * 
   * 
   * @throws {@link UnauthorizedException} - An error when the data passed is invalid
   * 
   */
  async activateIntegration(tenantId: string, integrationId: string): Promise<void> {
    let tag = `integration_id:${integrationId}`
    const cycles = await this.cyclrService.getCycles(tenantId, tag)
    await Promise.all(
      cycles.map(async (cycle) => {
        const runOnce = cycle.tags.filter((tag) => tag === 'run_frequency:ONCE').length > 0;
        await this.cyclrService.activateCycle(tenantId, cycle.cycleId, runOnce);
      })
    )
    await this.addWebhookSubscriptions(tenantId);
    return;
  }

  /**
   * 
   * addWebhookSubscriptions - Private function to add the appropriate webhook subscriptions based on the integration
   * 
   * @param  {string} tenantId
   * 
   * @returns Promise
   * 
   */
  private async addWebhookSubscriptions(tenantId: string): Promise<void> {
    // TODO: [BSPLT-2549] Change to look up the event types to subscribe to based on the integration being installed
    const webhookSubscription: WebhookSubscription = {
      webhookEndpoint: {
        url: this.env.cyclr.webhookUrl,
        tenantId: tenantId
      },
      eventType: [WebhookEventTypes.PAYMENT_SENT, WebhookEventTypes.PAYMENT_RECEIVED, WebhookEventTypes.ONCHAIN_RECEIVED, WebhookEventTypes.ONCHAIN_SENT]
    }
    await this.webhookService.createWebhookSubscription(webhookSubscription)
  }

  /**
   * 
   * removeWebhookSubscriptions - Private function to remove the appropriate webhook subscriptions based on the integration
   * 
   * @param  {string} tenantId
   * 
   * @returns Promise
   * 
   */
  private async removeWebhookSubscriptions(tenantId: string): Promise<void> {
    const webhookSubscription: WebhookSubscription = {
      webhookEndpoint: {
        url: this.env.cyclr.webhookUrl,
        tenantId: tenantId
      },
      eventType: [WebhookEventTypes.PAYMENT_SENT, WebhookEventTypes.PAYMENT_RECEIVED, WebhookEventTypes.ONCHAIN_RECEIVED, WebhookEventTypes.ONCHAIN_SENT]
    }
    await this.webhookService.deleteWebhookSubscription(webhookSubscription)
  }

  /**
   * 
   * addIntegration - Adds an integration to an account 
   * 
   * @param  {string} tenantId - The integration account id (should be tenant)
   * @param  {string} accountName - The integration account name (should be either Company Name or Customer Full Name)
   * @param  {string} integrationId - The selected integration to add
   * 
   * 
   * @throws {@link UnauthorizedException} - An error when the data passed is invalid
   * 
   */
  async addIntegration(tenantId: string, accountName: string, integrationId: string): Promise<Array<CyclrCycle>> {
    await this.cyclrService.createAccount(tenantId, accountName);
    let tag = `integration_id:${integrationId}`
    const templates = await this.cyclrService.getTemplatesByTag(tag)
    let cyclrCycles: CyclrCycle[] = [];

    let connectorIds: Record<string, ConnectorDto> = {};
    for (let j = 0; j < templates?.length; j++) {
      for (let k = 0; k < templates[j].connectors?.length; k++) {
        connectorIds[templates[j].connectors[k].connectorId?.toString()] = templates[j].connectors[k];
      }
    };
    await Promise.all(
      Object.keys(connectorIds).map(async (connectorId, index) => {
        const connector: ConnectorDto = Object.values(connectorIds)[index];
        const accountConnector: ConnectorDto = await this.cyclrService.installConnector(tenantId, connector.connectorId)
        if (connector.name === 'QuickBooks') {
          const parameterUpdates = [{
            name: 'ClientId',
            value: this.env.quickbooks.clientId
          }, {
            name: 'ClientSecret',
            value: this.env.quickbooks.clientSecret
          }, {
            name: 'BaseUrl',
            value: this.env.quickbooks.apiBaseUrl.substring(8)
          }]
          await this.updateConnectorSettings(tenantId, accountConnector.accountConnectorId, parameterUpdates)
        }
      })
    )

    await Promise.all(
      templates.map(async (template) => {
        const installTemplateResponse = await this.cyclrService.installTemplate(tenantId, template.templateId);
        cyclrCycles.push(installTemplateResponse)
      })
    )
    await this.updateBlockSpacesConnectorSettings(tenantId);
    return cyclrCycles;
  }

  /**
   * 
   * stopIntegration - Stops an installed integration from an account
   * 
   * @param  {string} integrationId - The installed integration
   * @param  {string} tenantId - The tenantId to remove the installed integration from
   * 
   * @returns {void} 
   * 
   */
  async stopIntegration(tenantId: string, integrationId: string): Promise<void> {
    const tag = `integration_id:${integrationId}`;
    const integrationCycles: CyclrCycle[] = await this.cyclrService.getCycles(tenantId, tag);
    await Promise.all(
      integrationCycles.map(async (integrationCycle) => {
        await this.cyclrService.deactivateCycle(tenantId, integrationCycle.cycleId);
      })
    )
    await this.removeWebhookSubscriptions(tenantId);
    return;
  }

  /**
   * 
   * removeIntegration - Removes an installed integration from an account
   * 
   * @param  {string} integrationId - The installed integration
   * @param  {string} tenantId - The tenantId to remove the installed integration from
   * 
   * @returns {void} 
   * 
   */
  async removeIntegration(integrationId: string, tenantId: string): Promise<void> {
    const tag = `integration_id:${integrationId}`;
    const integrationCycles: CyclrCycle[] = await this.cyclrService.getCycles(tenantId, tag);
    let connectorIds: Record<string, Partial<CyclrAccountConnector>> = {};
    await Promise.all(
      integrationCycles.map(async (integrationCycle) => {
        for (let k = 0; k < integrationCycle.connectors?.length; k++) {
          connectorIds[integrationCycle.connectors[k].accountConnectorId?.toString()] = integrationCycle.connectors[k];
        }
        await this.cyclrService.deleteCycle(tenantId, integrationCycle.cycleId);
      })
    )
    await Promise.all(
      Object.keys(connectorIds).map(async (connectorId, index) => {
        const connector: Partial<CyclrAccountConnector> = Object.values(connectorIds)[index];
        await this.cyclrService.deleteAccountConnector(tenantId, connector.accountConnectorId)
      })
    )

    await this.removeWebhookSubscriptions(tenantId);
    return;
  }

  async getInstalledConnectors(tenantId: string): Promise<Array<ConnectorDto>> {
    const accountConnectors = await this.cyclrService.getAccountConnectors(tenantId);
    // We don't want to return system connectors that would never need authentication
    return await accountConnectors.filter((connector) => !connector.systemConnector);
  }

  async getAccountConnector(tenantId: string, accountConnectorId: number) {
    const accountConnector = await this.cyclrService.getAccountConnector(tenantId, accountConnectorId);;
    // We don't want to return system connectors that would never need authentication
    return await accountConnector;
  }

  /**
   * 
   * getIntegrationStatus - get the current status of an integration for a tenant
   * 
   * @param  {string} tenantId - the account ID requested (tenant ID)
   * @param  {string} integrationId - the integration ID requested 
   * 
   * @returns {@string[]} the list of Installed Integration ID's
   * 
   * @throws {@link UnauthorizedException} - Invalid data passed
   * @throws {@link BadRequestException} - Invalid data returned
   * 
   */
  private async getIntegrationStatus(tenantId: string, integrationId: string): Promise<{
    integrationId: string;
    installed: boolean;
    active: boolean;
  }> {
    let cyclesResponse: CyclrCycle[] = [];
    try {
      cyclesResponse = await this.cyclrService.getCycles(tenantId, integrationId);
      // filter out the cycles that are only scheduled to run once at onboarding
      cyclesResponse = cyclesResponse.filter((cycle) => !cycle.tags.includes('run_frequency:ONCE'));
    } catch (error) {
      // do nothing
    }
    const inactive = (cycle: CyclrCycle) => !['Active', 'DeleteScheduled'].includes(cycle.status)

    const integrationStatus = {
      integrationId: integrationId,
      installed: cyclesResponse.length > 0,
      active: cyclesResponse.length > 0 && !cyclesResponse.some(inactive)
    }

    return integrationStatus;
  }

  /**
   * 
   * getAuthLink - Gets the link for the authentication page 
   *  
   * @param  {@link Connector} connector
   * @param  {string} tenantId
   * @param  {string} callbackUrl
   * 
   * @returns {string} - the auth link
   * 
   * @throws {@link UnauthorizedException} - Invalid request data
   * 
   */
  async getAuthLink(accountConnectorId: number, tenantId: string, userId: string, callbackUrl: string): Promise<string> {
    const accountConnector = await this.cyclrService.getAccountConnector(tenantId, accountConnectorId);
    // Only supporting OAuth connectors at this moment as new ones come up, we'll have to support the others
    if (accountConnector?.authType === CyclrAuthTypes.OAUTH2 || accountConnector?.authType === CyclrAuthTypes.OAUTH1) {
      return await this.cyclrService.getOAuthLink(accountConnectorId, tenantId, userId, callbackUrl)
    } else {
      throw new UnauthorizedException("Not an OAuth2 authentication", { description: 'Invalid Auth Type' })
    }
  }

  /**
   * 
   * getEmbedLink - Gets the link for the authentication page 
   *  
   * @param  {string} tenantId - The tenant needing the link
   * @param  {string} userId - The User needing the link
   * 
   * @returns {string} - the auth link
   * 
   * @throws {@link UnauthorizedException} - Invalid request data
   * 
   */
  async getEmbedLink(tenantId: string, userId: string, accountName: string): Promise<string> {
    await this.cyclrService.createAccount(tenantId, accountName);
    return await this.cyclrService.getEmbedLink(tenantId, userId)
  }

  /**
   * 
   * disconnect - Disconnects the authentication from a connector
   * 
   * @param  {@number} accountConnectorId - the account connector ID
   * @param  {string} tenantId - the tenant id
   * 
   * @returns 
   * 
   */
  async disconnect(accountConnectorId: number, tenantId: string): Promise<void> {
    const accountConnector = await this.cyclrService.getAccountConnector(tenantId, accountConnectorId);
    await this.cyclrService.deauthenticateConnector(accountConnector, tenantId)
    return;
  }
}