import ApiResult from "@blockspaces/shared/models/ApiResult";
import { ExternalIntegration } from "@blockspaces/shared/models/external-integration";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { CycleTemplate, CyclrAccount, CyclrAccountConnector, CyclrAccountConnectors, CyclrAuthTypes, CyclrCycle, CyclrInstalledIntegration, CyclrIntegration, CyclrService } from "../../cyclr/services/CyclrService";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { InstalledIntegration, IntegrationsService } from "./IntegrationsService";
import { IntegrationDto, ConnectorDto } from "@blockspaces/shared/dtos/integrations"
import { EnvironmentVariables } from "../../env";
import { ApiKeyService } from "../../auth/services/ApiKeyService";
import { BadRequestException, NotFoundException, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { ValidationException } from "../../exceptions/common";
import { WebhookService } from "../../webhooks/services/WebhookService";

describe(IntegrationsService, () => {

  let mocks: {
    cyclrService: CyclrService,
    db: ConnectDbDataContext,
    logger: ConnectLogger,
    environmentVariables: EnvironmentVariables,
    apiKeyService: ApiKeyService,
    webhookService: WebhookService,
  };

  mocks = {
    cyclrService: createMock<CyclrService>(),
    db: createMock<ConnectDbDataContext>(),
    logger: createMock<ConnectLogger>(),
    environmentVariables: createMock<EnvironmentVariables>(),
    apiKeyService: createMock<ApiKeyService>(),
    webhookService: createMock<WebhookService>(),
  };

  const integrationService: IntegrationsService = new IntegrationsService(mocks.cyclrService, mocks.db, mocks.apiKeyService, mocks.webhookService, mocks.environmentVariables, mocks.logger);

  beforeEach(() => {


  });

  describe('getAvailableIntegrations', () => {

    it("Should fail getting the external integrations from mongo", async () => {
      mocks.db.externalIntegration.find = jest.fn().mockRejectedValueOnce(new BadRequestException());
      await expect(integrationService.getAvailableIntegrations('')).rejects.toThrowError(BadRequestException);
    })

    it("Should return an inactive integration when the request to get Cycles fails", async () => {
      const externalIntegrations = createMock<ExternalIntegration>();
      mocks.db.externalIntegration.find = jest.fn().mockResolvedValueOnce([externalIntegrations]);
      mocks.cyclrService.getCycles = jest.fn().mockRejectedValueOnce(new BadRequestException());
      const integration = createMock<IntegrationDto>();
      integration.active = false;
      integration.description = undefined;
      integration.installed = false;
      integration.connectors = [];
      await expect(integrationService.getAvailableIntegrations('')).resolves.toStrictEqual([integration]);
    })

    it("Should succeed and the integration be marked as not installed and not active", async () => {
      const externalIntegrations = createMock<ExternalIntegration>();
      mocks.db.externalIntegration.find = jest.fn().mockResolvedValueOnce([externalIntegrations]);
      const cycle = createMock<CyclrCycle>();
      mocks.cyclrService.getCycles = jest.fn().mockResolvedValueOnce([]);
      const integration = createMock<IntegrationDto>();
      integration.active = false;
      integration.installed = false;
      integration.description = undefined;
      integration.connectors = [];
      await expect(integrationService.getAvailableIntegrations('')).resolves.toStrictEqual([integration]);
    })

    it("Should succeed and integration should be installed but inactive", async () => {
      const externalIntegrations = createMock<ExternalIntegration>();
      mocks.db.externalIntegration.find = jest.fn().mockResolvedValueOnce([externalIntegrations]);
      const cycle = createMock<CyclrCycle>();
      cycle.status = "Stopped"
      mocks.cyclrService.getCycles = jest.fn().mockResolvedValueOnce([cycle]);
      const templatesResponse = createMock<CycleTemplate>();
      const connector = createMock<ConnectorDto>();
      connector.systemConnector = false;
      templatesResponse.connectors = [connector]
      const integration = createMock<IntegrationDto>();
      integration.active = false;
      integration.installed = true;
      integration.description = undefined;
      integration.connectors = [connector];
      mocks.cyclrService.getTemplatesByTag = jest.fn().mockResolvedValueOnce([templatesResponse])
      await expect(integrationService.getAvailableIntegrations('')).resolves.toStrictEqual([integration]);
    })

    it("Should succeed and integration should be installed and active", async () => {
      const externalIntegrations = createMock<ExternalIntegration>();
      mocks.db.externalIntegration.find = jest.fn().mockResolvedValueOnce([externalIntegrations]);
      const cycle = createMock<CyclrCycle>();
      cycle.status = "Active"
      mocks.cyclrService.getCycles = jest.fn().mockResolvedValueOnce([cycle]);
      const templatesResponse = createMock<CycleTemplate>();
      const connector = createMock<ConnectorDto>();
      connector.systemConnector = false;
      templatesResponse.connectors = [connector]
      const integration = createMock<IntegrationDto>();
      integration.active = true;
      integration.installed = true;
      integration.description = undefined;
      integration.connectors = [connector];
      mocks.cyclrService.getTemplatesByTag = jest.fn().mockResolvedValueOnce([templatesResponse])
      await expect(integrationService.getAvailableIntegrations('')).resolves.toStrictEqual([integration]);
    })

    it("Should get a list of available integrations", async () => {

      const externalIntegrations = createMock<ExternalIntegration>();
      externalIntegrations.id = 'BIP_QBO';
      externalIntegrations.description = '';
      const cyclrConnector1: ConnectorDto = createMock<ConnectorDto>();
      cyclrConnector1.connectorId = 1;
      cyclrConnector1.name = 'test1'
      const cyclrConnector2: ConnectorDto = createMock<ConnectorDto>();
      cyclrConnector2.connectorId = 2;
      cyclrConnector2.name = 'test2'
      const cyclrAccountConnectors: CyclrAccountConnector[] = []

      mocks.db.externalIntegration.find = jest.fn().mockResolvedValueOnce([externalIntegrations]);
      let templatesResponse = createMock<CycleTemplate>();
      templatesResponse.tags = ["integration_id:BIP_QBO"];
      templatesResponse.connectors = [cyclrConnector1, cyclrConnector2]
      mocks.cyclrService.getTemplatesByTag = jest.fn().mockResolvedValueOnce([templatesResponse]);
      mocks.cyclrService.getConnector = jest.fn().mockResolvedValueOnce(cyclrConnector1).mockResolvedValueOnce(cyclrConnector2)

      const expectedResponse = createMock<IntegrationDto>();
      expectedResponse.integrationId = 'BIP_QBO';
      expectedResponse.connectors = [cyclrConnector1, cyclrConnector2]
      // const response = await integrationService.getAvailableIntegrations('1234');
      // expect(response).toStrictEqual([expectedResponse]);

    });

  })

  describe('getInstalledConnectors', () => {
    it('Should fail when receiving an error getting account conncectors', async () => {
      mocks.cyclrService.getAccountConnectors = jest.fn().mockRejectedValueOnce(new BadRequestException());
      await expect(integrationService.getInstalledConnectors('')).rejects.toThrowError(BadRequestException);
    })

    it('Should succeed with 0 account connectors', async () => {
      mocks.cyclrService.getAccountConnectors = jest.fn().mockResolvedValueOnce([]);
      await expect(integrationService.getInstalledConnectors('')).resolves.toEqual([]);
    })

    it('Should succeed with 1 account connector', async () => {
      const connector = createMock<ConnectorDto>();
      mocks.cyclrService.getAccountConnectors = jest.fn().mockResolvedValueOnce([connector]);
      await expect(integrationService.getInstalledConnectors('')).resolves.toStrictEqual([connector]);
    })

  })

  describe('addIntegration', () => {
    const integration = createMock<IntegrationDto>();
    integration.integrationId = 'BIP_QBO';

    it("Should fail adding an integration if there is an issue adding an account", async () => {
      mocks.cyclrService.createAccount = jest.fn().mockRejectedValueOnce(new ServiceUnavailableException())
      await expect(integrationService.addIntegration('', '', '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it("Should fail adding an integration if there is an issue adding getting templates", async () => {
      mocks.cyclrService.createAccount = jest.fn().mockResolvedValueOnce(() => Promise.resolve())
      mocks.cyclrService.getTemplatesByTag = jest.fn().mockRejectedValueOnce(new ServiceUnavailableException())
      await expect(integrationService.addIntegration('', '', '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it("Should succeed adding an integration even if there is no BlockSpaces Connector", async () => {
      mocks.cyclrService.createAccount = jest.fn().mockResolvedValueOnce(() => Promise.resolve())
      const template = createMock<CycleTemplate>();
      mocks.cyclrService.getTemplatesByTag = jest.fn().mockResolvedValue([template])
      mocks.cyclrService.getAccountConnectors = jest.fn().mockResolvedValueOnce([])
      const cyclrCycle1 = createMock<CyclrCycle>();
      mocks.cyclrService.installTemplate = jest.fn().mockResolvedValueOnce(cyclrCycle1);
      mocks.webhookService.createWebhookSubscription = jest.fn().mockResolvedValue(() => Promise.resolve())
      const expectedResponse = [cyclrCycle1];
      await expect(integrationService.addIntegration('', '', '')).resolves.toStrictEqual(expectedResponse);
    })

    it("Should succeed adding an integration when there is a BlockSpaces Connector", async () => {
      mocks.cyclrService.createAccount = jest.fn().mockResolvedValueOnce(() => Promise.resolve())
      const template = createMock<CycleTemplate>();
      mocks.cyclrService.getTemplatesByTag = jest.fn().mockResolvedValueOnce([template])
      const connector = createMock<ConnectorDto>();
      connector.name = "BlockSpaces";
      connector.authenticated = false;
      connector.systemConnector = false;
      template.connectors = [connector];
      mocks.cyclrService.getAccountConnectors = jest.fn().mockResolvedValueOnce([connector])
      const cyclrCycle1 = createMock<CyclrCycle>();
      mocks.cyclrService.installTemplate = jest.fn().mockResolvedValueOnce(cyclrCycle1);
      mocks.webhookService.createWebhookSubscription = jest.fn().mockResolvedValue(() => Promise.resolve())
      const expectedResponse = [cyclrCycle1];
      await expect(integrationService.addIntegration('', '', '')).resolves.toStrictEqual(expectedResponse);
    })

    it("Should fail adding an integration if there is an issue adding getting account connectors when authenticating BlockSpaces Connector", async () => {
      mocks.cyclrService.createAccount = jest.fn().mockResolvedValueOnce(() => Promise.resolve())
      const template = createMock<CycleTemplate>();
      mocks.cyclrService.getTemplatesByTag = jest.fn().mockResolvedValue([template])
      mocks.cyclrService.getAccountConnectors = jest.fn().mockRejectedValue(new ServiceUnavailableException())
      await expect(integrationService.addIntegration('', '', '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it("Should return an empty array of cycles", async () => {
      mocks.cyclrService.createAccount = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      mocks.cyclrService.getTemplatesByTag = jest.fn().mockResolvedValue([])
      jest.spyOn(integrationService as any, 'updateBlockSpacesConnectorSettings').mockImplementationOnce(() => Promise.resolve());
      const expectedResponse: CyclrCycle[] = [];
      await expect(integrationService.addIntegration('', '', '')).resolves.toEqual(expectedResponse);
    })

    it("Should fail if there is an error installing a template", async () => {
      mocks.cyclrService.createAccount = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      const cyclrCycle1 = createMock<CyclrCycle>();
      mocks.cyclrService.getTemplatesByTag = jest.fn().mockResolvedValue([cyclrCycle1])
      jest.spyOn(integrationService as any, 'updateBlockSpacesConnectorSettings').mockImplementationOnce(() => Promise.resolve());
      mocks.cyclrService.installTemplate = jest.fn().mockRejectedValueOnce(new ServiceUnavailableException());
      await expect(integrationService.addIntegration('', '', '')).rejects.toThrowError(ServiceUnavailableException);
    })

    it("Should return an array of installed cycles as a part of the integration", async () => {
      mocks.cyclrService.createAccount = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      const cyclrCycle1 = createMock<CyclrCycle>();
      mocks.cyclrService.getTemplatesByTag = jest.fn().mockResolvedValue([cyclrCycle1])
      jest.spyOn(integrationService as any, 'updateBlockSpacesConnectorSettings').mockImplementationOnce(() => Promise.resolve());
      mocks.cyclrService.installTemplate = jest.fn().mockResolvedValueOnce(cyclrCycle1);
      const expectedResponse = [cyclrCycle1];
      await expect(integrationService.addIntegration('', '', '')).resolves.toEqual(expectedResponse);
    })

  })

  describe('activateIntegration', () => {

    it("Should fail activating integration when receiving error form Cyclr.getCycles", async () => {
      mocks.cyclrService.getCycles = jest.fn().mockRejectedValueOnce(new BadRequestException());
      await expect(integrationService.activateIntegration('', '')).rejects.toThrowError(BadRequestException);
    });

    it("Should fail activating integration when receiving error form Cyclr.activateCycle", async () => {
      const cycle = createMock<CyclrCycle>();
      mocks.cyclrService.getCycles = jest.fn().mockResolvedValueOnce([cycle]);
      mocks.cyclrService.activateCycle = jest.fn().mockRejectedValue(new NotFoundException());
      await expect(integrationService.activateIntegration('', '')).rejects.toThrowError(NotFoundException);
    });

    it("Should succeed activating integration", async () => {
      const cycle = createMock<CyclrCycle>();
      mocks.cyclrService.getCycles = jest.fn().mockResolvedValueOnce([cycle]);
      mocks.cyclrService.activateCycle = jest.fn().mockResolvedValue(Promise.resolve());
      await expect(integrationService.activateIntegration('', '')).resolves.toBeUndefined();
    });



  })

  describe('stopIntegration', () => {

    it("Should fail stopping integration when receiving error form Cyclr.getCycles", async () => {
      mocks.cyclrService.getCycles = jest.fn().mockRejectedValueOnce(new BadRequestException());
      await expect(integrationService.stopIntegration('', '')).rejects.toThrowError(BadRequestException);
    });

    it("Should fail stopping integration when receiving error form Cyclr.deactivateCycle", async () => {
      const cycle = createMock<CyclrCycle>();
      mocks.cyclrService.getCycles = jest.fn().mockResolvedValueOnce([cycle]);
      mocks.cyclrService.deactivateCycle = jest.fn().mockRejectedValue(new NotFoundException());
      await expect(integrationService.stopIntegration('', '')).rejects.toThrowError(NotFoundException);
    });

    it("Should succeed stopping integration", async () => {
      const cycle = createMock<CyclrCycle>();
      mocks.cyclrService.getCycles = jest.fn().mockResolvedValueOnce([cycle]);
      mocks.cyclrService.deactivateCycle = jest.fn().mockResolvedValue(Promise.resolve());
      await expect(integrationService.stopIntegration('', '')).resolves.toBeUndefined();
    });



  })

  describe('removeIntegration', () => {

    it("Should fail removing integration when receiving error form Cyclr.getCycles", async () => {
      mocks.cyclrService.getCycles = jest.fn().mockRejectedValueOnce(new BadRequestException());
      await expect(integrationService.removeIntegration('', '')).rejects.toThrowError(BadRequestException);
    });

    it("Should fail removing integration when receiving error form Cyclr.deleteCycle", async () => {
      const cycle = createMock<CyclrCycle>();
      mocks.cyclrService.getCycles = jest.fn().mockResolvedValueOnce([cycle]);
      mocks.cyclrService.deleteCycle = jest.fn().mockRejectedValue(new BadRequestException());
      await expect(integrationService.removeIntegration('', '')).rejects.toThrowError(BadRequestException);
    });

    it("Should succeed removing integration", async () => {
      const cycle = createMock<CyclrCycle>();
      mocks.cyclrService.getCycles = jest.fn().mockResolvedValueOnce([cycle]);
      mocks.cyclrService.deleteCycle = jest.fn().mockResolvedValue(Promise.resolve());
      mocks.cyclrService.deleteAccountConnector = jest.fn().mockResolvedValue(Promise.resolve());
      await expect(integrationService.removeIntegration('', '')).resolves.toBeUndefined();
    });



  })

  describe('getAuthLink', () => {
    it("Should fail getting auth link when receiving error from Cyclr.getAccountConnector", async () => {
      mocks.cyclrService.getAccountConnector = jest.fn().mockRejectedValueOnce(new BadRequestException());
      await expect(integrationService.getAuthLink(0, '', '', '')).rejects.toThrowError(BadRequestException);
    })

    it("Should fail getting auth link when requesting an AuthLink for a connector that is not OAuth1 or OAuth2", async () => {
      const connector = createMock<ConnectorDto>();
      connector.authType = CyclrAuthTypes.BASIC;
      mocks.cyclrService.getAccountConnector = jest.fn().mockResolvedValueOnce(connector);
      // mocks.cyclrService.getOAuthLink = jest.fn().mockRejectedValueOnce(new BadRequestException());
      await expect(integrationService.getAuthLink(0, '', '', '')).rejects.toThrowError(UnauthorizedException);
    })

    it("Should fail getting auth link when receiving error from Cyclr.getOAuthLink", async () => {
      const connector = createMock<ConnectorDto>();
      connector.authType = CyclrAuthTypes.OAUTH2;
      mocks.cyclrService.getAccountConnector = jest.fn().mockResolvedValueOnce(connector);
      mocks.cyclrService.getOAuthLink = jest.fn().mockRejectedValueOnce(new BadRequestException());
      await expect(integrationService.getAuthLink(0, '', '', '')).rejects.toThrowError(BadRequestException);
    })

    it("Should get a link to get authentication for the connector", async () => {

      const connector = createMock<ConnectorDto>();
      connector.authType = CyclrAuthTypes.OAUTH2;
      mocks.cyclrService.getAccountConnector = jest.fn().mockResolvedValueOnce(connector);
      mocks.cyclrService.getOAuthLink = jest.fn().mockResolvedValueOnce('');
      await expect(integrationService.getAuthLink(0, '', '', '')).resolves.toEqual('');

    });

  })

  describe('disconnectConnector', () => {
    it("Should fail disconnecting from a connector", async () => {
      mocks.cyclrService.getAccountConnector = jest.fn().mockRejectedValue(new BadRequestException());
      await expect(integrationService.disconnect(0, '')).rejects.toThrowError(BadRequestException);
    })

    it("Should disconnect from a connector", async () => {
      mocks.cyclrService.getAccountConnector = jest.fn().mockResolvedValue(Promise.resolve());
      mocks.cyclrService.deauthenticateConnector = jest.fn().mockResolvedValue(Promise.resolve());
      await expect(integrationService.disconnect(0, '')).resolves.not.toThrowError();
    });
  })

  describe('getEmbedLink', () => {
    it("Should fail getting an embed link", async () => {
      mocks.cyclrService.getEmbedLink = jest.fn().mockRejectedValue(new BadRequestException());
      await expect(integrationService.getEmbedLink('', '', '')).rejects.toThrowError(BadRequestException);
    })

    it("Should succeed getting an embed link", async () => {
      mocks.cyclrService.getEmbedLink = jest.fn().mockResolvedValue('');
      await expect(integrationService.getEmbedLink('', '', '')).resolves.toEqual('');
    });
  })


});

