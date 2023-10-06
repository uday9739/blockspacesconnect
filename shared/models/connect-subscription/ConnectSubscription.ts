import { BillingAddress } from "../cart";
import { MongoDbModel, VersionedMongoDbModel } from "../MongoDbModel";
import { NetworkOffering, NetworkPrice, NetworkPriceBillingUsageCode } from "../network-catalog";
import { UserNetwork } from "../networks";

export const MAX_SUBSCRIPTION_LINE_ITEMS = 20;
export const MAX_SUBSCRIPTION_MSG = "You have reached the maximum number of services. Please <a target='_top' href='mailto:support@blockspaces.com?subject=BlockSpaces%20support%20request'>Contact Support</a>";

export enum PaymentMethod {
  Fiat = 'Fiat', //will process payments via stripe workflow
  // LNC = 'LNC' // pending, will process payments via LNC workflow
}
export enum ConnectSubscriptionStatus {
  Inactive = `Inactive`,
  /** 
   * Subscription has been created in Connect db only
   * Not yet Synced with vendor/stripe
   */
  Requested = 'Requested',
  /**
   * Already Synced with vendor/Stripe
   * Pending Payment or The initial payment attempts failed
   */
  Incomplete = 'Incomplete',
  /**
   * First invoice is not paid within 24 hours
   * will transition into IncompleteExpired
   */
  IncompleteExpired = 'Incomplete Expired',
  /**
   * Paid in full
   */
  Active = 'Active',
  /**
   * Payment is past due
   */
  PastDue = 'PastDue',
  /**
   * Recurring Payment Renew Failed
   */
  Unpaid = 'Unpaid',
  /**
   * Scheduled to Cancel on Billing End Date
   */
  PendingCancelation = 'PendingCancelation',
  /**
   * No Longer Active Services should be canceled
   */
  Canceled = 'Canceled'
}

export enum ConnectSubscriptionRecurrence {
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly"
}

/**
 * Capture Network Recurring Subscriptions
 */
export interface ConnectSubscription extends VersionedMongoDbModel {
  cancellationDate?: number;
  createdOn?: number;
  userId: string,
  tenantId: string,
  recurrence: ConnectSubscriptionRecurrence,
  /**
   * Determines which payment collection workflow will be used
   */
  paymentMethod: PaymentMethod,
  /**
   * Current Status of Subscription
   * Meaning of status subject to value of:{@link paymentMethod}
   */
  status: ConnectSubscriptionStatus,
  /**
   * Next Bill Date, keep in sync with Stripe.
   * Source of 'truth' is Stripe
   */
  nextBillingDate?: Date,
  /**
   * Link Stripe to Connect {@link ConnectSubscription}
   */
  stripeSubscriptionId?: string,
  /**
   * information for current billing Period/Cycle 
   */
  currentPeriod?: {
    /**
     * Needed to post usage based billing
     * Must be updated. kept in sync with stripe
     * Source of 'truth' is Stripe
     */
    billingStart: number,
    /**
     * Needed to post usage based billing
     * Must be updated. kept in sync with stripe
     * Source of 'truth' is Stripe
     */
    billingEnd: number,
    /**
     * used to know when to reported metred usage. 
     */
    meteredUsageStart: number,
    /**
     * as of 10/12/22 will be (billingEnd - n day(s))
     */
    meteredUsageEnd: number

  },
  scheduledTaskId?: string;
  billingInfo: BillingAddress;
  /**
   * 
   */
  networks?: Array<string>,
  /**
   * List mapping {@link NetworkPrice} to vendor/stripe line items
   */
  items?: Array<ConnectSubscriptionItem>,

  usageAuditTrail?: Array<{
    billingCode: NetworkPriceBillingUsageCode,
    unitQuantity: number,
    connectSubscriptionItemId: string,
    meteredUsageStart: number,
    meteredUsageEnd: number,
    timestamp: number
  }>
}

/**
 * 
 */
export interface ConnectSubscriptionItem extends MongoDbModel {
  /**
   * Pointer to stripe Subscription Item
   * Use this when reporting usage for a metered line item
   */
  stripeItemId: string;
  /**
   * 
   */
  networkId: string;

  networkPrice: NetworkPrice;

  userNetwork?: UserNetwork;

  dateAdded?: number

  statusOverride?: ConnectSubscriptionItemStatus
}

export enum ConnectSubscriptionItemStatus {
  PendingCancelation = 'PendingCancelation'
}

/**
 * 
 */
export enum ConnectSubscriptionInvoiceStatus {
  /**
   * The starting status for all invoices. You can still edit the invoice at this point.
   */
  Draft = 'Draft',
  /**
   * Final UnPaid You can no longer edit the invoice,
   */
  Open = 'Open',
  /**
   * This invoice was paid.
   */
  Paid = 'Paid',
  /**
   * Soft delete 
   */
  Void = 'Void'
}

/**
 * 
 */
export interface ConnectSubscriptionInvoice extends VersionedMongoDbModel {
  tenantId: string,
  userId: string;
  number: string;
  status: ConnectSubscriptionInvoiceStatus;
  amount?: number;
  totalDiscountAmount?: number;
  stripeInvoiceId: string;
  quickBooksInvoiceId?: string;
  connectSubscription: ConnectSubscription;
  payment?: ConnectSubscriptionInvoicePayment;
  period: {
    billingStart: number,
    billingEnd: number,
    meteredUsageStart: number,
    meteredUsageEnd: number
  },
  lines?: ConnectSubscriptionInvoiceLineItem[],
  usageAuditTrail?: Array<{
    billingCode: NetworkPriceBillingUsageCode,
    unitQuantity: number,
    connectSubscriptionItemId: string,
    meteredUsageStart: number,
    meteredUsageEnd: number,
    timestamp: number
  }>
}
export interface ConnectSubscriptionInvoiceLineItem {
  /**
   * Pointer to stripe Invoice Item
   */
  stripeLineItemId: string;
  connectSubscriptionItemId: string;
  networkId: string;
  networkPrice: string;
  userNetwork: string;
  title: string;
  description: string;
  quantity: number;
  lineTotal: number;
  unitAmount: number;
  proration?: boolean;
  prorationDate?: number;
}
/**
 *
 */
export interface ConnectSubscriptionInvoicePayment {
  paymentSource: 'Stripe' | 'LNC';
  referenceId: string;
  amount: number;
  error?: {
    code: string;
    message: string;
    attemptCount: number;
    nextAttempt: number;
  }
}