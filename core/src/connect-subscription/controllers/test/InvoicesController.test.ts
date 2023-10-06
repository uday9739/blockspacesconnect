import { createMock } from "ts-auto-mock";
import { ADMIN_ONLY_DECORATOR_KEY } from "../../../auth/decorators/AdminOnly.decorator";
import { UserNetworkDataService } from "../../../user-network/services/UserNetworkDataService";
import { UserDataService } from "../../../users/services/UserDataService";
import { ConnectSubscriptionService } from "../../services/ConnectSubscriptionService";
import { PaymentStorageService } from "../../services/PaymentStorageService";
import { ConnectSubscriptionController } from "../ConnectSubscriptionController";
import { InvoicesController } from "../InvoicesController";
import { StripeService } from "../../../stripe/services/StripeService";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";



describe(InvoicesController, () => {

  let controller: InvoicesController;
  let mocks: {
    db: ConnectDbDataContext,
    stripeService: StripeService,
  };

  beforeAll(() => {

    mocks = {
      db: createMock<ConnectDbDataContext>(),
      stripeService: createMock<StripeService>(),
    };

    controller = new InvoicesController(mocks.db, mocks.stripeService);
  });


  describe(`${InvoicesController.prototype.getInvoicesForTenant.name}`, () => {
    it(`${InvoicesController.prototype.getInvoicesForTenant.name} should be defined`, async () => {
      expect(controller.getInvoicesForTenant).toBeDefined();
    });
  });

  describe(`${InvoicesController.prototype.getInvoiceById.name}`, () => {
    it(`${InvoicesController.prototype.getInvoiceById.name} should be defined`, async () => {
      expect(controller.getInvoiceById).toBeDefined();
    });
  });

});