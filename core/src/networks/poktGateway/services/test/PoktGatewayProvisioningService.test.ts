import MockData from "./PoktGatewayProvisioningService.test.json";
import PoktGatewayServiceMockData from "./PoktGatewayService.test.json";
import GatewayProvisioningService from "../PoktGatewayProvisioningService";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { HttpService } from "@blockspaces/shared/services/http";
import { createMock } from "ts-auto-mock";
import GatewayProxyService from "../PoktGatewayService";
import { UserDataService } from "../../../../users/services/UserDataService";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { UserNetworkOptimism } from "@blockspaces/shared/models/networks/OptimismNetwork";
import { GatewayNetworkStatus, GatewayUserAccountStatus, GatewayUserData, IGatewayNetwork } from "@blockspaces/shared/models/poktGateway";
import { NetworkId } from "@blockspaces/shared/models/networks";

describe(`${GatewayProvisioningService.name}`, () => {
  let gatewayProvisioningService: GatewayProvisioningService;
  let mocks: {
    httpService: HttpService;
    logger: ConnectLogger;
    service: GatewayProxyService;
    userDataService: UserDataService;
    dataContext: ConnectDbDataContext;
  };

  beforeEach(() => {
    mocks = {
      httpService: createMock<HttpService>(),
      logger: createMock<ConnectLogger>(),
      service: createMock<GatewayProxyService>(),
      userDataService: createMock<UserDataService>(),
      dataContext: createMock<ConnectDbDataContext>()
    };

    gatewayProvisioningService = new GatewayProvisioningService(mocks.service, mocks.userDataService, mocks.dataContext, mocks.logger);
  });
  //

  describe(`${GatewayProvisioningService.prototype.CreateNetworkEndpointForUser.name}`, () => {
    it(`Create Optimism Network without an existing Gateway User record`, async () => {
      // arrange
      const networkId = NetworkId.OPTIMISM;
      const userId = MockData.getUserByIdResponse.id;

      mocks.userDataService.getUserById = jest.fn().mockResolvedValueOnce(MockData.getUserByIdResponse);
      mocks.dataContext.gatewayUser.findOne = jest.fn().mockResolvedValueOnce(null);
      mocks.dataContext.gatewayUser.create = jest.fn().mockImplementation((data: GatewayUserData) => ({
        toObject: () => data
      }));
      mocks.service.CreateUserAccount = jest.fn().mockResolvedValueOnce(MockData.gatewayCreateUserResponse);
      mocks.dataContext.optimismNetwork.findOne = jest.fn().mockResolvedValueOnce(null);
      mocks.dataContext.optimismNetwork.create = jest.fn().mockImplementation((data: UserNetworkOptimism) => ({
        toObject: () => ({
          userId: data.userId,
          networkId: data.networkId,
          networkData: data.networkData
        })
      }));

      // act
      const results = await gatewayProvisioningService.CreateNetworkEndpointForUser(userId, networkId);

      // assert

      expect(results.data.gatewayUser.status).toEqual(GatewayUserAccountStatus.REQUESTED);
      expect((results.data.network.networkData as IGatewayNetwork).gatewayNetworkData.status).toEqual(GatewayNetworkStatus.REQUESTED);
    });

    it("Create Optimism Network with existing Gateway User status of REQUESTED", async () => {
      // arrange
      const networkId = NetworkId.OPTIMISM;
      const userId = MockData.getUserByIdResponse.id;

      mocks.userDataService.getUserById = jest.fn().mockResolvedValueOnce(MockData.getUserByIdResponse);
      mocks.dataContext.gatewayUser.findOne = jest.fn().mockResolvedValueOnce({
        toObject: () => MockData.poktGatewayUserRequested
      });

      mocks.service.CreateUserAccount = jest.fn().mockResolvedValueOnce(MockData.gatewayCreateUserResponse);
      mocks.dataContext.optimismNetwork.findOne = jest.fn().mockResolvedValueOnce(null);
      mocks.dataContext.optimismNetwork.create = jest.fn().mockImplementation((data: UserNetworkOptimism) => ({
        toObject: () => ({
          userId: data.userId,
          networkId: data.networkId,
          networkData: data.networkData
        })
      }));
      // act
      const results = await gatewayProvisioningService.CreateNetworkEndpointForUser(userId, networkId);

      // assert

      expect(results.data.gatewayUser.status).toEqual(GatewayUserAccountStatus.REQUESTED);
      expect((results.data.network.networkData as IGatewayNetwork).gatewayNetworkData.status).toEqual(GatewayNetworkStatus.REQUESTED);
    });

    it("Create Optimism Network existing Gateway User with status of CONFIRMED", async () => {
      // arrange
      const networkId = NetworkId.OPTIMISM;
      const userId = MockData.getUserByIdResponse.id;

      mocks.userDataService.getUserById = jest.fn().mockResolvedValueOnce(MockData.getUserByIdResponse);
      mocks.dataContext.gatewayUser.findOne = jest.fn().mockResolvedValueOnce({
        toObject: () => MockData.poktGatewayUserConfirmed
      });
      mocks.service.CreateUserAccount = jest.fn().mockResolvedValueOnce(MockData.gatewayCreateUserResponse);
      mocks.dataContext.optimismNetwork.findOne = jest.fn().mockResolvedValueOnce(null);
      mocks.dataContext.optimismNetwork.create = jest.fn().mockImplementation((data: UserNetworkOptimism) => ({
        toObject: () => ({
          userId: data.userId,
          networkId: data.networkId,
          networkData: data.networkData
        })
      }));
      // act
      const results = await gatewayProvisioningService.CreateNetworkEndpointForUser(userId, networkId);

      // assert

      expect(results.data.gatewayUser.status).toEqual(GatewayUserAccountStatus.CONFIRMED);
      expect((results.data.network.networkData as IGatewayNetwork).gatewayNetworkData.status).toEqual(GatewayNetworkStatus.CREATED);
    });
  });

  describe(`${GatewayProvisioningService.prototype.VerifyUser.name}`, () => {
    it("Verify Requested User Optimism Network", async () => {
      // arrange
      const expected_poktUserId = PoktGatewayServiceMockData.AuthenticateUserAccountResponse.data.data.user._id;
      const expected_appId = MockData.gatewayCreateApplicationResponse.data.apps[0].appId;
      const expected_loadBalancerId = MockData.gatewayCreateApplicationResponse.data.id;
      const userId = MockData.getUserByIdResponse.id;
      mocks.userDataService.getUserById = jest.fn().mockResolvedValueOnce(MockData.getUserByIdResponse);
      mocks.dataContext.gatewayUser.findOne = jest.fn().mockResolvedValueOnce({
        toObject: () => MockData.poktGatewayUserRequested
      });
      mocks.service.AuthenticateUserAccount = jest.fn().mockResolvedValueOnce(PoktGatewayServiceMockData.AuthenticateUserAccountResponse);
      mocks.service.CreateApplication = jest.fn().mockResolvedValueOnce(MockData.gatewayCreateApplicationResponse);
      mocks.dataContext.gatewayUser.updateByIdAndSave = jest.fn().mockImplementation(async (_id: string, data: GatewayUserData) => ({
        toObject: () => ({
          _id,
          ...data
        })
      }));
      mocks.dataContext.userNetworks.find = jest.fn().mockResolvedValue(MockData.userNetworkFindResults);
      mocks.dataContext.optimismNetwork.findOne = jest.fn().mockResolvedValue({
        toObject: () => MockData.userNetworkFindResults[0]
      });
      mocks.dataContext.optimismNetwork.updateByIdAndSave = jest.fn().mockImplementation(async (_id: string, data: UserNetworkOptimism) => ({ toObject: () => ({ _id, ...data }) }));
      // act
      const results = await gatewayProvisioningService.VerifyUser(userId);
      // assert
      expect(results.data.appId).toEqual(expected_appId);
      expect(results.data.loadBalancerId).toEqual(expected_loadBalancerId);
      expect(results.data.gatewayUserId).toEqual(expected_poktUserId);
      expect(results.data.status).toEqual(GatewayUserAccountStatus.CONFIRMED);
    });
  });
});
