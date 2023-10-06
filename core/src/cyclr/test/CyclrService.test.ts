import { ConnectLogger } from "../../logging/ConnectLogger";
import { CycleTemplate, CyclrAccount, CyclrAccountConnector, CyclrAccountConnectors, CyclrAccounts, CyclrApiToken, CyclrCycle, CyclrInstalledIntegration, CyclrService } from '../services/CyclrService';
import { HttpResponse, HttpService } from '@blockspaces/shared/services/http';
import { AxiosResponse } from "axios";
import { createHydratedMock, createMock } from 'ts-auto-mock';
import { HttpStatus } from '@blockspaces/shared/types/http';
import { EnvironmentVariables } from '../../env';
import { BadRequestException, ServiceUnavailableException, ValidationException, NotFoundException } from "../../exceptions/common";
import { ConnectorDto } from "@blockspaces/shared/dtos/integrations"

type CyclrInstalledCycle = {
  "Id": string;
  "Tags"?: string[];
  "Connectors": Array<
    {
      "Id": number;
      "AccountConnectorId"?: number;
      "Name": string;
      "Version"?: string;
      "Authenticated"?: boolean;
      "StepCount"?: number;
      "Icon"?: string
    }>
}

type CyclrConnector = {
  "Id": number;
  "Name": string;
  "Description": string;
  "AuthValue": string;
  "Authenticated": boolean
  "Connector": {
    "Id": number;
    "Name": string;
    "Description": string;
    "Status": string;
    "Version": string;
    "Icon": string;
    "AuthDescription": string;
    "AuthType": string;
    "OAuth2Type": string;
  }
}

type CyclrGetAccountResponse = {
  "CreatedDate": string;
  "Id": string;
  "Name": string;
  "Description": string;
  "AuditInfo": string;
  "TaskAuditInfo": string;
  "Timezone": string;
  "NextBillDateUtc": string;
  "StepDataSuccessRetentionHours": number;
  "StepDataErroredRetentionHours": number;
  "TransactionErrorWebhookEnabled": boolean;
  "TransactionErrorWebhookUrl": string;
  "TransactionErrorWebhookIncludeWarnings": boolean;
}

