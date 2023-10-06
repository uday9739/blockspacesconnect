

import { NetworkPrice } from "@blockspaces/shared/models/network-catalog/NetworkPrice";
import { ConnectSubscription, ConnectSubscriptionItem, ConnectSubscriptionItemStatus, ConnectSubscriptionRecurrence, ConnectSubscriptionStatus, PaymentMethod } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { Schema } from "mongoose";
import { BillingAddressSchema } from "./CartSchema";



export const ConnectSubscriptionSchema = new Schema<ConnectSubscription>({
  tenantId: {
    type: String,
    required: [true, "TenantId is required"]
  },
  userId: {
    type: Schema.Types.String,
    required: true
  },
  createdOn: {
    type: Number,
    required: false
  },
  cancellationDate: {
    type: Number,
    required: false
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(ConnectSubscriptionStatus),
    required: true
  },
  recurrence: {
    type: String,
    enum: Object.values(ConnectSubscriptionRecurrence),
    default: ConnectSubscriptionRecurrence.Monthly,
    required: true
  },
  networks: {
    type: [Schema.Types.String],
    required: [
      function (): boolean {
        return (this as ConnectSubscription)?.status === ConnectSubscriptionStatus.Active;
      },
      `Network is required`
    ]
  },
  stripeSubscriptionId: {
    type: String,
    required: [
      function (): boolean {
        return (this as ConnectSubscription)?.status !== ConnectSubscriptionStatus.Requested;
      },
      `Stripe Subscription Id is required`
    ]
  },
  currentPeriod: {
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
      }
    },
    required: [
      function (): boolean {
        return (this as ConnectSubscription)?.status !== ConnectSubscriptionStatus.Requested;
      },
      `Current Period info required`
    ]
  },
  scheduledTaskId: {
    type: String,
    required: [
      function (): boolean {
        return (this as ConnectSubscription)?.status === ConnectSubscriptionStatus.Active;
      },
      `scheduledTaskId required fro active task`
    ]
  }
  ,
  items: {
    type: [new Schema<ConnectSubscriptionItem>({
      stripeItemId: {
        type: String,
        required: [true, 'stripeItemId is required']
      },
      networkPrice: {
        type: Schema.Types.ObjectId,
        ref: 'NetworkPrice',
        required: [true, 'networkPrice is required']
      },
      networkId: {
        type: String,
        required: [true, "networkId is required"],
      },
      userNetwork: {
        type: Schema.Types.ObjectId,
        ref: 'UserNetwork',
        required: false
      },
      dateAdded: {
        type: Number,
        required: false
      },
      statusOverride: {
        type: String,
        enum: Object.values(ConnectSubscriptionItemStatus).concat(null),
        required: false
      }
    })],
    required: [
      function (): boolean {
        return (this as ConnectSubscription)?.status !== ConnectSubscriptionStatus.Requested;
      },
      `items required`
    ]
  },
  billingInfo: {
    type: BillingAddressSchema,
    required: [true, ``]
  },
  usageAuditTrail: {
    type: [],
    required: false
  }
});


