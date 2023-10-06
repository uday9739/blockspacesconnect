

import { NetworkOfferingRecurrence } from "@blockspaces/shared/models/network-catalog";
import { NetworkPrice, NetworkPriceBillingUsageCode } from "@blockspaces/shared/models/network-catalog/NetworkPrice";
import { Schema } from "mongoose";


export const NetworkPriceSchema = new Schema<NetworkPrice>({
  network: {
    type: Schema.Types.String,
    ref: `Network`,
    required: true
  },
  active: Boolean,
  stripeId: {
    type: String,
    required: [true, "stripe mapping is required"]
  },
  quickBooksItemId: {
    type: String,
    required: [true, "quick books mapping is required"]
  },
  isMetered: Boolean,
  billingUsageCode: {
    type: String,
    enum: Object.values(NetworkPriceBillingUsageCode).concat(null),
    required: false
  },
  recurrence: {
    type: String,
    enum: Object.values(NetworkOfferingRecurrence),
    required: false
  },
  billingCategory: {
    type: Schema.Types.ObjectId,
    ref: `NetworkPriceBillingCategory`,
    required: [true, "Billing Category _id is required"]
  }
});