describe('Cyclr Service Tests', () => {
  let mocks: {
    connectLoggerService: ConnectLogger,
    httpService: HttpService,
    environmentVariables: EnvironmentVariables,
    cyclrApiToken: CyclrApiToken,
    cyclrAccount: CyclrAccount,
    cyclrAccountConnector: CyclrConnector,
    cyclrInstalledCycle: CyclrInstalledCycle,
    cyclrCycleWithTag: CyclrInstalledCycle,
  };

  mocks = {
    connectLoggerService: createMock<ConnectLogger>(),
    httpService: createMock<HttpService>(),
    environmentVariables: createMock<EnvironmentVariables>(),
    cyclrApiToken: createMock<CyclrApiToken>(),
    cyclrAccount: createMock<CyclrAccount>(),
    cyclrAccountConnector: createMock<CyclrConnector>(),
    cyclrInstalledCycle: createMock<CyclrInstalledCycle>(),
    cyclrCycleWithTag: createMock<CyclrInstalledCycle>(),
  };

  mocks.cyclrApiToken.access_token = '12345';
  let service: CyclrService;

  beforeEach(async () => {
    service = new CyclrService(mocks.httpService, mocks.environmentVariables, mocks.connectLoggerService);
    jest.spyOn(service as any, 'getApiToken').mockResolvedValue('mock_token');
  })

  afterEach(async () => {
  });

  describe('getStatus', () => {
    it('returns if accountsResponse has at least one account', async () => {
      service.getAccounts = jest.fn().mockResolvedValue([mocks.cyclrAccount]);

      await expect(service.getStatus()).resolves.toBeUndefined();
      expect(service.getAccounts).toHaveBeenCalled();
    });

    it('returns if accountsResponse has at least one account', async () => {
      service.getAccounts = jest.fn().mockResolvedValue([mocks.cyclrAccount]);

      await expect(service.getStatus()).resolves.toBeUndefined();
      expect(service.getAccounts).toHaveBeenCalled();
    });

    it('throws ServiceUnavailableException if getAccounts throws', async () => {
      service.getAccounts = jest.fn().mockRejectedValue(new Error('error getting accounts'));

      await expect(service.getStatus()).rejects.toThrowError(ServiceUnavailableException);
      expect(service.getAccounts).toHaveBeenCalled();
    });

    it('throws ValidationException if no accounts are found', async () => {
      service.getAccounts = jest.fn().mockResolvedValue([]);

      await expect(service.getStatus()).rejects.toThrowError(ValidationException);
      expect(service.getAccounts).toHaveBeenCalled();
    });
  })

  describe('getAccounts', () => {
    beforeEach(async () => {
      service = new CyclrService(mocks.httpService, mocks.environmentVariables, mocks.connectLoggerService);
    })

    it('throws ServiceUnavailableException when receiving error from getting API Key', async () => {
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(new BadRequestException());
      await expect(service.getAccounts()).rejects.toThrowError(ServiceUnavailableException);
    })

    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      const getApiTokenResponse = createMock<HttpResponse>();
      getApiTokenResponse.status = HttpStatus.OK;
      getApiTokenResponse.data = {
        "access_token": "335a66b5934e40ee8f62e4fdf521e30e37f8820683f3488383b383a465d6cbb3",
        "token_type": "bearer",
        "expires_in": 1209599,
        "clientId": "eGzkBtotcty6ieW9dnVV0aKyHXwrcuai",
        ".refresh": "False",
        ".issued": "Thu, 16 Feb 2023 03:03:24 GMT",
        ".expires": "Thu, 02 Mar 2023 03:03:24 GMT"
      };
      mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(getApiTokenResponse)
        .mockRejectedValueOnce(new BadRequestException());

      await expect(service.getAccounts()).rejects.toThrowError(ServiceUnavailableException);
    })

    it('returns an array of accounts and reuses a token', async () => {
      const getApiTokenResponse = createMock<HttpResponse>();
      getApiTokenResponse.status = HttpStatus.OK;
      getApiTokenResponse.data = {
        "access_token": "335a66b5934e40ee8f62e4fdf521e30e37f8820683f3488383b383a465d6cbb3",
        "token_type": "bearer",
        "expires_in": 1209599,
        "clientId": "eGzkBtotcty6ieW9dnVV0aKyHXwrcuai",
        ".refresh": "False",
        ".issued": "Thu, 16 Feb 2023 03:03:24 GMT",
        ".expires": "Thu, 02 Mar 2023 03:03:24 GMT"
      };
      let cyclrAccount = createMock<{
        status: HttpStatus;
        data: CyclrGetAccountResponse[]
      }>();
      cyclrAccount.status = HttpStatus.OK;
      cyclrAccount.data.push(createMock<CyclrGetAccountResponse>())
      mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(getApiTokenResponse)
        .mockResolvedValueOnce(cyclrAccount)
        .mockResolvedValueOnce(cyclrAccount);

      mocks.cyclrAccount.description = ''
      await expect(service.getAccounts()).resolves.toEqual([mocks.cyclrAccount]);
    })

    it('should throw an error if the response is a failed response', async () => {
      jest.spyOn(service as any, 'getApiToken').mockResolvedValue('mock_token');
      let cyclrAccount = createMock<{
        status: HttpStatus;
        data: CyclrGetAccountResponse[]
      }>();
      cyclrAccount.status = HttpStatus.BAD_REQUEST;
      mocks.httpService.request = jest.fn().mockResolvedValue(cyclrAccount);
      mocks.cyclrAccount.description = ''
      await expect(service.getAccounts()).rejects.toThrowError(BadRequestException);
    })
  });

  describe('createAccount', () => {
    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(BadRequestException);
      await expect(service.createAccount('', '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Succeeds if the account is already existing', async () => {
      const response = createMock<{
        response: {
          status: HttpStatus;
          data: {
            Message: string;
          }
        }
      }>();
      response.response.status = HttpStatus.BAD_REQUEST;
      response.response.data.Message = 'ID already in use';
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.createAccount('', '')).resolves.toBeUndefined();
    })

    it('Throws error if cyclr throws an error other than account is already created', async () => {
      const response = createMock<HttpResponse>();
      response.status = HttpStatus.BAD_REQUEST;
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.createAccount('', '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Throws error if the account is not created', async () => {
      const response = createMock<HttpResponse>();
      response.status = HttpStatus.OK;
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.createAccount('', '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Succeeds if the account is created', async () => {
      const response = createMock<HttpResponse<{ Id: string; }>>();
      response.status = HttpStatus.OK;
      response.data.Id = '1234';
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      await expect(service.createAccount('', '')).resolves.toBeUndefined();
    })
  });

  describe('installTemplate', () => {
    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(BadRequestException);
      await expect(service.installTemplate('', '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it('throws BadRequestException with error from calling Cyclr API', async () => {
      const response = createMock<HttpResponse>();
      response.status = HttpStatus.OK;
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      await expect(service.installTemplate('', '')).rejects.toThrowError(BadRequestException);
    })

    it('Succeeds if template is installed', async () => {
      const installTemplateResponse = createMock<HttpResponse<CyclrInstalledCycle>>();
      installTemplateResponse.status = HttpStatus.OK
      installTemplateResponse.data = mocks.cyclrInstalledCycle;
      installTemplateResponse.data.Connectors = [createMock<{
        Id: number;
        AccountConnectorId?: number;
        Name: string;
        Version?: string;
        Authenticated?: boolean;
        StepCount?: number;
        Icon?: string
      }>()]
      installTemplateResponse.data.Id = '1234';
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(installTemplateResponse);
      const expectedResponse = createHydratedMock<CyclrCycle>();
      expectedResponse.connectors = [createMock<ConnectorDto>()]
      expectedResponse.status = "Stopped";
      expectedResponse.cycleId = '1234';

      await expect(service.installTemplate('', '')).resolves.toEqual(expectedResponse);
    })

  });

  describe('uninstallTemplate', () => {
    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(BadRequestException);
      await expect(service.uninstallTemplate('', '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it('throws BadRequestException if resolves with error', async () => {
      const response = createMock<HttpResponse>();
      response.status = HttpStatus.BAD_REQUEST;
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      await expect(service.uninstallTemplate('', '')).rejects.toThrowError(BadRequestException);
    })

    it('Succeeds if template is uninstalled', async () => {
      const uninstallTemplateResponse = createMock<HttpResponse<CyclrInstalledCycle>>();
      uninstallTemplateResponse.status = HttpStatus.OK
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(uninstallTemplateResponse);
      await expect(service.uninstallTemplate('', '')).resolves.toBeUndefined();
    })

  });

  describe('getConnector', () => {

    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      let response = createMock<{ response: { status: HttpStatus } }>();
      response.response.status = HttpStatus.BAD_REQUEST
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.getConnector(0)).rejects.toThrowError(ServiceUnavailableException);
    })

    it('throws NotFoundException if the connector was not found', async () => {
      const response = createMock<{ response: { status: HttpStatus } }>();
      response.response.status = HttpStatus.NOT_FOUND
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.getConnector(0)).rejects.toThrowError(NotFoundException);
    })

    it('Succeeds if it finds the Connector', async () => {
      const response = createMock<HttpResponse<{
        Authenticated: string;
        Id: number;
        Name: string;
        Description: string;
        Status: string;
        Version: string;
        Icon: string;
        AuthType: string;
        IsSystemConnector: boolean;
      }>>();
      response.status = HttpStatus.OK;
      response.data.Id = 1234;
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      const expectedResponse = createMock<ConnectorDto>();
      expectedResponse.connectorId = 1234;
      // Connectors that are not tied to an account don't have an accountConnectorId

      const actualResponse = await service.getConnector(0);
      expect(actualResponse.connectorId).toEqual(1234);
    })

    it('Throws a not found exception if a record is found that does not match the structure', async () => {
      const response = createMock<HttpResponse>();
      response.status = HttpStatus.OK
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      await expect(service.getConnector(0)).rejects.toThrowError(NotFoundException);
    })

  });

  describe('getConnectors', () => {

    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      let response = createMock<{ response: { status: HttpStatus } }>();
      response.response.status = HttpStatus.BAD_REQUEST
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.getConnectors()).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Succeeds if it finds the Connector', async () => {
      const connectorResponse = createMock<{
        Authenticated?: boolean;
        Id: number;
        Name: string;
        Description?: string;
        Status?: string;
        Version?: string;
        Icon: string;
        AuthType: string;
        IsSystemConnector: boolean;
      }>();
      connectorResponse.Id = 1234;
      const response = createMock<HttpResponse<{
        Authenticated?: boolean;
        Id: number;
        Name: string;
        Description?: string;
        Status?: string;
        Version?: string;
        Icon: string;
        AuthType: string;
        IsSystemConnector: boolean;
      }[]>>();
      response.status = HttpStatus.OK;
      response.data = [connectorResponse];
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      const expectedResponse = createMock<ConnectorDto>();
      expectedResponse.connectorId = 1234;

      await expect(service.getConnectors()).resolves.toHaveLength(1);
    })

    it('Throws a not found exception if a record is found that does not match the structure', async () => {
      const response = createMock<HttpResponse>();
      response.status = HttpStatus.OK
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      await expect(service.getConnectors()).rejects.toThrowError(ValidationException);
    })
  });

  describe('getAccountConnector', () => {

    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      let response = createMock<{ response: { status: HttpStatus } }>();
      response.response.status = HttpStatus.BAD_REQUEST
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.getAccountConnector('', 0)).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Succeeds if it finds the Connector', async () => {
      const response = createMock<HttpResponse<{
        Id: number;
        Authenticated: boolean;
        Connector: {
          Id: number;
          Name: string;
          Description: string;
          Status: string;
          Version: string;
          Icon: string;
          AuthType: string;
          IsSystemConnector: boolean;
          Parameters: {
            TargetName: string;
            Value: string;
          }[];
          Properties: {
            Name: string;
            Value: string;
          }[]
        }
      }>>();
      response.status = HttpStatus.OK;
      response.data.Id = 1234;
      response.data.Connector.Id = 1234;
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      const expectedResponse = createHydratedMock<ConnectorDto>();
      expectedResponse.connectorId = 1234;
      expectedResponse.accountConnectorId = 1234;
      expectedResponse.parameters = [];
      expectedResponse.properties = [];

      await expect(service.getAccountConnector('1234', 0)).resolves.toStrictEqual(expectedResponse);
    })

    it('Throws a not found exception if a record is found that does not match the structure', async () => {
      const response = createMock<HttpResponse>();
      response.status = HttpStatus.OK
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      await expect(service.getAccountConnector('1234', 0)).rejects.toThrowError(BadRequestException);
    })
  });

  describe('getAccountConnectors', () => {

    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      let response = createMock<{ response: { status: HttpStatus } }>();
      response.response.status = HttpStatus.BAD_REQUEST
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.getAccountConnectors('1234')).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Succeeds if it finds the Connector', async () => {
      const connectorResponse = createMock<{
        Id: number;
        Authenticated: boolean;
        Connector: {
          Id: number;
          Name: string;
          Description: string;
          Status: string;
          Version: string;
          Icon: string;
          AuthType: string;
          IsSystemConnector: boolean;
        }
      }>();
      connectorResponse.Id = 1234;
      const response = createMock<HttpResponse<{
        Id: number;
        Authenticated: boolean;
        Connector: {
          Id: number;
          Name: string;
          Description: string;
          Status: string;
          Version: string;
          Icon: string;
          AuthType: string;
          IsSystemConnector: boolean;
        }
      }[]>>();
      response.status = HttpStatus.OK;
      response.data = [connectorResponse];
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      const expectedResponse = createMock<ConnectorDto>();
      expectedResponse.connectorId = 1234;

      await expect(service.getAccountConnectors('1234')).resolves.toHaveLength(1);
    })

    it('Throws a not found exception if a record is found that does not match the structure', async () => {
      const response = createMock<HttpResponse>();
      response.status = HttpStatus.OK
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      await expect(service.getAccountConnectors('1234')).rejects.toThrowError(ValidationException);
    })
  });

  describe('getOAuthLink', () => {

    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      let response = createMock<{ response: { status: HttpStatus } }>();
      response.response.status = HttpStatus.BAD_REQUEST
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.getOAuthLink(0, '', '', '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Succeeds if it finds the Connector', async () => {
      const response = createMock<HttpResponse<{
        Token: string;
      }>>();
      response.status = HttpStatus.OK;
      response.data.Token = '1234'
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);

      await expect(service.getOAuthLink(0, '', '', '')).resolves.toBeTruthy();
    })

    it('Throws a not found exception if a record is found that does not match the structure', async () => {
      const response = createMock<HttpResponse>();
      response.status = HttpStatus.OK
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      await expect(service.getOAuthLink(0, '', '', '')).rejects.toThrowError(BadRequestException);
    })
  });

  describe('authenticateNonOAuthConnector', () => {
    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      let response = createMock<{ response: { status: HttpStatus } }>();
      response.response.status = HttpStatus.BAD_REQUEST
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.authenticateNonOAuthConnector(0, '', {})).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Succeeds authenticating a NonOAuthConnector', async () => {
      const response = createMock<HttpResponse<{
      }>>();
      response.status = HttpStatus.OK;
      await expect(service.authenticateNonOAuthConnector(0, '', {})).resolves.toBeUndefined();
    })

  })

  describe('getEmbedLink', () => {

    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      let response = createMock<{ response: { status: HttpStatus } }>();
      response.response.status = HttpStatus.BAD_REQUEST
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.getEmbedLink('', '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Succeeds if it finds the Connector', async () => {
      const response = createMock<HttpResponse<{
        Token: string;
      }>>();
      response.status = HttpStatus.OK;
      response.data.Token = '1234'
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);

      await expect(service.getEmbedLink('', '')).resolves.toBeTruthy();
    })

    it('Throws a not found exception if a record is found that does not match the structure', async () => {
      const response = createMock<HttpResponse>();
      response.status = HttpStatus.OK
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      await expect(service.getEmbedLink('', '')).rejects.toThrowError(BadRequestException);
    })
  });

  describe('deauthenticateConnector', () => {

    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      let response = createMock<{ response: { status: HttpStatus } }>();
      response.response.status = HttpStatus.BAD_REQUEST
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      const accountConnector = createMock<ConnectorDto>();
      await expect(service.deauthenticateConnector(accountConnector, '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Succeeds if it finds the Connector', async () => {
      const response = createMock<HttpResponse<{
        Message: string;
      }>>();
      response.status = HttpStatus.OK;
      response.data.Message = '1234'
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      const accountConnector = createMock<ConnectorDto>();

      await expect(service.deauthenticateConnector(accountConnector, '')).resolves.toBeUndefined();
    })
  });

  describe('getTemplatesByTag', () => {

    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      let response = createMock<{ response: { status: HttpStatus } }>();
      response.response.status = HttpStatus.BAD_REQUEST
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.getTemplatesByTag('tag')).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Succeeds if it finds the Connector', async () => {
      const templateResponse = createMock<{
        Name: string;
        Description: string;
        Id: string;
        Connectors: any[];
        Tags: string[];
        StepCount: number;
        IsSystemConnector: boolean;
      }>();
      templateResponse.Tags = ['tag']

      const response = createMock<HttpResponse<{
        Name: string;
        Description: string;
        Id: string;
        Connectors: any[];
        Tags: string[];
        StepCount: number;
        IsSystemConnector: boolean;
      }[]>>();

      const templateConnector = createMock<{
        Id: string;
        Name: string;
        StepCount: number;
        IsSystemConnector: boolean;
      }>()

      templateConnector.IsSystemConnector = false;
      templateResponse.Connectors = [templateConnector]

      response.status = HttpStatus.OK;
      response.data = [templateResponse];
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      const connector = createMock<ConnectorDto>();
      connector.systemConnector = false;
      service.getConnector = jest.fn().mockResolvedValue(connector);

      const expectedResponse = createMock<CycleTemplate>();
      expectedResponse.tags = ['tag']
      await expect(service.getTemplatesByTag('tag')).resolves.toHaveLength(1);
    })

  });

  describe('getCycles', () => {
    it('throws ServiceUnavailableException with error from calling Cyclr API', async () => {
      let response = createMock<{ response: { status: HttpStatus } }>();
      response.response.status = HttpStatus.BAD_REQUEST
      mocks.httpService.request = jest.fn().mockRejectedValueOnce(response);
      await expect(service.getCycles('1234')).rejects.toThrowError(ServiceUnavailableException);
    })

    it('Succeeds if it finds the Connector', async () => {
      const cycleResponse = createMock<{
        Id: string;
        Connectors: {
          Id: number;
          AccountConnectorId: number;
          Name: string;
          Version: string;
          Authenticated: boolean;
          StepCount: number;
          Icon: string;
        }[];
        TemplateId: string;
        Tags: string[];
      }>();
      cycleResponse.Tags = ['tag']

      const response = createMock<HttpResponse<{
        Id: string;
        Connectors: {
          Id: number;
          AccountConnectorId: number;
          Name: string;
          Version: string;
          Authenticated: boolean;
          StepCount: number;
          Icon: string;
        }[];
        TemplateId: string;
        Tags: string[];
      }[]>>();

      const templateConnector = createMock<{
        Id: number;
        AccountConnectorId: number;
        Name: string;
        Version: string;
        Authenticated: boolean;
        StepCount: number;
        Icon: string;
        IsSystemConnector: boolean;
      }>()

      cycleResponse.Connectors = [templateConnector]

      response.status = HttpStatus.OK;
      response.data = [cycleResponse];
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);
      const cycle = createMock<CyclrCycle>();
      cycle.accountId = '1234';
      cycle.tags = ['tag']
      cycle.connectors = [
        createMock<ConnectorDto>()
      ]
      cycle.connectors[0].accountConnectorId = 0;
      cycle.connectors[0].authenticated = false;
      cycle.connectors[0].iconUrl = '';
      cycle.connectors[0].version = '';
      cycle.status = "Stopped";
      const cycleArray = [cycle]
      await expect(service.getCycles('1234')).resolves.toStrictEqual(cycleArray);
    })

    it('returns empty array if data is bad', async () => {
      const response = createMock<HttpResponse>();
      response.status = HttpStatus.OK
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(response);

      await expect(service.getCycles('1234')).resolves.toEqual([]);
    })
  });


  describe('activateCycle', () => {
    it('should throw ServiceUnavailableException if request to Cyclr API fails', async () => {
      mocks.httpService.request = jest.fn().mockRejectedValueOnce({ response: { status: HttpStatus.INTERNAL_SERVER_ERROR } });
      await expect(service.activateCycle('account_id', 'cycle_id')).rejects.toThrowError(ServiceUnavailableException);
    });

    it('should return void if response status is OK', async () => {
      mocks.httpService.request = jest.fn().mockResolvedValueOnce({ status: HttpStatus.OK });
      await expect(service.activateCycle('account_id', 'cycle_id')).resolves.toBeUndefined();
    });

    it('should return void if response status is NOT_FOUND', async () => {
      mocks.httpService.request = jest.fn().mockRejectedValue({ response: { status: HttpStatus.NOT_FOUND } });
      await expect(service.activateCycle('account_id', 'cycle_id')).rejects.toThrowError(NotFoundException);
    });
  });


  describe('deactivateCycle', () => {
    it('should throw ServiceUnavailableException if request to Cyclr API fails', async () => {
      mocks.httpService.request = jest.fn().mockRejectedValueOnce({ response: { status: HttpStatus.INTERNAL_SERVER_ERROR } });
      await expect(service.deactivateCycle('account_id', 'cycle_id')).rejects.toThrowError(ServiceUnavailableException);
    });

    it('should throw BadRequestException if response status is not OK or NOT_FOUND', async () => {
      mocks.httpService.request = jest.fn().mockResolvedValueOnce({ status: HttpStatus.BAD_REQUEST, statusText: 'Bad Request' });
      await expect(service.deactivateCycle('account_id', 'cycle_id')).rejects.toThrowError(BadRequestException);
    });

    it('should return void if response status is OK', async () => {
      mocks.httpService.request = jest.fn().mockResolvedValueOnce({ status: HttpStatus.OK });
      await expect(service.deactivateCycle('account_id', 'cycle_id')).resolves.toBeUndefined();
    });

    it('should return void if response status is NOT_FOUND', async () => {
      mocks.httpService.request = jest.fn().mockRejectedValue({ response: { status: HttpStatus.NOT_FOUND } });
      await expect(service.deactivateCycle('account_id', 'cycle_id')).resolves.toBeUndefined();
    });
  });

  describe('deleteCycle', () => {
    it('should throw ValidationException if accountId is not passed', async () => {
      await expect(service.deleteCycle('', 'cycle_id')).rejects.toThrow('Account ID not passed');
    });

    it('should throw ValidationException if cycleId is not passed', async () => {
      await expect(service.deleteCycle('account_id', '')).rejects.toThrow('Invalid Cycle Id');
    });

    it('should throw ServiceUnavailableException if request to Cyclr API fails', async () => {
      mocks.httpService.request = jest.fn().mockRejectedValueOnce({ response: { status: HttpStatus.INTERNAL_SERVER_ERROR } });
      await expect(service.deleteCycle('account_id', 'cycle_id')).rejects.toThrowError(ServiceUnavailableException);
    });

    // it('should throw BadRequestException if response status is not OK or NOT_FOUND', async () => {
    //   mocks.httpService.request = jest.fn().mockResolvedValueOnce({ status: HttpStatus.BAD_REQUEST, statusText: 'Bad Request' });
    //   await expect(service.deleteCycle('account_id', 'cycle_id')).rejects.toThrowError(BadRequestException);
    // });

    it('should return void if response status is OK', async () => {
      mocks.httpService.request = jest.fn().mockResolvedValueOnce({ status: HttpStatus.OK });
      await expect(service.deleteCycle('account_id', 'cycle_id')).resolves.toBeUndefined();
    });

  });

});