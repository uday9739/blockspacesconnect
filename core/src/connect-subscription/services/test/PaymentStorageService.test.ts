import { ApiResultWithError } from "@blockspaces/shared/models/ApiResult";
import { ConnectSubscription } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { IUser } from "@blockspaces/shared/models/users";
import { createMock } from "ts-auto-mock";
import { EnvironmentVariables } from "../../../env";
import { StripeService } from "../../../stripe/services/StripeService";
import { StripeCreditCard, StripeCreditCardResult } from "../../../stripe/types/StripeTypes";
import { PaymentStorageService } from "../PaymentStorageService";

describe(`${PaymentStorageService.name}`, () => {
  let service: PaymentStorageService;

  let mockServices: {
    env: EnvironmentVariables,
    stripeService: StripeService
  };
  let mockData: {
    user: IUser,
    connectSubscription: ConnectSubscription
    stripeCreditCardSuccessResult: StripeCreditCardResult,
    defaultPaymentMethodsSuccessResult: ApiResultWithError<string, string>
  }

  beforeEach(() => {
    mockServices = {
      env: createMock<EnvironmentVariables>({
        stripe: {
          publishableKey: "1234"
        }
      }),
      stripeService: createMock<StripeService>(),
    };

    mockData = {
      user: createMock<IUser>({
        billingDetails: {
          stripe: {
            customerId: "123"
          }
        }
      }),
      connectSubscription: createMock<ConnectSubscription>({
        stripeSubscriptionId: "123"
      }),
      stripeCreditCardSuccessResult: StripeCreditCardResult.success(createMock<StripeCreditCard[]>()),
      defaultPaymentMethodsSuccessResult: ApiResultWithError.success()
    };

    service = new PaymentStorageService(mockServices.env, mockServices.stripeService);
  });

  describe(`${PaymentStorageService.prototype.getCreditCardsOnFileForSubscription.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.getCreditCardsOnFileForSubscription).toBeDefined();
    });
    it(`should return`, async () => {
      // arrange
      mockServices.stripeService.getCustomerCreditCardsOnFile = jest.fn().mockResolvedValueOnce(mockData.stripeCreditCardSuccessResult);
      mockServices.stripeService.getSubscriptionDefaultPaymentMethod = jest.fn().mockResolvedValueOnce(mockData.defaultPaymentMethodsSuccessResult);

      // act
      const results = await service.getCreditCardsOnFileForSubscription(mockData.user, mockData.connectSubscription);

      // assert
      expect(results).toBeDefined();

    });

  });


  describe(`${PaymentStorageService.prototype.removePaymentMethod.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.removePaymentMethod).toBeDefined();
    });
    it(`should return`, async () => {
      // arrange
      mockServices.stripeService.deletePaymentMethod = jest.fn().mockResolvedValueOnce(ApiResultWithError.success(true));


      // act
      const results = await service.removePaymentMethod(mockData.user, "123");

      // assert
      expect(results).toBeDefined();

    });

  });

  describe(`${PaymentStorageService.prototype.getPublishableKey.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.getPublishableKey).toBeDefined();
    });
    it(`should return`, async () => {
      // arrange
      // act
      const results = service.getPublishableKey();

      // assert
      expect(results).toBeDefined();

    });

  });



  describe(`${PaymentStorageService.prototype.createSetupIntent.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.createSetupIntent).toBeDefined();
    });
    it(`should return`, async () => {
      // arrange
      mockServices.stripeService.createSetupIntent = jest.fn().mockResolvedValueOnce(ApiResultWithError.success({}));


      // act
      const results = await service.createSetupIntent(mockData.user, "123");

      // assert
      expect(results).toBeDefined();

    });

  });

});