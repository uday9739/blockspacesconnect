import { ConnectSubscription } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { IUser } from "@blockspaces/shared/models/users";
import { Inject, Injectable } from "@nestjs/common";
import { StripeService } from "../../stripe/services/StripeService";
import { CreditCard } from "@blockspaces/shared/dtos/billing/CreditCard"
import { ValidationException } from "../../exceptions/common";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";

@Injectable()
export class PaymentStorageService {

  constructor(
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    private readonly stripeService: StripeService) { }

  /**
   * Get Credit Card on file from vendor
   * @param user 
   * @param connectSubscription 
   * @returns 
   */
  async getCreditCardsOnFileForSubscription(user: IUser, connectSubscription: ConnectSubscription): Promise<CreditCard[]> {
    let stripeDefaultPaymentMethod = null;
    const stripeCustomerId = user?.billingDetails?.stripe?.customerId?.toString();
    const stripeSubscriptionId = connectSubscription?.stripeSubscriptionId;
    const { data, isFailure } = await this.stripeService.getCustomerCreditCardsOnFile(stripeCustomerId);
    if (isFailure) return [];

    if (stripeSubscriptionId) {
      const { data } = await this.stripeService.getSubscriptionDefaultPaymentMethod(stripeSubscriptionId);
      stripeDefaultPaymentMethod = data;
    }

    return data?.map((x) => ({
      id: x.id,
      isDefault: stripeDefaultPaymentMethod === x.id,
      billingDetails: {
        address: {
          country: x.billingDetails?.address?.country,
          address1: x.billingDetails?.address?.line1,
          address2: x.billingDetails?.address?.line2,
          city: x.billingDetails?.address?.city,
          state: x.billingDetails?.address?.state,
          zipCode: x.billingDetails?.address?.postal_code
        }
      },
      card: {
        brand: x.card?.brand,
        country: x.card?.country,
        expMonth: x.card?.exp_month,
        expYear: x.card?.exp_year,
        fingerprint: x.card?.fingerprint,
        funding: x.card?.funding,
        last4: x.card?.last4,
      },
      created: x.created,
      type: x.type
    })).sort(x => !x.isDefault ? 1 : -1);
  }

  async removePaymentMethod(user: IUser, paymentMethodId: string): Promise<boolean> {
    const results = await this.stripeService.deletePaymentMethod(paymentMethodId);

    if (results.isFailure) {
      throw new ValidationException("Error removing payment method");
    }

    return true;
  }

  getPublishableKey(): string {
    return this.env.stripe.publishableKey;
  }

  async createSetupIntent(user: IUser, paymentMethodId: string): Promise<boolean> {
    const results = await this.stripeService.createSetupIntent(user.billingDetails?.stripe?.customerId?.toString(), paymentMethodId);
    if (results.isFailure) {
      throw new ValidationException(results.message);
    }
    return true;
  }


}

