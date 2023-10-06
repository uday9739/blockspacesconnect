import { Network, NetworkId } from "@blockspaces/shared/models/networks";
import { HttpException, HttpStatus } from "@nestjs/common";
import { createMock } from "ts-auto-mock";
import { ADMIN_ONLY_DECORATOR_KEY } from "../../auth/decorators/AdminOnly.decorator";
import { NetworkCatalogDataService } from "../services/NetworkCatalogDataService";
import { NetworkCuratedResourcesDataServices } from "../services/NetworkCuratedResourcesDataServices";
import { NetworkCatalogController } from "./NetworkCatalogController";

describe(NetworkCatalogController, () => {

  let controller: NetworkCatalogController;
  let mocks: {
    repo: NetworkCatalogDataService,
    networkCuratedResources: NetworkCuratedResourcesDataServices
  };

  beforeAll(() => {

    mocks = {
      repo: createMock<NetworkCatalogDataService>(),
      networkCuratedResources: createMock<NetworkCuratedResourcesDataServices>()
    };

    controller = new NetworkCatalogController(mocks.repo, mocks.networkCuratedResources);
  });

  /*
  #############
  # getById()
  #############
  */
  describe(NetworkCatalogController.prototype.getById, () => {

    it('should return NOT_FOUND (404) status if no network is found', async () => {
      mocks.repo.findById = async () => null;

      try {
        await controller.getById(NetworkId.LIGHTNING);
        throw new Error("getById should throw when no network data is found")
      } catch (error) {

        expect(error).toBeInstanceOf(HttpException);
        expect((<HttpException>error).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should return network data based on given NetworkId', async () => {
      const network: Network = { _id: NetworkId.POCKET, name: "Pocket Network", description: "Relays and such" };
      mocks.repo.findById = async () => network;

      const result = await controller.getById(NetworkId.POCKET);
      expect(result.isSuccess);
      expect(result.data).toBe(network);
    });
  });

  // describe(`${NetworkCatalogController.prototype.autoLinkNetworkWithStripe.name}`, () => {
  //   it(`${NetworkCatalogController.prototype.autoLinkNetworkWithStripe.name} should be defined`, async () => {
  //     expect(controller.autoLinkNetworkWithStripe).toBeDefined();
  //   });

  //   it(`ensure ${NetworkCatalogController.prototype.autoLinkNetworkWithStripe} implements AdminOnly Guard`, async () => {
  //     const isAdminOnlyApplied = Reflect.getMetadata(ADMIN_ONLY_DECORATOR_KEY, NetworkCatalogController.prototype.autoLinkNetworkWithStripe);
  //     expect(isAdminOnlyApplied).toEqual(true);
  //   });
  // });

  describe(`${NetworkCatalogController.prototype.createNetworkOfferingWithIntegrations.name}`, () => {
    it(`${NetworkCatalogController.prototype.createNetworkOfferingWithIntegrations.name} should be defined`, async () => {
      expect(controller.createNetworkOfferingWithIntegrations).toBeDefined();
    });

    it(`ensure ${NetworkCatalogController.prototype.createNetworkOfferingWithIntegrations} implements AdminOnly Guard`, async () => {
      const isAdminOnlyApplied = Reflect.getMetadata(ADMIN_ONLY_DECORATOR_KEY, NetworkCatalogController.prototype.createNetworkOfferingWithIntegrations);
      expect(isAdminOnlyApplied).toEqual(true);
    });
  });

  describe(`${NetworkCatalogController.prototype.getNetworkOfferings.name}`, () => {
    it(`${NetworkCatalogController.prototype.getNetworkOfferings.name} should be defined`, async () => {
      expect(controller.getNetworkOfferings).toBeDefined();
    });
  });

  describe(`${NetworkCatalogController.prototype.getCuratedResourcesForNetwork.name}`, () => {
    it(`${NetworkCatalogController.prototype.getCuratedResourcesForNetwork.name} should be defined`, async () => {
      expect(controller.getCuratedResourcesForNetwork).toBeDefined();
    });
  });

})