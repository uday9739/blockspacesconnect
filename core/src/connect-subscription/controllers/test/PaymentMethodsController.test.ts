import { createMock } from "ts-auto-mock";
import { ADMIN_ONLY_DECORATOR_KEY } from "../../../auth/decorators/AdminOnly.decorator";
import { UserNetworkDataService } from "../../../user-network/services/UserNetworkDataService";
import { UserDataService } from "../../../users/services/UserDataService";
import { ConnectSubscriptionService } from "../../services/ConnectSubscriptionService";
import { PaymentStorageService } from "../../services/PaymentStorageService";
import { ConnectSubscriptionController } from "../ConnectSubscriptionController";
import { PaymentMethodsController } from "../PaymentMethodsController";



describe(PaymentMethodsController, () => {

  let controller: PaymentMethodsController;
  let mocks: {
    connectSubscriptionService: ConnectSubscriptionService,
    paymentStorageService: PaymentStorageService,
  };

  beforeAll(() => {

    mocks = {
      connectSubscriptionService: createMock<ConnectSubscriptionService>(),
      paymentStorageService: createMock<PaymentStorageService>(),
    };

    controller = new PaymentMethodsController(mocks.connectSubscriptionService, mocks.paymentStorageService);
  });


  describe(`${PaymentMethodsController.prototype.setDefaultPaymentMethod.name}`, () => {
    it(`${PaymentMethodsController.prototype.setDefaultPaymentMethod.name} should be defined`, async () => {
      expect(controller.setDefaultPaymentMethod).toBeDefined();
    });
  });

  describe(`${PaymentMethodsController.prototype.getPublishableKey.name}`, () => {
    it(`${PaymentMethodsController.prototype.getPublishableKey.name} should be defined`, async () => {
      expect(controller.getPublishableKey).toBeDefined();
    });
  });

  describe(`${PaymentMethodsController.prototype.attachPaymentMethod.name}`, () => {
    it(`${PaymentMethodsController.prototype.attachPaymentMethod.name} should be defined`, async () => {
      expect(controller.attachPaymentMethod).toBeDefined();
    });
  });

  describe(`${PaymentMethodsController.prototype.getPaymentInfo.name}`, () => {
    it(`${PaymentMethodsController.prototype.getPaymentInfo.name} should be defined`, async () => {
      expect(controller.getPaymentInfo).toBeDefined();
    });
  });

  describe(`${PaymentMethodsController.prototype.removePaymentMethod.name}`, () => {
    it(`${PaymentMethodsController.prototype.removePaymentMethod.name} should be defined`, async () => {
      expect(controller.removePaymentMethod).toBeDefined();
    });
  });


});