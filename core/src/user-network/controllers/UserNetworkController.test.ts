import { AddUserNetworkRequest } from "@blockspaces/shared/dtos/user-network";
import { NetworkPriceBillingCategory } from "@blockspaces/shared/models/network-catalog";
import { BillingTier } from "@blockspaces/shared/models/network-catalog/Tier";
import { NetworkId } from "@blockspaces/shared/models/networks";
import { IUser } from "@blockspaces/shared/models/users";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { UserNetworkDataService } from "../services/UserNetworkDataService";
import { UserNetworkController } from "./UserNetworkController";

describe(UserNetworkController, () => {
  let controller: UserNetworkController;

  let mocks: {
    repo: UserNetworkDataService;
    db: ConnectDbDataContext
  };

  beforeEach(() => {
    mocks = {
      repo: createMock<UserNetworkDataService>(),
      db: createMock<ConnectDbDataContext>()
    };
    mocks.db.billingTier.findOne = jest.fn().mockResolvedValue(createMock<BillingTier>());
    mocks.db.networkPriceBillingCategories.findOne = jest.fn().mockResolvedValue(createMock<NetworkPriceBillingCategory>());

    controller = new UserNetworkController(mocks.repo, mocks.db);
  });


  // ##################
  // # addUserNetwork
  // ##################
  describe(UserNetworkController.prototype.addUserNetwork, () => {

    it('should add a new UserNetwork if one does not already exist', async () => {
      const user = createMock<IUser>({ id: "123" });
      const addRequest = new AddUserNetworkRequest({ networkId: NetworkId.POCKET });
      const expectedUserId = user.id;
      const expectedNetworkId = addRequest.networkId;

      mocks.repo.findByUserAndNetwork = async () => null;
      mocks.repo.addUserNetwork = async (data) => data;

      const result = await controller.addUserNetwork(user, addRequest);

      // console.log(result);
      expect(result.isSuccess).toBeTruthy();
      expect(result.data.networkId).toBe(expectedNetworkId);
      expect(result.data.userId).toBe(expectedUserId);
    });

    it('should return an HTTP 400 (Bad Request) if UserNetwork already exists', async () => {
      const user = createMock<IUser>({ id: "123" });
      const addRequest = new AddUserNetworkRequest({ networkId: NetworkId.POCKET });

      mocks.repo.findByUserAndNetwork = async () => ({
        networkId: addRequest.networkId,
        userId: user.id,
        billingCategory: '',
        billingTier: ''
      });

      await expect(() => controller.addUserNetwork(user, addRequest)).rejects.toThrow(BadRequestException);
    });
  });


  // ##################
  // # getByNetworkId
  // ##################
  describe(UserNetworkController.prototype.getByNetworkId, () => {

    it('should return HTTP 404 (Not Found) if no UserNetwork data is found', async () => {
      const user = createMock<IUser>();
      const networkId = NetworkId.POCKET;

      mocks.repo.findByUserAndNetwork = async () => null;

      await expect(() => controller.getByNetworkId(user, networkId, '')).rejects.toThrow(NotFoundException);
    });
  });
});