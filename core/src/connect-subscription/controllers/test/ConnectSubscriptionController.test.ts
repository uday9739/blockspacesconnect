import { createMock } from "ts-auto-mock";
import { ADMIN_ONLY_DECORATOR_KEY } from "../../../auth/decorators/AdminOnly.decorator";
import { UserNetworkDataService } from "../../../user-network/services/UserNetworkDataService";
import { UserDataService } from "../../../users/services/UserDataService";
import { ConnectSubscriptionService } from "../../services/ConnectSubscriptionService";
import { PaymentStorageService } from "../../services/PaymentStorageService";
import { ConnectSubscriptionController } from "../ConnectSubscriptionController";



describe(ConnectSubscriptionController, () => {

  let controller: ConnectSubscriptionController;
  let mocks: {
    connectSubscriptionService: ConnectSubscriptionService,
    userDataService: UserDataService,
    paymentStorageService: PaymentStorageService,
    userNetworkDataService: UserNetworkDataService
  };

  beforeAll(() => {

    mocks = {
      connectSubscriptionService: createMock<ConnectSubscriptionService>(),
      userDataService: createMock<UserDataService>(),
      paymentStorageService: createMock<PaymentStorageService>(),
      userNetworkDataService: createMock<UserNetworkDataService>()
    };

    controller = new ConnectSubscriptionController(mocks.connectSubscriptionService, mocks.userDataService, mocks.userNetworkDataService);
  });


  describe(`${ConnectSubscriptionController.prototype.getSubscriptionForUser.name}`, () => {
    it(`${ConnectSubscriptionController.prototype.getSubscriptionForUser.name} should be defined`, async () => {
      expect(controller.getSubscriptionForUser).toBeDefined();
    });
  });

  describe(`${ConnectSubscriptionController.prototype.cancelSelectServicesByNetworkIdAndBillingCategory.name}`, () => {
    it(`${ConnectSubscriptionController.prototype.cancelSelectServicesByNetworkIdAndBillingCategory.name} should be defined`, async () => {
      expect(controller.cancelSelectServicesByNetworkIdAndBillingCategory).toBeDefined();
    });
  });

  describe(`${ConnectSubscriptionController.prototype.cancelSelectServicesForUserByNetworkIdAndBillingCategory.name}`, () => {
    it(`${ConnectSubscriptionController.prototype.cancelSelectServicesForUserByNetworkIdAndBillingCategory.name} should be defined`, async () => {
      expect(controller.cancelSelectServicesForUserByNetworkIdAndBillingCategory).toBeDefined();
    });

    it(`ensure ${ConnectSubscriptionController.prototype.cancelSelectServicesForUserByNetworkIdAndBillingCategory.name} implements AdminOnly Guard`, async () => {
      const isAdminOnlyApplied = Reflect.getMetadata(ADMIN_ONLY_DECORATOR_KEY, ConnectSubscriptionController.prototype.cancelSelectServicesForUserByNetworkIdAndBillingCategory);
      expect(isAdminOnlyApplied).toEqual(true);
    });
  });

});