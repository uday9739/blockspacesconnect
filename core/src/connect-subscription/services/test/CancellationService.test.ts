import { CancellationService } from "../CancellationService";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { EnvironmentVariables } from "../../../env";
import { UserNetworkDataService } from "../../../user-network/services/UserNetworkDataService";
import { UserDataService } from "../../../users/services/UserDataService";
import { EndpointsService } from "../../../endpoints/services";
import { createMock } from "ts-auto-mock";
import { IUser } from "@blockspaces/shared/models/users";
import { NetworkPriceBillingCategory } from "@blockspaces/shared/models/network-catalog";
import { UserNetwork } from "@blockspaces/shared/models/networks";
import { BscStatusResponse } from "../../../legacy/types/BscStatusResponse";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { LightningWalletService } from "../../../networks/lightning/wallet/services/LightningWalletService";
import { LndService } from "../../../networks/lightning/lnd/services/LndService";
import { TaskQueueItemDataService } from "../../../task-queue/services/TaskQueueItemDataService";
import { JiraService } from "../../../jira/services/JiraService";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";

describe(`${CancellationService.name}`, () => {

  let service: CancellationService;

  let mockServices: {
    env: EnvironmentVariables,
    logger: ConnectLogger,
    userNetworkDataService: UserNetworkDataService,
    userDataService: UserDataService,
    endpointsService: EndpointsService,
    taskQueueItemDataService: TaskQueueItemDataService,
    lightningWalletService: LightningWalletService,
    lndService: LndService,
    jiraService: JiraService,
    dataContext: ConnectDbDataContext
  };

  let mockData: {
    user: IUser,
    networkId: String,
    billingCategory: NetworkPriceBillingCategory,
    userNetwork: UserNetwork,
    userBscStatusResponse: BscStatusResponse
  };

  beforeEach(() => {
    mockServices = {
      env: createMock<EnvironmentVariables>(),
      logger: createMock<ConnectLogger>(),
      userNetworkDataService: createMock<UserNetworkDataService>(),
      userDataService: createMock<UserDataService>(),
      endpointsService: createMock<EndpointsService>(),
      taskQueueItemDataService: createMock<TaskQueueItemDataService>(),
      lightningWalletService: createMock<LightningWalletService>(),
      lndService: createMock<LndService>(),
      jiraService: createMock<JiraService>(),
      dataContext: createMock<ConnectDbDataContext>()
    };
    mockData = {
      user: createMock<IUser>(),
      networkId: createMock<String>(),
      billingCategory: createMock<NetworkPriceBillingCategory>(),
      userNetwork: createMock<UserNetwork>(),
      userBscStatusResponse: createMock<BscStatusResponse>({
        data: createMock<IUser>(),
        status: ApiResultStatus.Success
      }),
    };

    service = new CancellationService(mockServices.env, mockServices.logger,
      mockServices.userNetworkDataService, mockServices.userDataService, mockServices.endpointsService,
      mockServices.taskQueueItemDataService, mockServices.lightningWalletService, mockServices.lndService, mockServices.jiraService, mockServices.dataContext);
  });


  describe(`${CancellationService.prototype.disableNetworkServiceOffering.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.disableNetworkServiceOffering).toBeDefined();
    });
    it(`should return`, async () => {
      // arrange
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockImplementation((data) => (mockData.userNetwork));
      mockServices.userNetworkDataService.update = jest.fn().mockImplementation((data) => (mockData.userNetwork));
      mockServices.userDataService.update = jest.fn().mockImplementation((data) => (mockData.userBscStatusResponse));

      // act
      await expect(service.disableNetworkServiceOffering(mockData.user, mockData.networkId.toString(), mockData.billingCategory)).resolves.not.toThrow();

    });

  });

  describe(`${CancellationService.prototype.terminateNetworkServiceOffering.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.terminateNetworkServiceOffering).toBeDefined();
    });

    it(` should return`, async () => {
      // arrange
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockImplementation((data) => (mockData.userNetwork));
      mockServices.userNetworkDataService.deleteUserNetwork = jest.fn().mockImplementation((data) => (mockData.userNetwork));

      // act
      await expect(service.terminateNetworkServiceOffering(mockData.user, mockData.networkId.toString(), mockData.billingCategory)).resolves.not.toThrow();

    });

  });

  describe(`${CancellationService.prototype.resumeNetworkServiceOffering.name}`, () => {
    it(` should be defined`, async () => {
      expect(service.resumeNetworkServiceOffering).toBeDefined();
    });
    it(`should return`, async () => {
      // arrange
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockImplementation((data) => (mockData.userNetwork));
      mockServices.userNetworkDataService.update = jest.fn().mockImplementation((data) => (mockData.userNetwork));
      mockServices.userDataService.update = jest.fn().mockImplementation((data) => (mockData.userBscStatusResponse));
      // act
      await expect(service.resumeNetworkServiceOffering(mockData.user, mockData.networkId.toString(), mockData.billingCategory)).resolves.not.toThrow();


    });

  });

  describe(`${CancellationService.prototype.processBipNodeTermination.name}`, () => {
    it(` should be defined`, async () => {
      expect(service.processBipNodeTermination).toBeDefined();
    });

    it(`should be return true`, async () => {
      // arrange
      const userId = "123";
      const tenantId = "123";
      jest.spyOn(service as any, "isBipNodeReadyToCancel").mockResolvedValueOnce(true);
      jest.spyOn(service as any, "createBipNodeWipeDevOpsRequest").mockResolvedValueOnce({});
      mockServices.userDataService.getUserById = jest.fn().mockResolvedValueOnce(createMock<IUser>);
      mockServices.userDataService.update = jest.fn().mockResolvedValueOnce(createMock<BscStatusResponse>({ status: ApiResultStatus.Success }));
      mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockResolvedValueOnce(createMock<NetworkPriceBillingCategory>());
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockResolvedValueOnce(createMock<UserNetwork>());
      mockServices.userNetworkDataService.deleteUserNetwork = jest.fn().mockResolvedValueOnce(null);
      // act
      const result = await service.processBipNodeTermination(tenantId, userId);

      // assert
      expect(result).toBeTruthy();

    });


  });

});