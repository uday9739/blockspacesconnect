import { HttpResponse, HttpService } from "@blockspaces/shared/services/http";
import { Inject, Injectable } from "@nestjs/common";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { BadRequestException, ServiceUnavailableException, ValidationException, NotFoundException } from "../../exceptions/common";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import qs from "qs";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { ConnectorDto } from "@blockspaces/shared/dtos/integrations"

export type CyclrApiToken = {
  access_token: string
  token_type: string
  expires_in: number
  clientId: string
  ".refresh": string
  ".issued": string
  ".expires": string
};

export type CyclrIntegration = {
  integrationId: string;
  cycleTemplates: string[];
}

export type CycleTemplate = {
  name: string;
  description: string;
  templateId: string;
  connectors: Array<ConnectorDto>;
  tags: string[];
}

export enum CyclrAuthTypes {
  BASIC = 'Basic',
  APIKEY = 'ApiKey',
  OAUTH1 = 'OAuth1',
  OAUTH2 = 'OAuth2',
  NONE = 'None',
  AUTH_FIELDS = 'AuthFields'
}

export type CyclrInstalledIntegration = {
  accountId: string;
  integration: CyclrIntegration;
};

export type CyclrCycle = {
  cycleId: string;
  accountId: string;
  cycleTemplateId: string;
  tags: string[];
  status: string;
  connectors: Array<Partial<CyclrAccountConnector>>,
}

export class CyclrAccounts extends Array<CyclrAccount>{ };

export type CyclrAccount = {
  accountId: string,
  name: string,
  description?: string,
}

export class CyclrAccountConnectors extends Array<CyclrAccountConnector> { };

export type CyclrAccountConnector = {
  accountConnectorId: number,
  authenticated: boolean,
  id: number,
  name: string,
  description: string,
  status: string,
  version: string,
  iconUrl: string,
  authType: string,
};

type CyclrTemplate = {
  Name: string;
  Description: string;
  Id: string;
  Connectors: any[];
  Tags: string[];
  StepCount: number;
  IsSystemConnector: boolean;
}

@Injectable()
export class CyclrService {

  private apiToken: CyclrApiToken = {
    access_token: "",
    token_type: "",
    expires_in: 0,
    clientId: "",
    ".refresh": "True",
    ".issued": "",
    ".expires": ""
  }

  /**
   *
   */
  constructor(
    private readonly httpService: HttpService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
  ) {
    logger.setModule(CyclrService.name);
  }

