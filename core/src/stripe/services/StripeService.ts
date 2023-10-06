import { Inject, Injectable } from "@nestjs/common";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import Stripe from 'stripe';
import { StripePrice, StripeProduct, CancelSubscriptionResult, StripeProductResult, CreateStripeCustomer, CreateUpdateStripeProduct, CreateSubscriptionResult, StripeCustomer, StripeCustomerResult, StripeProductListResult, StripeProductPriceResult, StripeProductPricesResult, StripePaymentIntent, StripePaymentIntentResult, StripeProductPriceMetadata, StripeCustomerMetadata, StripeSubscriptionMetadata, SubscriptionPaymentSecretResult, UpdateResult, SubscriptionStatusResult, InvoiceTotalResult, StripeCreditCardResult, StripeCreditCard, ApplyCouponResult } from "../types/StripeTypes";
import { ApiResultWithError } from "@blockspaces/shared/models/ApiResult";



@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  constructor(@Inject(ENV_TOKEN) private readonly env: EnvironmentVariables, @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger) {

    logger.setModule(this.constructor.name);
    this.stripe = new Stripe(env.stripe.secretKey, {
      apiVersion: '2022-08-01'
    });
  }

  /**
   * Get Stripe customer by Stripe customer id
   * @param stripeCustomerId Stripe customer Id
   * @returns Stripe Customer Object
   */
  async getCustomerById(stripeCustomerId: string): Promise<StripeCustomerResult> {
    try {
      const customerResult = await this.stripe.customers.retrieve(stripeCustomerId);
      return StripeCustomerResult.success(customerResult as StripeCustomer);
    } catch (error) {
      this.logger.error(error.message, error);

      return StripeCustomerResult.failure(error.message);
    }
  }
  /**
   * Get Stripe customer by Stripe customer email
   * @param email Connect user email address that maps to Stripe customer record 
   * @returns Stripe Customer Object
   */
  async getCustomerByEmail(email: string): Promise<StripeCustomerResult> {
    try {
      const customerResult = await this.stripe.customers.list({ email: email });
      const customer = customerResult?.data?.pop() as StripeCustomer;
      return StripeCustomerResult.success(customer);
    } catch (error) {
      this.logger.error(error.message, error);
      return StripeCustomerResult.failure(error.message, error);
    }
  }
  /**
   * Create a stripe customer
   * @param model Required field for stripe customer
   * @returns Stripe Customer
   */
  async createCustomer(connectUserId: string, model: CreateStripeCustomer, companyName: string): Promise<StripeCustomerResult> {
    try {
      const customer = await this.stripe.customers.create({
        ...model,
        metadata: {
          ...model.metadata,
          [`${StripeCustomerMetadata.ConnectId}`]: connectUserId,// Map connect user id 
          [`${StripeCustomerMetadata.CompanyName}`]: companyName,
        }
      });
      if (!customer) StripeCustomerResult.failure("Error creating customer");
      return StripeCustomerResult.success(customer as StripeCustomer);
    } catch (error) {
      this.logger.error(error.message, error);
      return StripeCustomerResult.failure(error.message, error);
    }
  };

  /**
   * Create stripe Subscription object and link to Connect Subscription Id
   * @param connectSubscriptionId Connect Subscription Id
   * @param recurrence Connect Subscription recurrence
   * @param stripeCustomerId Stripe customer Id
   * @param priceIds Array of Stripe Price ids
   * @param allowIncompletePayment If true will not create a stripe payment_intent, only pass in true if NOT using {@link PaymentMethod.Fiat}
   * @returns 
   */
  async createSubscription(connectId: string, recurrence: string, stripeCustomerId: string,
    priceIds: { priceId: string }[], couponCode: string = null, allowIncompletePayment: boolean = false)
    : Promise<CreateSubscriptionResult> {

    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomerId,
        metadata: {
          [`${StripeSubscriptionMetadata.ConnectId}`]: connectId,
          [`${StripeSubscriptionMetadata.Recurrence}`]: recurrence
        },
        items: priceIds.map((price): Stripe.SubscriptionCreateParams.Item => ({
          price: price.priceId
        })),
        coupon: couponCode,
        payment_behavior: allowIncompletePayment === true ? 'allow_incomplete' : 'default_incomplete',
        // payment_intent will only be populated when ^line above^ payment_behavior = default_incomplete, ^line above^
        expand: ['latest_invoice.payment_intent'],
      });


      const result = {
        subscriptionId: subscription.id,
        stripeInvoiceId: (subscription.latest_invoice as Stripe.Invoice)?.id,
        stripePaymentIntentId: (subscription.latest_invoice as any)?.payment_intent?.id,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        amountDue: ((subscription.latest_invoice as Stripe.Invoice)?.amount_due || 0) / 100,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        items: subscription.items.data.map(x => ({ id: x.id, priceId: x.price.id })),
        discountTotal: (subscription.latest_invoice as Stripe.Invoice)?.total_discount_amounts?.reduce((total, discount) => (total + discount.amount / 100), 0)
      };

      return CreateSubscriptionResult.success(result);
    } catch (error) {
      this.logger.error(error.message, error);
      return CreateSubscriptionResult.failure(error.message, error);
    }
  };

  /**
   * Create stripe Subscription object and link to Connect Subscription Id
   * @param connectSubscriptionId Connect Subscription Id
   * @param recurrence Connect Subscription recurrence
   * @param stripeCustomerId Stripe customer Id
   * @param priceIds Array of Stripe Price ids
   * @param allowIncompletePayment If true will not create a stripe payment_intent, only pass in true if NOT using {@link PaymentMethod.Fiat}
   * @returns 
   */
  async applyCouponToSubscription(subscriptionId: string, couponCode: string)
    : Promise<ApplyCouponResult> {

    try {
      const subscription = await this.stripe.subscriptions.update(
        subscriptionId,
        {
          expand: ['latest_invoice.payment_intent'],
          coupon: couponCode
        }
      );
      const invoice = (subscription?.latest_invoice as Stripe.Invoice);
      const invoiceResult = await this.stripe.invoices.update(
        invoice.id,
        {
          expand: ['payment_intent'],
          discounts: [{ coupon: couponCode }]
        }
      );

      const amountDue = (invoiceResult?.amount_due || 0) / 100;
      const discountTotal = invoiceResult?.total_discount_amounts?.reduce((total, discount) => (total + discount.amount / 100), 0) ?? 0;
      return ApplyCouponResult.success({
        amountDue,
        discountTotal
      });
    } catch (error) {
      this.logger.error(error.message, error);
      return ApplyCouponResult.failure(error.message, error);
    }
  };

  /**
   * set payment method as the default payment method for that subscription
   * @param subscriptionId 
   * @param paymentMethodId 
   * @returns 
   */
  async setSubscriptionDefaultPaymentMethod(subscriptionId: string, paymentMethodId: string): Promise<UpdateResult> {
    try {
      const subscription = await this.stripe.subscriptions.update(
        subscriptionId,
        {
          default_payment_method: paymentMethodId,
        },
      );
      return UpdateResult.success(true);
    } catch (error) {
      this.logger.error(error.message, error);
      return UpdateResult.failure(error.message, error);
    }
  }

  /**
   * Get Payment token for latest subscription invoice
   * @param subscriptionId Stripe subscription id
   * @returns Payment token for Stripe subscription latest invoice
   */
  async getSubscriptionLatestInvoicePaymentAmountAndSecret(subscriptionId: string): Promise<SubscriptionPaymentSecretResult> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice.payment_intent']
      });

      const result = {
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        amountDue: ((subscription.latest_invoice as Stripe.Invoice)?.amount_due || 0) / 100,
        discountTotal: (subscription.latest_invoice as Stripe.Invoice)?.total_discount_amounts?.reduce((total, discount) => (total + discount.amount / 100), 0) ?? 0
      };

      return SubscriptionPaymentSecretResult.success(result);
    } catch (error) {
      this.logger.error(error.message, error);
      return SubscriptionPaymentSecretResult.failure(error.message, error);
    }
  }

  /**
   * Cancel Stripe Subscription
   * @param subscriptionId 
   * @returns 
   */
  async cancelSubscription(subscriptionId: string): Promise<CancelSubscriptionResult> {
    try {
      const deletedSubscription = await this.stripe.subscriptions.del(
        subscriptionId,
        {
          invoice_now: true
        }
      );
      return CancelSubscriptionResult.success(true);
    } catch (error) {
      this.logger.error(error.message, error);
      return CancelSubscriptionResult.failure(error.message, error);
    }
  }
  /**
 * Get Stripe Subscription Status
 */
  async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatusResult> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return SubscriptionPaymentSecretResult.success({ status: subscription.status });
    } catch (error) {
      this.logger.error(error.message, error);
      return SubscriptionPaymentSecretResult.failure(error.message, error);
    }
  }

  async getSubscriptionDefaultPaymentMethod(subscriptionId: string): Promise<ApiResultWithError<string, string>> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return ApiResultWithError.success(subscription.default_payment_method?.toString());
    } catch (error) {
      this.logger.error(error.message, error);
      return ApiResultWithError.failure(error.message, error);
    }
  }

  /**
   * Record Subscription Line item metered Usage
   * @param subscriptionId 
   * @param lineItemId 
   * @param quantity 
   * @param timestamp 
   * @returns 
   */
  async captureSubscriptionUsage(subscriptionId: string, lineItemId: string, quantity: number, timestamp: number): Promise<UpdateResult> {
    try {

      if (quantity === 0) return UpdateResult.success(true);
      const usageRecored = await this.stripe.subscriptionItems.createUsageRecord(
        lineItemId,
        {
          quantity: Math.round(quantity),
          timestamp
        },
      );
      return UpdateResult.success(true);
    } catch (error) {
      this.logger.error(error.message, error);
      return UpdateResult.failure(error.message, error);
    }
  }

  /**
   * Add item to Existing subscription 
   * @param subscriptionId 
   * @param priceId 
   * @returns 
   */
  async addItemToSubscription(subscriptionId: string, priceId: string): Promise<ApiResultWithError<{ id: string }, string>> {
    try {
      const newItem = await this.stripe.subscriptionItems.create({ subscription: subscriptionId, price: priceId });
      return ApiResultWithError.success({
        id: newItem.id
      });
    } catch (error) {
      this.logger.error(error.message, error);
      return ApiResultWithError.failure(error.message, error);
    }
  }

  /**
   * Removes a line item from a Subscription
   * @param subscriptionId 
   * @param itemId 
   * @returns 
   */
  async removeItemFromSubscription(subscriptionId: string, itemId: string, isMetered: boolean = false): Promise<ApiResultWithError<boolean, string>> {
    try {
      const result = await this.stripe.subscriptionItems.del(itemId, {
        clear_usage: isMetered ? true : undefined
      });
      return ApiResultWithError.success(result.deleted);
    } catch (error) {
      this.logger.error(error.message, error);
      return ApiResultWithError.failure(error.message, error);
    }
  }

  /**
   * List of all Subscription items with item id & price id
   * @param subscriptionId 
   * @returns 
   */
  async getItemsForSubscription(subscriptionId: string): Promise<ApiResultWithError<Array<{ id: string, priceId: string }>, Error>> {
    try {
      const items = await this.stripe.subscriptionItems.list({ subscription: subscriptionId, limit: 500 });
      return ApiResultWithError.success(items.data.map(x => ({
        id: x.id,
        priceId: x.price.id
      })));
    } catch (error) {
      this.logger.error(error.message, error);
      return ApiResultWithError.failure(error.message, error);
    }
  }

  async getProrateAmountForSubscription(subscriptionId: string, priceIds: { price: string }[], coupon: string = null)
    : Promise<ApiResultWithError<{ amountDue: number, discountTotal: number }, string>> {
    try {
      const invoicePreview = await this.stripe.invoices.retrieveUpcoming({ subscription: subscriptionId, subscription_items: priceIds, coupon });
      const prorateAmount = invoicePreview.lines.data.filter(x => x.proration)
        .filter(x => priceIds.find(p => p.price === x.price.id))
        .reduce((total, item) => total + item.amount / 100, 0);
      const discountTotal = invoicePreview.lines.data.filter(x => x.proration)
        .filter(x => priceIds.find(p => p.price === x.price.id))
        .reduce((total, item) => (total + item.discount_amounts.reduce((dt, d) => dt + d.amount, 0) / 100), 0);
      return ApiResultWithError.success({
        amountDue: prorateAmount,
        discountTotal
      });
    } catch (error) {
      this.logger.error(error.message, error);
      return ApiResultWithError.failure(error.message, error);
    }
  }

  async getInvoiceById(stripeInvoiceId: string): Promise<ApiResultWithError<any, Error>> {
    try {
      const sInvoice = await this.stripe.invoices.retrieve(stripeInvoiceId);
      return ApiResultWithError.success(sInvoice);
    } catch (error) {
      this.logger.error(error.message, error);
      return ApiResultWithError.failure(error.message, error);
    }
  }

  /**
   * Get Invoice Total amount
   * @param stripeInvoiceId 
   * @returns 
   */
  async getInvoiceTotal(stripeInvoiceId: string): Promise<InvoiceTotalResult> {
    try {
      const sInvoice = await this.stripe.invoices.retrieve(stripeInvoiceId);
      return InvoiceTotalResult.success({ total: sInvoice.total / 100, number: sInvoice.number });
    } catch (error) {
      this.logger.error(error.message, error);
      return InvoiceTotalResult.failure(error.message, error);
    }
  }

  /**
   * Returns a list of Stripe Price which have a metadata {@link StripeProductPriceMetadata.Network} for the given network
   * @param networkId 
   * @returns 
   */
  async listPricesByConnectNetworkId(networkId: string): Promise<StripeProductPricesResult> {
    try {
      const prices = await this.stripe.prices.search({
        query: `metadata['${StripeProductPriceMetadata.Network}']:'${networkId}'`,
        expand: ['data.tiers'],
        limit: 100,
      });

      return StripeProductPricesResult.success(prices.data.map((x: Stripe.Price) => (x as StripePrice)) as StripePrice[]);
    } catch (error) {
      return StripeProductPricesResult.failure(error.message, error);
    }
  }

  /**
   * retrieve stripe payment intent by id
   * @param paymentIntentId 
   * @returns 
   */
  async getPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return StripePaymentIntentResult.success(paymentIntent as Stripe.PaymentIntent);
    } catch (error) {
      return StripePaymentIntentResult.failure(error.message, error);
    }
  }


  /**
 * Get Event Data from Stripe Webhook Integration
 * @param body HTTP RAW POST Body from Stripe webhook
 * @param sig HTTP Header value for stripe-signature
 * @returns 
 */
  async getStripeWebhookEvent(body: any, sig: string | string[]) {
    this.logger.debug(`stripe webhook header sig ${this.env.stripe.webhookSecret.substring(0, this.env.stripe.webhookSecret.length - 4)}`);
    return this.stripe.webhooks.constructEvent(body, sig, this.env.stripe.webhookSecret);
  }

  /**
   * List all prices for a given Stripe Product
   * @param productId 
   * @returns 
   */
  async listPricesByStripeParentProductId(productId: string): Promise<StripeProductPricesResult> {
    if (!productId || productId === "") return StripeProductPricesResult.failure(`productId not provided`);
    try {
      const prices = await this.stripe.prices.list({
        product: productId,
        active: true,
        expand: ['data.tiers'],
        limit: 100,
      });

      return StripeProductPricesResult.success(prices.data.filter(x => x.active).map((x: Stripe.Price) => (x as StripePrice)) as StripePrice[]);
    } catch (error) {
      return StripeProductPricesResult.failure(error.message, error);
    }
  }


  async createProduct(model: CreateUpdateStripeProduct): Promise<StripeProductResult> {
    try {
      const product = await this.stripe.products.create({
        ...model
      });
      return StripeProductResult.success(product as StripeProduct);
    } catch (error) {
      return StripeProductResult.failure(error.message, error);
    }
  }

  async createProductPrice(model: StripePrice): Promise<StripeProductPriceResult> {
    try {
      const price = await this.stripe.prices.create({
        unit_amount: model.unit_amount,
        currency: 'usd',
        recurring: { ...model.recurring as Stripe.Price.Recurring },
        product: model.product,
        metadata: model.metadata,
        ...model
      });

      return StripeProductPriceResult.success(price as StripePrice);

    } catch (error) {
      return StripeProductPriceResult.failure(error.message, error);
    }
  }

  async findProductByName(name: string): Promise<StripeProductResult> {
    if (!name || name === "") return StripeProductResult.failure(`name not provided`);
    try {
      const prices = await this.stripe.products.search({
        query: `name:'${name}'`,
        limit: 100,
      });

      const results = prices.data.map((x: Stripe.Product) => (x as StripeProduct)) as StripeProduct[];
      return StripeProductResult.success(results?.length > 0 ? results[0] : null);

    } catch (error) {
      return StripeProductResult.failure(error.message, error);
    }
  }

  async getCustomerCreditCardsOnFile(stripeCustomerId: string): Promise<StripeCreditCardResult> {
    if (!stripeCustomerId || stripeCustomerId === "") return StripeCreditCardResult.failure(`stripeCustomerId not provided`);
    try {
      const customerCards = await this.stripe.customers.listPaymentMethods(stripeCustomerId, { type: "card" });

      const results = customerCards.data.map((x: unknown) => (x as StripeCreditCard)) as StripeCreditCard[];
      return StripeCreditCardResult.success(results);

    } catch (error) {
      this.logger.error(error.message, error);
      return StripeCreditCardResult.failure(error.message, error);
    }
  }

  async deletePaymentMethod(pmId: string): Promise<UpdateResult> {
    try {
      const result = await this.stripe.paymentMethods.detach(
        pmId
      );
      return UpdateResult.success(true);
    } catch (error) {
      this.logger.error(error.message, error);
      return UpdateResult.failure(error.message, error);
    }
  }


  async createSetupIntent(stripeCustomerId: string, paymentMethodId: string)
    : Promise<ApiResultWithError<Stripe.SetupIntent, Error>> {
    try {
      const results = await this.stripe.setupIntents.create({
        confirm: true,
        customer: stripeCustomerId,
        payment_method: paymentMethodId,
        //payment_method_types: ["card"],
        usage: "off_session"
      });

      return ApiResultWithError.success(results);
    } catch (error) {
      this.logger.error(error.message, error);
      return ApiResultWithError.failure(error.message, error);
    }
  }


  // #region unsed for current release cycle 

  async createPaymentIntent(customerId: string, amount: number): Promise<StripePaymentIntentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        customer: customerId,
        setup_future_usage: 'off_session',
        automatic_payment_methods: {
          enabled: true,
        }
      });
      return StripePaymentIntentResult.success(paymentIntent as StripePaymentIntent);
    } catch (error) {
      return StripePaymentIntentResult.failure(error.message, error);
    }
  }

  /**
   * intended to be used for admin screens when creating network prices & offerings
   */
  async listPricesByStripeProductConnectNetworkId(networkId: string): Promise<StripeProductPricesResult> {

    try {

      const productResults = await this.stripe.products.search({ query: `metadata[${StripeProductPriceMetadata.ConnectId}]:'${networkId}'`, limit: 1 });
      const product = productResults?.data?.pop();
      const prices = await this.listPricesByStripeParentProductId(product?.id);

      return StripeProductPricesResult.success(prices.data.map((x: StripePrice) => (x as StripePrice)) as StripePrice[]);
    } catch (error) {
      return StripeProductPricesResult.failure(error.message, error);
    }
  }



  async updateProduct(stripeProductId: string, model: CreateUpdateStripeProduct): Promise<StripeProductResult> {
    try {
      const product = await this.stripe.products.update(stripeProductId,
        {
          ...model
        }
      );
      return StripeProductResult.success(product as StripeProduct);
    } catch (error) {
      return StripeProductResult.failure(error.message, error);
    }
  }

  async getProductByStripeId(stripeProductId: string): Promise<StripeProductResult> {
    try {
      const product = await this.stripe.products.retrieve(stripeProductId);
      return StripeProductResult.success(product as StripeProduct);
    } catch (error) {
      return StripeProductResult.failure(error.message, error);
    }
  }

  async listProducts(): Promise<StripeProductListResult> {
    let products: StripeProduct[] = [];

    try {
      let productResults = await this.stripe.products.list({
        limit: 50,
      });
      products = products.concat(productResults.data as StripeProduct[]);

      while (productResults.has_more) {
        productResults = await this.stripe.products.list({
          starting_after: productResults.data[productResults.data.length - 1].id,
          limit: 50,
        });
        products = products.concat(productResults.data as StripeProduct[]);
      }

      return StripeProductListResult.success(products);

    } catch (error) {
      return StripeProductListResult.failure(error.message, error);
    }

  }



  async updateProductPrice(model: StripePrice): Promise<StripeProductPriceResult> {
    try {
      const price = await this.stripe.prices.update(
        model.id,
        {
          // unit_amount: model.unit_amount,
          metadata: model.metadata
        }
      );

      return StripeProductPriceResult.success(price as StripePrice);

    } catch (error) {
      return StripeProductPriceResult.failure(error.message, error);
    }
  }

  // #endregion




}