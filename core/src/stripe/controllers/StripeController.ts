import { Controller, Post, HttpException, HttpStatus, Req, RawBodyRequest, NotFoundException } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Request } from "express";
import { StripeService } from "../services/StripeService";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import Stripe from "stripe";
import { AllowAnonymous } from "../../auth";
import { CartService } from "../../cart/services/CartService";
import { ConnectSubscriptionService } from "../../connect-subscription/services/ConnectSubscriptionService";
import { CartError, CartStatus } from "@blockspaces/shared/models/cart";
import { ConnectSubscriptionStatus } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { IUser } from "@blockspaces/shared/models/users";
import { UserNotificationsService } from "../../notifications/services";
import { UserDataService } from "../../users/services/UserDataService"
import { ConnectLogger } from "../../logging/ConnectLogger";
@Controller('stripe')
export class StripeController {

  constructor(
    private readonly stripeService: StripeService,
    private readonly cartService: CartService,
    private readonly connectSubscriptionService: ConnectSubscriptionService,
    private readonly userNotificationsService: UserNotificationsService,
    private readonly userDataService: UserDataService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger) {
    logger.setModule(StripeController.name);
  }

  @AllowAnonymous()
  @Post("/integration")
  async webhook(@Req() request: RawBodyRequest<Request>) {
    const sig = request.headers['stripe-signature'];
    let event: Stripe.Event;

    this.logger.trace(`received stripe webhook`);
    this.logger.debug(`stripe webhook header sig ${sig}`);
    if (!sig) {
      this.logger.debug(`stripe webhook header  ${JSON.stringify(request.headers)}`);
    }

    try {
      event = await this.stripeService.getStripeWebhookEvent(request.body, sig);
    } catch (err) {
      this.logger.fatal(`Stripe Webhook Error: ${err.message}`, err);
      throw new HttpException(`Webhook Error: ${err.message}`, HttpStatus.BAD_REQUEST, { cause: err });
    }

    this.logger.trace(`stripe webhook id: ${event.id}, type: ${event.type}`);

    try {
      await this.processEvent(event);
    } catch (e) {
      if (e instanceof NotFoundException) {
        this.logger.warn(`Error processing Stripe Webhook event ${event.type} id: ${event.id}; Error: ${e.message}`, e);
      } else {
        this.logger.fatal(`Error processing Stripe Webhook event ${event.type} id: ${event.id}; Error: ${e.message}`, e);
      }

    }


  }

