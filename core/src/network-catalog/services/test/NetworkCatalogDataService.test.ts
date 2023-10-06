import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { StripeService } from "../../../stripe/services/StripeService";
import { NetworkCatalogDataService } from "../NetworkCatalogDataService";
import { createMock } from "ts-auto-mock";
import MockData from "./NetworkCatalogDataServiceTestObjects.json";
import { NetworkId } from "@blockspaces/shared/models/networks";
import { NetworkOfferingAutoLinkDto } from "@blockspaces/shared/dtos/network-catalog";
import { NetworkOffering, NetworkPrice } from "@blockspaces/shared/models/network-catalog";
import { QuickbooksLineItemService } from "../../../quickbooks/services/QuickbooksLineItemService";

describe(`${NetworkCatalogDataService.name}`, () => {


  let service: NetworkCatalogDataService;

  let mockServices: {
    db: ConnectDbDataContext,
    stripeServices: StripeService,
    quickbooksLineItemService: QuickbooksLineItemService
  };

  let mockData: {
    networkId: String,
    offerConfig: NetworkOfferingAutoLinkDto,
    networkPrices: NetworkPrice[]
  };

  beforeEach(() => {
    mockServices = {
      db: createMock<ConnectDbDataContext>(),
      stripeServices: createMock<StripeService>(),
      quickbooksLineItemService: createMock<QuickbooksLineItemService>()
    };
    mockData = {
      networkId: createMock<String>(),
      offerConfig: createMock<NetworkOfferingAutoLinkDto>(),
      networkPrices: createMock<NetworkPrice[]>()
    };

    service = new NetworkCatalogDataService(mockServices.db, mockServices.stripeServices, mockServices.quickbooksLineItemService);
  });

  describe(`${NetworkCatalogDataService.prototype.findAll.name}`, () => {
    it(`${NetworkCatalogDataService.prototype.findAll.name} should be defined`, async () => {
      expect(service.findAll).toBeDefined();
    });
  });

  describe(`${NetworkCatalogDataService.prototype.findById.name}`, () => {
    it(`${NetworkCatalogDataService.prototype.findById.name} should be defined`, async () => {
      expect(service.findById).toBeDefined();
    });
  });

  describe(`${NetworkCatalogDataService.prototype.getPricesForNetwork.name}`, () => {
    it(`${NetworkCatalogDataService.prototype.getPricesForNetwork.name}`, async () => {
      // arrange
      mockServices.db.networkPrices.find = jest.fn().mockImplementation((data) => ({
        populate: () => mockData.networkPrices
      }));


      // act
      const priceResults = await service.getPricesForNetwork(mockData.networkId.toString());

      // assert
      expect(priceResults).toBeDefined();
    });
  });

  describe(`${NetworkCatalogDataService.prototype.getPricesForNetwork.name}`, () => {

    it(`${NetworkCatalogDataService.prototype.getPricesForNetwork.name}`, async () => {
      // arrange
      mockServices.db.networkPrices.find = jest.fn().mockImplementation((data) => ({
        populate: () => mockData.networkPrices
      }));


      // act
      const priceResults = await service.getPricesForNetwork(mockData.networkId.toString());

      // assert
      expect(priceResults).toBeDefined();
    });
  });


  // describe(`${NetworkCatalogDataService.prototype.autoLinkNetworkWithStripe.name}`, () => {

  //   it(`${NetworkCatalogDataService.prototype.autoLinkNetworkWithStripe.name}`, async () => {
  //     // arrange

  //     // act
  //     const priceResults = await service.autoLinkNetworkWithStripe(mockData.networkId.toString(), mockData.offerConfig);

  //     // assert
  //     expect(priceResults).toBeDefined();
  //   });

  // });

  describe(`${NetworkCatalogDataService.prototype.createNetworkOfferingWithIntegrations.name}`, () => {
    it(`${NetworkCatalogDataService.prototype.createNetworkOfferingWithIntegrations.name} should be defined`, async () => {
      expect(service.createNetworkOfferingWithIntegrations).toBeDefined();
    });
  });


  describe(`${NetworkCatalogDataService.prototype.getNetworkOfferingsForCart.name}`, () => {

    it(`${NetworkCatalogDataService.prototype.getNetworkOfferingsForCart.name}`, async () => {
      // arrange
      mockServices.db.networkOfferings.find = jest.fn().mockImplementation((data) => ({
        populate: () => ({
          populate: () => ({ populate: () => createMock<NetworkOffering[]>() })
        })
      }));
      jest.spyOn(service as any, "getPricesForNetwork").mockResolvedValueOnce(mockData.networkPrices);

      // act
      const priceResults = await service.getNetworkOfferingsForCart(mockData.networkId.toString(), '');

      // assert
      expect(priceResults).toBeDefined();
    });
  });

  describe(`${NetworkCatalogDataService.prototype.getActiveNetworkOfferingsByNetworkId.name}`, () => {
    it(`${NetworkCatalogDataService.prototype.getActiveNetworkOfferingsByNetworkId.name} should be defined`, async () => {
      expect(service.getActiveNetworkOfferingsByNetworkId).toBeDefined();
    });
  });


});