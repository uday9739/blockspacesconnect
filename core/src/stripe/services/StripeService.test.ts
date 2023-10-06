import { StripeService } from "./StripeService";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { createMock } from "ts-auto-mock";
import { EnvironmentVariables } from "../../env";

describe(`${StripeService.name}`, () => {
  let service: StripeService;
  let mocks: {
    logger: ConnectLogger;
    env: EnvironmentVariables;
  };

  beforeEach(() => {
    mocks = {
      logger: createMock<ConnectLogger>(),
      env: createMock<EnvironmentVariables>({
        stripe: {
          secretKey: ""
        }
      })
    };

    service = new StripeService(mocks.env, mocks.logger);
  });
  //

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it(`${StripeService.prototype.getCustomerById.name} should be defined`, async () => {
    expect(service.getCustomerById).toBeDefined();

  });


  it(`${StripeService.prototype.getCustomerByEmail.name} should be defined`, async () => {
    expect(service.getCustomerByEmail).toBeDefined();
  });


  it(`${StripeService.prototype.createCustomer.name} should be defined`, async () => {
    expect(service.createCustomer).toBeDefined();
  });


  it(`${StripeService.prototype.createSubscription.name} should be defined`, async () => {
    expect(service.createSubscription).toBeDefined();
  });


  it(`${StripeService.prototype.setSubscriptionDefaultPaymentMethod.name} should be defined`, async () => {
    expect(service.setSubscriptionDefaultPaymentMethod).toBeDefined();
  });


  it(`${StripeService.prototype.getSubscriptionLatestInvoicePaymentAmountAndSecret.name} should be defined`, async () => {
    expect(service.getSubscriptionLatestInvoicePaymentAmountAndSecret).toBeDefined();
  });


  it(`${StripeService.prototype.cancelSubscription.name} should be defined`, async () => {
    expect(service.cancelSubscription).toBeDefined();
  });


  it(`${StripeService.prototype.getSubscriptionStatus.name} should be defined`, async () => {
    expect(service.getSubscriptionStatus).toBeDefined();
  });


  it(`${StripeService.prototype.captureSubscriptionUsage.name} should be defined`, async () => {
    expect(service.captureSubscriptionUsage).toBeDefined();
  });

  it(`${StripeService.prototype.addItemToSubscription.name} should be defined`, async () => {
    expect(service.addItemToSubscription).toBeDefined();
  });

  it(`${StripeService.prototype.removeItemFromSubscription.name} should be defined`, async () => {
    expect(service.removeItemFromSubscription).toBeDefined();
  });

  it(`${StripeService.prototype.getItemsForSubscription.name} should be defined`, async () => {
    expect(service.getItemsForSubscription).toBeDefined();
  });

  it(`${StripeService.prototype.getProrateAmountForSubscription.name} should be defined`, async () => {
    expect(service.getProrateAmountForSubscription).toBeDefined();
  });

  it(`${StripeService.prototype.getInvoiceById.name} should be defined`, async () => {
    expect(service.getInvoiceById).toBeDefined();
  });

  it(`${StripeService.prototype.getInvoiceTotal.name} should be defined`, async () => {
    expect(service.getInvoiceTotal).toBeDefined();
  });

  it(`${StripeService.prototype.listPricesByConnectNetworkId.name} should be defined`, async () => {
    expect(service.listPricesByConnectNetworkId).toBeDefined();
  });

  it(`${StripeService.prototype.getPaymentIntent.name} should be defined`, async () => {
    expect(service.getPaymentIntent).toBeDefined();
  });


  it(`${StripeService.prototype.getStripeWebhookEvent.name} should be defined`, async () => {
    expect(service.getStripeWebhookEvent).toBeDefined();
  });

  it(`${StripeService.prototype.listPricesByStripeParentProductId.name} should be defined`, async () => {
    expect(service.listPricesByStripeParentProductId).toBeDefined();
  });

  it(`${StripeService.prototype.createProduct.name} should be defined`, async () => {
    expect(service.createProduct).toBeDefined();
  });

  it(`${StripeService.prototype.createProductPrice.name} should be defined`, async () => {
    expect(service.createProductPrice).toBeDefined();
  });

  it(`${StripeService.prototype.findProductByName.name} should be defined`, async () => {
    expect(service.findProductByName).toBeDefined();
  });

  it(`${StripeService.prototype.createPaymentIntent.name} should be defined`, async () => {
    expect(service.createPaymentIntent).toBeDefined();
  });

  it(`${StripeService.prototype.listPricesByStripeProductConnectNetworkId.name} should be defined`, async () => {
    expect(service.listPricesByStripeProductConnectNetworkId).toBeDefined();
  });


  it(`${StripeService.prototype.updateProduct.name} should be defined`, async () => {
    expect(service.updateProduct).toBeDefined();
  });

  it(`${StripeService.prototype.getProductByStripeId.name} should be defined`, async () => {
    expect(service.getProductByStripeId).toBeDefined();
  });

  it(`${StripeService.prototype.listProducts.name} should be defined`, async () => {
    expect(service.listProducts).toBeDefined();
  });

  it(`${StripeService.prototype.updateProductPrice.name} should be defined`, async () => {
    expect(service.updateProductPrice).toBeDefined();
  });

  it(`${StripeService.prototype.getCustomerCreditCardsOnFile.name} should be defined`, async () => {
    expect(service.getCustomerCreditCardsOnFile).toBeDefined();
  });

  it(`${StripeService.prototype.getCustomerCreditCardsOnFile.name} should be defined`, async () => {
    expect(service.getCustomerCreditCardsOnFile).toBeDefined();
  });

  it(`${StripeService.prototype.deletePaymentMethod.name} should be defined`, async () => {
    expect(service.deletePaymentMethod).toBeDefined();
  });

  it(`${StripeService.prototype.createSetupIntent.name} should be defined`, async () => {
    expect(service.createSetupIntent).toBeDefined();
  });

});