  /**
   * 
   * getApiToken - Gets the Cyclr API Token from Mongo, if it's expired, fetches a new one from Cyclr and persists in Mongo
   * 
   * @returns {string} token - The API Token
   */
  private async getApiToken(): Promise<string> {
    let response: HttpResponse;
    if (Number(Date.parse(this.apiToken[".expires"])) > Date.now()) {
      return this.apiToken.access_token
    }

    try {
      response = await this.httpService.request({
        method: "GET",
        baseURL: this.env.cyclr.oauthBaseUrl,
        url: '/oauth/token',
        params: {
        },
        data: qs.stringify({ grant_type: this.env.cyclr.grantType, client_id: this.env.cyclr.clientId, client_secret: this.env.cyclr.clientSecret }),
        validErrorStatuses: [HttpStatus.BAD_REQUEST, HttpStatus.FORBIDDEN],
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept-Encoding": "gzip, deflate, br",
        }
      });
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.getApiToken error" });
    }
    if (!response?.data?.access_token || response?.data?.access_token === '') {
      throw new BadRequestException('Unable to get token from Cyclr', { description: response.statusText });
    }
    this.apiToken = response.data;
    return response.data.access_token;
  }

  /**
   * 
   * getStatus - gets the health of the Cyclr Service
   * 
   * @returns Promise<boolean> - True for healthy / false for down
   * 
   */
  async getStatus(): Promise<void> {
    let accountsResponse;
    try {
      accountsResponse = await this.getAccounts();
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: 'Error getting status update' })
    }
    if (accountsResponse?.length >= 1) {
      return;
    } else {
      throw new ValidationException('No accounts found in Cyclr');
    }
  }

  /**
   * 
   * getAccounts - Gets all of the Cyclr Accounts in the instance
   * 
   * @returns {@link CyclrAccounts} - A list of all the Cyclr Accounts in the instance
   * 
   */
  async getAccounts(
  ): Promise<CyclrAccounts> {
    let cyclrAccounts: CyclrAccounts = [];
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/accounts`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.getAccounts error" });
    }
    if (response?.status === HttpStatus.OK && response.data) {
      for (let i = 0; i < response.data.length; i++) {
        let cyclr_account: CyclrAccount = {
          accountId: response.data[i].Id,
          name: response.data[i].Name,
          description: response.data[i].Description || ''
        }
        cyclrAccounts.push(cyclr_account)
      }
      return cyclrAccounts;
    } else {
      throw new BadRequestException('Error getting Cyclr Accounts', { description: response.statusText })
    }
  };

  /**
   * 
   * createAccount - Creats a Cyclr Account
   * 
   * @param  {string} id - The ID of the Account
   * @param  {string} name - The Name o the Account
   * @param  {string} description - An optional description of the Account
   * 
   * @returns 
   * 
   */
  async createAccount(
    accountId: string,
    name: string,
    description?: string,
  ): Promise<void> {
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/accounts`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          id: accountId,
          name,
          description,
        }
      })
    } catch (error) {
      if (error.response?.data?.Message && error.response?.data?.Message === 'ID already in use') {
        return;
      }
      throw new ServiceUnavailableException(error, { description: "CyclrService.createAccount error" });
    }
    return;
  };

  /**
   * 
   * installTemplate - Installs an integration into a Cyclr Account. An integration is a collection of Cycle Templates
   * 
   * @param  {string} accountId - The Account ID to install the templates to
   * @param  {string} templateId - Cyclr Cycle Template ID to be installed
   * 
   * @returns {@link CyclrInstalledIntegrations} - The successful installed integrations including the related Cycle ID's to the Template ID's of the integration
   * 
   */
  async installTemplate(
    accountId: string,
    templateId: string,
  ): Promise<CyclrCycle> {
    let installResponse: HttpResponse;
    let cyclrCycle: CyclrCycle;
    let token = await this.getApiToken();
    try {
      installResponse = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/templates/${templateId}/install`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Cyclr-Account": accountId
        },
      })
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.installIntegration error" });
    }
    if (!installResponse?.data?.Id || installResponse.data.Id === '') {
      throw new BadRequestException(`Error installing Cyclr Template ${templateId}`, { description: installResponse?.statusText });
    }
    cyclrCycle = {
      accountId,
      cycleId: installResponse.data.Id,
      cycleTemplateId: templateId,
      status: installResponse.data.Status || "Stopped",
      tags: installResponse.data.Tags || [],
      connectors: installResponse.data.Connectors?.map((connector) => {
        return <ConnectorDto>{
          accountConnectorId: connector.AccountConnectorId,
          authenticated: connector.Authenticated,
          connectorId: connector.Id,
          name: connector.Name,
          version: connector.Version,
          iconUrl: connector.Icon,
        }
      })
    }
    return cyclrCycle;
  };

  /**
   * 
   * installConnector - Installs an integration into a Cyclr Account. An integration is a collection of Cycle Templates
   * 
   * @param  {string} accountId - The Account ID to install the templates to
   * @param  {string} templateId - Cyclr Cycle Template ID to be installed
   * 
   * @returns {@link CyclrInstalledIntegrations} - The successful installed integrations including the related Cycle ID's to the Template ID's of the integration
   * 
   */
  async installConnector(
    accountId: string,
    connectorId: number,
  ): Promise<ConnectorDto> {
    let installResponse: HttpResponse;
    let cyclrAccountConnector: ConnectorDto;
    let token = await this.getApiToken();
    try {
      installResponse = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/connectors/${connectorId.toString()}/install`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Cyclr-Account": accountId
        },
      })
      installResponse.data = {
        accountConnectorId: installResponse.data.Id,
        authenticated: installResponse.data.Authenticated,
        connectorId: installResponse.data.Connector.Id,
        name: installResponse.data.Connector.Name,
        description: installResponse.data.Connector.Description || '',
        status: installResponse.data.Connector.Status,
        version: installResponse.data.Connector.Version,
        iconUrl: installResponse.data.Connector.Icon,
        authType: installResponse.data.Connector.AuthType,
        systemConnector: installResponse.data.Connector.IsSystemConnector,
      }
    } catch (error) {
      if (error.response?.data?.Message.startsWith('Account connector name ') && error.response?.data?.Message.endsWith(' is in use.')) {
        installResponse = error.response;
        const accountConnectors: ConnectorDto[] = await this.getAccountConnectors(accountId);
        if (!accountConnectors) {
          throw new NotFoundException('No Account Connectors found when response said Account Connector already exists')
        }
        const accountConnectorsFiltered = accountConnectors.filter((connector) => connector.connectorId === connectorId);
        if (accountConnectorsFiltered.length === 0) {
          throw new NotFoundException('Account Connector not found or multiple instance in installed connectors when told it exists')
        }
        if (accountConnectorsFiltered.length > 1) {
          throw new BadRequestException('Multiple Account Connectors found while searching for duplicate Connector')
        }
        installResponse.data = accountConnectorsFiltered[0];
        // console.log(installResponse)
      } else {
        throw new ServiceUnavailableException(error.response?.data, { description: "CyclrService.installConnector error" });
      }
    }
    if (!installResponse?.data?.accountConnectorId || installResponse.data.accountConnectorId === '') {
      throw new BadRequestException(`Error installing Cyclr Connector ${connectorId}`, { description: installResponse?.statusText });
    }
    cyclrAccountConnector = installResponse.data;
    return cyclrAccountConnector;
  };

  /**
   * 
   * deleteAccountConnector - Deletes an account connector
   * 
   * @param  {string} accountId - The Account ID to install the templates to
   * @param  {string} accountConnectorId - Account Connector ID to be deleted
   * 
   * @returns {@link CyclrInstalledIntegrations} - The successful installed integrations including the related Cycle ID's to the Template ID's of the integration
   * 
   */
  async deleteAccountConnector(
    accountId: string,
    accountConnectorId: number,
  ): Promise<void> {
    let deleteResponse: HttpResponse;
    let token = await this.getApiToken();
    try {
      deleteResponse = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/account/connectors/${accountConnectorId.toString()}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Cyclr-Account": accountId
        },
      })
    } catch (error) {
      if (error.response.status !== 404) {
        throw error
      }
    }
    return;
  };



  /**
   * 
   * uninstallIntegration - Uninstalls a selected integration from an Account
   * 
   * @param  {string} id - ID of the Integration (which relates to a list of Cycle Templates)
   * @param  {string} account_id - The Account ID to uninstall the tempates from
   * 
   */
  async uninstallTemplate(
    tenantId: string,
    templateId: string
  ): Promise<void> {
    let deleteInstalledCycleResponse: HttpResponse;
    let token = await this.getApiToken();
    try {
      deleteInstalledCycleResponse = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/cycle/${templateId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Cyclr-Account": tenantId
        },
      })
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.uninstallIntegration error" });
    }
    if (deleteInstalledCycleResponse?.status !== HttpStatus.OK) {
      throw new BadRequestException(deleteInstalledCycleResponse.statusText)
    }
    return;
  };

  /**
   * 
   * getConnector - Gets the Connectors installed to an Account
   * 
   * @param  {string} connectorId - The Connector ID to look up 
   * 
   * @returns Connector
   * 
   */
  async getConnector(connectorId: number): Promise<ConnectorDto> {
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/connectors/${connectorId.toString()}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      if (error.response.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException(error);
      }
      throw new ServiceUnavailableException(error, { description: "CyclrService.getConnectors error" });
    }
    try {
      // Connectors that are not tied to an account don't have an accountConnectorId
      return <ConnectorDto>{
        accountConnectorId: undefined,
        authenticated: undefined,
        connectorId: response.data.Id,
        name: response.data.Name,
        description: response.data.Description || '',
        status: response.data.Status,
        version: response.data.Version,
        iconUrl: response.data.Icon || '',
        authType: response.data.AuthType,
        systemConnector: response.data.IsSystemConnector || false,
      }
    } catch (error) {
      throw new NotFoundException(`Connector Id ${connectorId} not found`);
    }
  }

  /**
   * 
   * getConnectors - Gets the Connectors installed to an Account
   * 
   * @param  {@link CyclrAccount} account - The Account to look up the installed Connectors for
   * 
   * @returns Array of Connectors
   * 
   */
  async getConnectors(): Promise<Array<ConnectorDto>> {
    let cyclrAccountConnectors: ConnectorDto[] = [];
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/connectors`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.getConnectors error" });
    }
    try {
      for (let i = 0; i < response.data.length; i++) {
        let cyclrAccountConnector: ConnectorDto = {
          authenticated: response.data[i].Authenticated,
          connectorId: response.data[i].Id,
          name: response.data[i].Name,
          description: response.data[i].Description || '',
          status: response.data[i].Status,
          version: response.data[i].Version,
          iconUrl: response.data[i].Icon,
          authType: response.data[i].AuthType,
          systemConnector: response.data[i].IsSystemConnector,
        }
        cyclrAccountConnectors.push(cyclrAccountConnector)
      }
      return cyclrAccountConnectors;
    } catch (error) {
      throw new ValidationException(error, { description: "CyclrService.getConnectors error" })
    }
  }

  /**
   * 
   * getAccountConnectors - Gets the Connectors installed to an Account
   * 
   * @param  {string} accountId - The Account to look up the installed Connectors for
   * @param  {@string} accountConnectorId - The Account to look up the installed Connectors for
   * 
   * @returns Array of Connectors
   * 
   */
  async getAccountConnector(accountId: string, accountConnectorId: number): Promise<ConnectorDto> {
    let cyclrAccountConnector: ConnectorDto;
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/account/connectors/${accountConnectorId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Cyclr-Account": accountId
        }
      })
    } catch (error) {
      throw new ServiceUnavailableException("getAccountConnector error", { description: "CyclrService.getConnectors error" });
    }
    try {
      cyclrAccountConnector = {
        accountConnectorId: response.data.Id,
        authenticated: response.data.Authenticated,
        connectorId: response.data.Connector.Id,
        name: response.data.Connector.Name,
        description: response.data.Connector.Description || '',
        status: response.data.Connector.Status,
        version: response.data.Connector.Version,
        iconUrl: response.data.Connector.Icon,
        authType: response.data.Connector.AuthType,
        systemConnector: response.data.Connector.IsSystemConnector,
        parameters: response.data.Connector.Parameters.filter((parameter) => {
          response.data.Properties.filter((property) => {
            property.Name === parameter.TargetName && (
              (parameter.DataType === 'Text' && property.Value === '')
            )
          }).length > 0
        }) || [],
        properties: response.data.Properties || [],
      }
      return cyclrAccountConnector;
    }
    catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * 
   * getAccountConnectors - Gets the Connectors installed to an Account
   * 
   * @param  {@link CyclrAccount} account - The Account to look up the installed Connectors for
   * 
   * @returns Array of Connectors
   * 
   */
  async getAccountConnectors(accountId: string): Promise<Array<ConnectorDto>> {
    let cyclrAccountConnectors: ConnectorDto[] = [];
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/account/connectors`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Cyclr-Account": accountId
        }
      })
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.getConnectors error" });
    }
    try {
      for (let i = 0; i < response.data.length; i++) {
        let cyclr_account_connector: ConnectorDto = {
          accountConnectorId: response.data[i].Id,
          authenticated: response.data[i].Authenticated,
          connectorId: response.data[i].Connector.Id,
          name: response.data[i].Connector.Name,
          description: response.data[i].Connector.Description || '',
          status: response.data[i].Connector.Status,
          version: response.data[i].Connector.Version,
          iconUrl: response.data[i].Connector.Icon,
          authType: response.data[i].Connector.AuthType,
          systemConnector: response.data[i].Connector.IsSystemConnector,
        }
        cyclrAccountConnectors.push(cyclr_account_connector)
      }
      return cyclrAccountConnectors;
    } catch (error) {
      throw new ValidationException(error, { description: "CyclrService.getConnectors error" })
    }
  }

  /**
   * 
   * getOAuthLink - Gets the OAuth URL page for the selected account connector
   * 
   * @param  {string} accountConnectorId The ID of the Connector within the Account
   * @param  {string} accountId the Account needing to be authenticated
   * @param  {string} userId the User needing to be authenticated
   * @param  {string} returnUrl The URL to route back to
   * 
   * @returns Promise {string} - The URL of the Auth Link
   * 
   */
  async getOAuthLink(
    accountConnectorId: number,
    accountId: string,
    userId: string,
    returnUrl: string
  ): Promise<string> {
    let oauthLink: string;
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/accounts/${accountId}/signintoken`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          Username: userId
        }
      })
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.getAuthLink error" });
    }
    if (response?.data?.Token) {
      oauthLink = `${this.env.cyclr.domain}/connectorauth/updateaccountconnectoroauth?id=${accountConnectorId}&token=${response.data.Token}&targetOrigin=${returnUrl}`;
      return oauthLink;
    } else {
      throw new BadRequestException('Error Creating OAuth URL', { description: `account_connector_id=${accountConnectorId}, account_id=${accountId}, return_url=${returnUrl}` });
    }
  }

  /**
   * 
   * authenticateNonOauthConnector - Non-OAuth Connectors simply update the connector with the auth object
   * 
   * @param  {number} accountConnectorId - The Account Connector ID
   * @param  {string} accountId - The Account ID (tenant)
   * @param  {Record<string,any>} authObject - The object used to update the connector
   * 
   * @returns {Promise<void>}
   * 
   * @throws {@link ServiceUnavailableException} - If there is an error calling the Cyclr API
   * 
   */
  async authenticateNonOAuthConnector(accountConnectorId: number, accountId: string, authObject: Record<string, any>): Promise<void> {
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/account/connectors/${accountConnectorId}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Cyclr-Account": accountId
        },
        data: authObject
      })
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.authenticateNonOauthConnector error" });
    }
    return;
  }

  /**
   * 
   * getEmbedLink - Gets the IFrame URL for embedding the Cyclr Designer
   * 
   * @param  {string} accountId the Account needing to be authenticated
   * @param  {string} userId the User needing to be authenticated
   * 
   * @returns Promise {string} - The URL of the Auth Link
   * 
   */
  async getEmbedLink(
    accountId: string,
    userId: string,
  ): Promise<string> {
    let embedLink: string;
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/accounts/${accountId}/signintoken`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          Username: userId
        }
      })
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.getAuthLink error" });
    }
    if (response?.data?.Token) {
      embedLink = `${this.env.cyclr.domain}/account/signinwithtoken?token=${response.data.Token}`;
      return embedLink;
    } else {
      throw new BadRequestException('Error Creating OAuth URL', { description: `account_id=${accountId}` });
    }
  }

  /**
   * 
   * deauthenticateConnector - De Authenticates a Connector
   * 
   * @param  {string} accountConnectorId - The Account Connector ID to de-authenticate
   * @param  {string} accountId - The Account ID associated with the Connectro
   * 
   */
  async deauthenticateConnector(
    accountConnector: ConnectorDto,
    accountId: string,
  ): Promise<void> {
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      // For the QuickBooks connector, we need to also call revoke access token to conform to the Intuit Requirments
      // The method id 22cdac42-7938-4433-8446-c1a234144286 is the Method Unique Identifier for Revoke Access Token and according to Cyclr will not change
      if (accountConnector.name === 'QuickBooks') {
        response = await this.httpService.request({
          baseURL: this.env.cyclr.baseUrl,
          url: `/account/connectors/${accountConnector.accountConnectorId}/methods/22cdac42-7938-4433-8446-c1a234144286`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Cyclr-Account": accountId
          }
        })
      }
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/account/connectors/${accountConnector.accountConnectorId}/deauthenticate`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Cyclr-Account": accountId
        }
      })
      return;
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.getAuthLink error" });
    }
  }

  /**
   * getTemplatesByTag - Gets a list of templates by a tag which represents the integraiton id
   * 
   * @param  {string} tag - the associated tag in Cyclr
   * 
   * @returns {@link CyclrIntegration} - the integration id and associated templates for that integration
   * 
   */
  async getTemplatesByTag(tag: string): Promise<Array<CycleTemplate>> {
    let response: HttpResponse<Array<CyclrTemplate>>;
    let token = await this.getApiToken();
    let params = { Tag: tag };
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/templates`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: params
      })
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.getTemplates error" });
    }
    let getTemplateResponse: Array<CycleTemplate> = [];
    await Promise.all(response?.data.map(async (template) => {
      let filteredConnectors: Array<ConnectorDto> = await Promise.all(
        template.Connectors.map(async (templateConnector) => {
          const connector = await this.getConnector(templateConnector.Id);
          return connector;
        }))

      let templateResponse: CycleTemplate = {
        name: template.Name,
        description: template.Description,
        templateId: template.Id,
        connectors: filteredConnectors.filter((connector) => connector !== undefined),
        tags: template.Tags,
      };
      getTemplateResponse.push(templateResponse);
    }))
    return getTemplateResponse;
  };

  /**
   * 
   * getCycles - get all of the installed cycles for an account
   * 
   * @param  {string} accountId - The account ID (tenant_id)
   * @param  {string} tag - Optional Tag to filter by
   * 
   * @returns {@link CyclrCycle[]} - list of Cycles that have been installed to an account
   * 
   */
  async getCycles(accountId: string, tag?: string): Promise<Array<CyclrCycle>> {
    let response: HttpResponse;
    let token = await this.getApiToken();
    let params = tag !== '' ? { tag: tag } : {};
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/cycles`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Cyclr-Account": accountId
        },
        params
      })
    } catch (error) {
      throw new ServiceUnavailableException("CyclrService.getCycles error")
    }
    try {
      let cyclrCycles: CyclrCycle[] = [];
      for (let i = 0; i < response.data.length; i++) {
        if (response.data[i].Status === "DeleteScheduled") {
          continue;
        }
        let cyclrCycle: CyclrCycle = {
          cycleId: response.data[i].Id,
          accountId: accountId,
          cycleTemplateId: response.data[i].TemplateId,
          status: response.data[i].Status || "Stopped",
          tags: response.data[i].Tags,
          connectors: response.data[i].Connectors.map((connector) => {
            return <Partial<CyclrAccountConnector>>{
              accountConnectorId: connector.AccountConnectorId,
              connectorId: connector.Id,
              name: connector.Name,
              version: connector.Version,
              authenticated: connector.Authenticated,
              iconUrl: connector.Icon,
            }
          })
        }
        cyclrCycles.push(cyclrCycle);
      }
      return cyclrCycles
    }
    catch (error) {
      return [];
    }
  }

  /**
   * 
   * activateCycle - activate a cycle
   * 
   * @param  {string} accountId - The account ID (tenant_id)
   * @param  {nmber} cycleId - Cycle ID to deactivate
   * 
   * @returns {void} 
   * 
   */
  async activateCycle(accountId: string, cycleId: string, runOnce?: boolean): Promise<void> {
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/cycles/${cycleId}/activate`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Cyclr-Account": accountId
        },
        data: {
          RunOnce: runOnce || false
        }
      })
    } catch (error) {
      if (error.response.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException(`Cyclr Cycle ID ${cycleId} not found`);
      }
      throw new ServiceUnavailableException("CyclrService.activateCycle error")
    }
    return;
  }

  /**
   * 
   * deactivateCycle - deactivate a cycle
   * 
   * @param  {string} accountId - The account ID (tenant_id)
   * @param  {nmber} cycleId - Cycle ID to deactivate
   * 
   * @returns {@link CyclrCycle[]} - list of Cycles that have been installed to an account
   * 
   */
  async deactivateCycle(accountId: string, cycleId: string): Promise<void> {
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/cycles/${cycleId}/deactivate`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Cyclr-Account": accountId
        }
      })
    } catch (error) {
      if (error.response.status === HttpStatus.NOT_FOUND) {
        return;
      }
      throw new ServiceUnavailableException(error, { description: "CyclrService.deactivateCycle error" })
    }
    if (response?.status !== HttpStatus.OK && response?.status !== HttpStatus.NOT_FOUND) {
      throw new BadRequestException(response.statusText, { description: `Error deactivating cycle ${cycleId}` })
    }
    return;
  }

  /**
   * 
   * deleteCycle - delete a cycle
   * 
   * @param  {string} accountId - The account ID (tenant_id)
   * @param  {string} tag - Optional Tag to filter by
   * 
   * @returns {@link CyclrCycle[]} - list of Cycles that have been installed to an account
   * 
   */
  async deleteCycle(accountId: string, cycleId: string): Promise<void> {
    if (!accountId || accountId === '') {
      throw new ValidationException('Account ID not passed');
    }
    if (!cycleId || cycleId === '') {
      throw new ValidationException('Invalid Cycle Id');
    }
    let response: HttpResponse;
    let token = await this.getApiToken();
    try {
      response = await this.httpService.request({
        baseURL: this.env.cyclr.baseUrl,
        url: `/cycles/${cycleId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Cyclr-Account": accountId
        }
      })
      return;
    } catch (error) {
      throw new ServiceUnavailableException(error, { description: "CyclrService.deleteCycle error" })
    }
  }
}