  private async processEvent(event: Stripe.Event): Promise<void> {
    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    switch (event.type) {
      /**
       * https://stripe.com/docs/api/events/types#event_types-customer.source.expiring
       */
      case 'customer.source.expiring': {
        const source = event.data.object as Stripe.Card;
        const stripeCustomerId = source?.customer?.toString();
        // get user by stripe customer id
        const user: IUser = await this.userDataService.findByStripeCustomerId(stripeCustomerId);
        if (!user) throw new NotFoundException(`user with stripe customer id of ${stripeCustomerId} not found}`);
        await this.userNotificationsService.sendUserNotification({
          user_id: user?.id,
          tenant_id: user.activeTenant?.tenantId,
          title: "Your credit card is expiring soon",
          message: "The credit card for your BlockSpaces subscriptions is expiring soon. Please contact BlockSpaces Support at support@blockspaces.com to ensure continuation of service.",
          action_url: "mailto:support@blockspaces.com"
        });

        break;
      }
      /**
       * https://stripe.com/docs/api/events/types#event_types-customer.subscription.deleted
       * Occurs whenever a customer’s subscription ends.
       */
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeInvoiceId = subscription.latest_invoice.toString();
        await this.connectSubscriptionService.cancelSubscriptionAndEnsureInvoiceIsCreated(subscription.id, stripeInvoiceId);
        break;
      }
      /**
       * https://stripe.com/docs/api/events/types#event_types-customer.subscription.updated
       * Occurs whenever a subscription changes (e.g., switching from one plan to another, or changing the status from trial to active).
       */
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        /**
         *  check subscription previous_attributes 
         */

        if ((event.data.previous_attributes as any)?.latest_invoice ||
          (event.data.previous_attributes as any)?.current_period_start ||
          (event.data.previous_attributes as any)?.current_period_end) {
          /**
           * this is a result of subscription_cycle
           */

          const newPeriodStart = subscription.current_period_start;
          const newPeriodEnd = subscription.current_period_end;
          const newInvoiceId = subscription.latest_invoice.toString();

          await this.connectSubscriptionService.updateSubscriptionPeriodAndEnsureNewInvoiceIsCreated(subscriptionId, newPeriodStart, newPeriodEnd, newInvoiceId);

        }

        if ((event.data.previous_attributes as any)?.status) {
          /**
           * Capture Status Change 
           */
          const connectNetworkStatusResult = await this.connectSubscriptionService.updateSubscriptionStatus(subscriptionId, subscription.status);
          if (connectNetworkStatusResult === ConnectSubscriptionStatus.IncompleteExpired) {
            await this.cartService.expireCartSessionAndRemoveConnectSubscriptionForStripeSubscription(subscriptionId);
          }
        }

        if ((event.data.previous_attributes as any)?.cancel_at === null && subscription.cancel_at !== null) {
          /**
           * This happens when canceling a subscription, for a future date
           */
          const stripeInvoiceId = subscription.latest_invoice.toString();
          await this.connectSubscriptionService.cancelSubscriptionAndEnsureInvoiceIsCreated(subscription.id, stripeInvoiceId, subscription.cancel_at * 1000);
        }


        if ((event.data.previous_attributes as any)?.items?.data) {
          /**
            * This happens when a line item from a subscription is removed or added
            */
          // get missing items only
          const missingItems: Stripe.SubscriptionItem[] = (event.data.previous_attributes as any).items?.data.filter((x) => !subscription.items.data.find(y => y.id === x.id));
          const stripeSubscriptionLineItemIds = missingItems.map(x => x.id);
          // Process Select Service Termination
          if (stripeSubscriptionLineItemIds.length > 0) await this.connectSubscriptionService.processStripeSubscriptionLineItemRemoval(subscription.id, stripeSubscriptionLineItemIds);
        }

        break;
      }
      case 'invoice.created': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription && typeof invoice.subscription === 'object' ? invoice.subscription.id.toString() : invoice.subscription?.toString();
        if (!subscriptionId) {
          this.logger.trace(`received ${event.type} for invoiceId:${invoice.id}, customerId: ${invoice.customer.toString()} with no subscriptionId, currently not supported`);
          break;
        }
        await this.connectSubscriptionService.ensureSubscriptionInvoiceIsCreatedForStripeInvoiceId(subscriptionId, invoice.id);
        break;
      }
      case 'invoice.finalized': {
        const invoice = event.data.object as Stripe.Invoice;
        try {
          await this.connectSubscriptionService.ensureSubscriptionInvoiceIsMarkedAsOpenByStripeInvoiceId(invoice.id);
        } catch (error) {
          if (error instanceof NotFoundException) {
            break;
          }
          throw error;
        }
        break;
      }
      case 'invoice.voided': {
        const invoice = event.data.object as Stripe.Invoice;
        try {
          await this.connectSubscriptionService.ensureSubscriptionInvoiceIsMarkedAsVoidByStripeInvoiceId(invoice.id);
        } catch (error) {
          if (error instanceof NotFoundException) {
            break;
          }
          throw error;
        }
        break;
      }
      /**
       * https://stripe.com/docs/api/events/types#event_types-invoice.updated
       */
      case 'invoice.updated': {
        const invoice = event.data.object as Stripe.Invoice;
        // Then define and call a function to handle the event invoice.updated
        // TODO, do we need this?
        break;
      }
      /**
       * https://stripe.com/docs/api/events/types#event_types-invoice.payment_action_required
       * Occurs whenever an invoice payment attempt requires further user action to complete.
       */
      case 'invoice.payment_action_required': {
        const invoice = event.data.object;
        // TODO, do we need this?
        break;
      }
      /**
       * https://stripe.com/docs/api/events/types#event_types-invoice.payment_failed
       * Occurs whenever an invoice payment attempt fails, due either to a declined payment or to the lack of a stored payment method.
       */
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        const subscriptionId = typeof invoice.subscription === 'object' ? invoice.subscription.id.toString() : invoice.subscription?.toString();
        if (!subscriptionId) {
          this.logger.warn(`received ${event.type} for invoiceId:${invoice.id}, customerId: ${invoice.customer.toString()} with no subscriptionId, currently not supported`);
          break;
        }

        this.logger.trace(`handling ${event.type} for invoiceId:${invoice.id}, billing_reason :${invoice.billing_reason}}, customerId: ${invoice.customer.toString()}`);

        const paymentIntentId = invoice.payment_intent ? typeof invoice.payment_intent === 'object' ? invoice.payment_intent.id.toString() : invoice.payment_intent.toString() : null;
        const paymentIntent = await this.stripeService.getPaymentIntent(paymentIntentId);
        if (paymentIntent.isFailure) {
          let lofLevel = "error";
          if (!paymentIntentId) {
            lofLevel = "warn";
          }
          this.logger[lofLevel](`error getting stripe payment_intent paymentIntentId:${paymentIntentId},for invoiceId:${invoice.id}`, { stripeEvent: { id: event.id, type: event.type } }, { error: paymentIntent.error }, { module: 'StripeController' });
        }

        const paymentError = paymentIntent?.data.last_payment_error;

        switch (invoice.billing_reason) {
          /**
           * This is a newly created subscription
          */
          case 'subscription_create': {
            // update cart with error 
            await this.cartService.markCartWithPaymentErrorForStripeSubscription(subscriptionId, {
              code: paymentError?.code,
              message: paymentError?.message || "Payment gateway error"
            } as CartError);


          }
            break;
          /**
           * part of subscription renewal cycle
          */
          case 'subscription_cycle': {
            const paymentErrorInfo = {
              attemptCount: invoice.attempt_count,
              nextAttempt: invoice.next_payment_attempt,
              code: paymentError?.code,
              message: paymentError?.message || "Payment gateway error",
              referenceId: paymentIntentId,
              amountDue: (paymentIntent?.data?.amount | 0) / 100
            };
            // process in parallel
            const [recordConnectSubscriptionInvoicePaymentErrorResult, ensureConnectSubscriptionIsMarkedUnPaidResult] = await Promise.allSettled([
              // capture payment error
              this.connectSubscriptionService.captureSubscriptionInvoicePaymentErrorByStripeInvoiceId(invoice.id, paymentErrorInfo),
              // make sure subscription  status is marked unpaid
              this.connectSubscriptionService.ensureSubscriptionIsMarkedUnPaidByStripeInvoiceId(subscriptionId)
            ]);

            if (recordConnectSubscriptionInvoicePaymentErrorResult.status === "rejected")
              this.logger.error(`error calling connectSubscriptionService.captureSubscriptionInvoicePaymentErrorByStripeInvoiceId`, recordConnectSubscriptionInvoicePaymentErrorResult.reason);
            if (ensureConnectSubscriptionIsMarkedUnPaidResult.status === "rejected")
              this.logger.error(`error calling connectSubscriptionService.ensureSubscriptionIsMarkedUnPaidByStripeInvoiceId`, ensureConnectSubscriptionIsMarkedUnPaidResult.reason);

          }
            break;
          case 'subscription_update': {
            // TODO ?? Not sure what this means yet
          }
            break;
          default:
            break;
        }

        break;
      }
      /**
       * https://stripe.com/docs/api/events/types#event_types-invoice.payment_succeeded
       * Occurs whenever an invoice payment attempt succeeds.
       */
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        const subscriptionId = typeof invoice.subscription === 'object' ? invoice.subscription.id.toString() : invoice.subscription?.toString();
        if (!subscriptionId) {
          this.logger.warn(`received ${event.type} for invoiceId:${invoice.id}, customerId: ${invoice.customer.toString()} with no subscriptionId, currently not supported`);
          break;
        }

        this.logger.trace(`handling ${event.type} for invoiceId:${invoice.id}, billing_reason :${invoice.billing_reason}}, customerId: ${invoice.customer.toString()}`);

        // Retrieve the payment intent used to pay the subscription
        const paymentIntentId = invoice.payment_intent ? typeof invoice.payment_intent === 'object' ? invoice.payment_intent.id.toString() : invoice.payment_intent.toString() : null;
        this.logger.trace(`Retrieving payment intent paymentIntentId:${paymentIntentId}`);
        const paymentIntent = await this.stripeService.getPaymentIntent(paymentIntentId);
        if (paymentIntent.isFailure) {
          let lofLevel = "error";
          if (!paymentIntentId) {
            lofLevel = "warn";
          }
          this.logger[lofLevel](`error getting stripe payment_intent paymentIntentId:${paymentIntentId},for invoiceId:${invoice.id}`, { stripeEvent: { id: event.id, type: event.type } }, { error: paymentIntent.error }, { module: 'StripeController' });
        }

        switch (invoice.billing_reason) {
          case 'subscription_create': {
            /**
             * This is a newly created subscription
             */

            // Set the payment method used to pay the first invoice
            // as the default payment method for that subscription
            const paymentMethodId = paymentIntent?.data?.payment_method?.toString();
            this.logger.trace(`Setting default payment method paymentMethodId:${paymentMethodId} for subscriptionId:${subscriptionId}`);
            const updateSubResult = await this.stripeService.setSubscriptionDefaultPaymentMethod(subscriptionId, paymentMethodId);
            if (updateSubResult.isFailure) {
              let lofLevel = "error";
              if (!paymentIntentId) {
                lofLevel = "warn";
              }
              this.logger[lofLevel](`stripe integration unable to set subscriptionId:${subscriptionId}, default payment method id:${paymentMethodId}`);
            }

            // mark cart object as complete
            const userCartSession = await this.cartService.markCartCheckoutCompleteForStripeSubscription(subscriptionId);
            // process in parallel
            // activate subscription after successful payment
            const [markNetworkActiveResult, captureInvoicePaymentResult] = await Promise.allSettled([
              this.connectSubscriptionService.markSubscriptionActiveByStripeSubscriptionIdAndInitiateUserNetworkProvisioning(subscriptionId, userCartSession),
              this.connectSubscriptionService.captureSubscriptionInvoicePaymentByStripeInvoiceId(subscriptionId, invoice.id, paymentIntentId, (paymentIntent?.data?.amount | 0) / 100)
            ]);
            if (markNetworkActiveResult?.status === "rejected")
              this.logger.error(`error calling connectSubscriptionService.markSubscriptionActiveByStripeSubscriptionIdAndInitiateUserNetworkProvisioning`, markNetworkActiveResult.reason);
            if (captureInvoicePaymentResult?.status === "rejected")
              this.logger.error(`error calling connectSubscriptionService.captureSubscriptionInvoicePaymentByStripeInvoiceId`, captureInvoicePaymentResult.reason);
          }
            break;
          case 'subscription_cycle': {
            /**
             * subscription cycle, recurring charge was successful 
             */
            await this.connectSubscriptionService.ensureSubscriptionStatusAndCaptureSubscriptionInvoicePayment(subscriptionId, invoice.id, paymentIntentId, (paymentIntent?.data?.amount | 0) / 100);

          }
            break;
          case 'subscription_update': {
            // TODO ?? Not sure what this means yet
          }
            break;
          default:
            break;
        }



        break;
      }
      /** 
         * https://stripe.com/docs/api/events/types#event_types-invoice.upcoming
         * Occurs X number of days before a subscription is scheduled to create an invoice that is automatically charged—where X is determined by your subscriptions settings. 
         * Note: The received Invoice object will not have an invoice ID.
         */
      case 'invoice.upcoming': {
        const invoice = event.data.object as Stripe.Invoice;
        // TODO, do we need this?
        break;
      }
      default: {
        this.logger.info(`Unhandled event type ${event.type}`);
      }
    }
  }
}