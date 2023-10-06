import { ApiResultWithError } from "@blockspaces/shared/models/ApiResult";
import Stripe from "stripe";

export enum StripeSubscriptionMetadata {
  ConnectId = "connectId",
  Recurrence = "recurrence"
}

export enum StripeCustomerMetadata {
  ConnectId = "connectId",
  CompanyName = "CompanyName"
}

/**
 * Expected Metadata on Stripe Price object to model connect schema for linking the 2 together
 */
export enum StripeProductPriceMetadata {
  Network = "network",
  ConnectId = "connectId",
  Offer = "offer",
  BillingUsageCode = "billingUsageCode",
  QuickBooksItemId = "quickBooksItemId",
  QuickBooksItemSku = "quickBooksItemSku",
  BillingCategory = "billingCategory"
}

export interface CreateStripeCustomer {
  /**
   * The customer’s full name or business name.
   */
  email: string;
  /**
   * 
   */
  address?: Address;
  name: string;
  description?: string;
  companyName?: string;
  /**
   * key-value pairs, add link back to connect user Id
   */
  metadata?: { [key: string]: string }
}
export interface StripeCustomer {
  id: string
  object: string
  address: Address
  balance: number
  created: number
  currency: string
  /**
   * default payment method
   */
  default_source: string
  delinquent: boolean
  description: string
  email: string
  invoice_prefix: string
  livemode: boolean
  metadata: any
  name: string
  next_invoice_sequence: number
  phone: any
  preferred_locales: any[]
  shipping: any
  tax_exempt: string
  test_clock: any
}

interface Address {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  /**
      * Two-letter country code ([ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)).
      */
  country?: string;
}

export interface CreateUpdateStripeProduct {
  name: string;
  active: boolean;
  description: any;
  metadata?: { [key: string]: string }
}

export interface StripeProduct {
  id: string
  active: boolean
  default_price: string
  description: any
  images: any[]
  metadata: { [key: string]: string }
  name: string
  url: any
}

export type StripePriceType =
  'one_time' |
  'recurring '

export interface StripePrice {
  id?: string
  nickname: string;
  active: boolean
  currency: string
  metadata?: { [key: string]: string }
  product: string
  recurring: Stripe.Price.Recurring
  type?: StripePriceType
  unit_amount?: number
  unit_amount_decimal?: string
  tiers?: StripePriceTier[]
}

export interface StripePriceTier {
  /**
   * Price for the entire tier.
   */
  flat_amount: number | null;

  /**
   * Same as `flat_amount`, but contains a decimal value with at most 12 decimal places.
   */
  flat_amount_decimal: string | null;

  /**
   * Per unit price for units relevant to the tier.
   */
  unit_amount: number | null;

  /**
   * Same as `unit_amount`, but contains a decimal value with at most 12 decimal places.
   */
  unit_amount_decimal: string | null;

  /**
   * Up to and including to this quantity will be contained in the tier.
   */
  up_to: number | null;
}

export type RecurringInterval =
  'month' |
  'year' |
  'week' |
  'day'

export type RecurringUsageType = 'metered' | 'licensed'


export interface Recurring {
  aggregate_usage?: Stripe.Price.Recurring.AggregateUsage
  interval?: RecurringInterval | Stripe.Price.Recurring.Interval
  interval_count?: number
  trial_period_days?: number
  usage_type?: RecurringUsageType | Stripe.Price.Recurring.UsageType
}


export interface StripePaymentIntent {
  id: string;
  amount: number;
  client_secret: string;
  payment_method: string | Stripe.PaymentIntent
  last_payment_error: Stripe.PaymentIntent.LastPaymentError | null;
}

export class StripePaymentIntentResult extends ApiResultWithError<StripePaymentIntent | Stripe.PaymentIntent, string>{ }

export class StripeProductPricesResult extends ApiResultWithError<Array<StripePrice>, string>{ }

export class StripeProductPriceResult extends ApiResultWithError<StripePrice, string>{ }

export class StripeProductListResult extends ApiResultWithError<Array<StripeProduct>, string>{ }

export class StripeProductResult extends ApiResultWithError<StripeProduct, string>{ }

export class StripeCustomerResult extends ApiResultWithError<StripeCustomer, string> { }

export class CreateSubscriptionResult extends ApiResultWithError<{
  subscriptionId: string;
  stripeInvoiceId: string;
  stripePaymentIntentId: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  amountDue: number;
  clientSecret: string;
  items: { id: string, priceId: string }[],
  discountTotal: number
}, string> { }


export class SubscriptionPaymentSecretResult extends ApiResultWithError<{
  amountDue: number;
  clientSecret: string;
  discountTotal?: number;
}, string> { }

export class CancelSubscriptionResult extends ApiResultWithError<boolean, string> { }
export class UpdateResult extends ApiResultWithError<boolean, Error> { }
export class SubscriptionStatusResult extends ApiResultWithError<{ status: string }, string> { }
export class InvoiceTotalResult extends ApiResultWithError<{ total: number, number: string }, string> { }
export class StripeCreditCardResult extends ApiResultWithError<StripeCreditCard[], string> { }
export class ApplyCouponResult extends ApiResultWithError<{ amountDue: number, discountTotal?: number }, string> { }

export interface StripeCreditCard {
  id: string;
  billingDetails: {
    address: Address
  },
  card: {
    brand: string;
    country: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    last4: string;
  },
  created: number;
  customer: string;
  metadata: { [key: string]: string }
  type: string;
}