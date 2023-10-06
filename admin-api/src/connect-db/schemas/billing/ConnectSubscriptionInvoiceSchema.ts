import { ConnectSubscriptionInvoice, ConnectSubscriptionInvoiceLineItem, ConnectSubscriptionInvoiceStatus } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { Schema } from "mongoose";
import { ConnectSubscriptionSchema } from "./ConnectSubscriptionSchema";



export const ConnectSubscriptionInvoiceSchema = new Schema<ConnectSubscriptionInvoice>({
  tenantId: {
    type: String,
    required: [true, "TenantId is required"]
  },
  userId: {
    type: Schema.Types.String,
    required: [true, `user id is required`]
  },
  number: {
    type: Schema.Types.String,
    required: [false, `number`]
  },
  status: {
    type: String,
    enum: Object.values(ConnectSubscriptionInvoiceStatus),
    default: ConnectSubscriptionInvoiceStatus.Draft,
    required: true
  },
  amount: {
    type: Number,
    required: false
  },
  totalDiscountAmount: {
    type: Number,
    required: false
  },
  stripeInvoiceId: {
    type: Schema.Types.String,
    unique: true,// This is needed to protect against webhooks causing duplicate invoices 
    required: [true, `stripe invoice id is required`]
  },
  quickBooksInvoiceId: {
    type: Schema.Types.String,
    required: [
      function (): boolean {
        return false;
      },
      `Quickbooks Invoice Id is required for Paid Invoices`
    ]
  },
  connectSubscription: {
    type: Schema.Types.ObjectId,
    ref: `ConnectSubscription`,
    required: [true, `connect subscription is required`]
  },
  period: {
    type: {
      billingStart: {
        type: Number,
      },
      billingEnd: {
        type: Number,
      },
      meteredUsageStart: {
        type: Number,
      },
      meteredUsageEnd: {
        type: Number,
      },
    },
    required: [true, `Period info required`]
  },
  payment: {
    type: {
      paymentSource: String,
      referenceId: String,
      amount: Number,
      error: {
        type: {
          code: String,
          message: String,
          attemptCount: Number,
          nextAttempt: Number
        },
        required: false
      }
    },
    required: [
      function (): boolean {
        return (this as ConnectSubscriptionInvoice).status === ConnectSubscriptionInvoiceStatus.Paid;
      },
      `payment is required in order to mark invoice Paid`
    ]
  },
  usageAuditTrail: {
    type: [],
    required: false
  },
  lines: {
    type: []
  }
});