

import { NetworkOffering, NetworkOfferingRecurrence, NetworkOfferingItem } from "@blockspaces/shared/models/network-catalog";
import { Schema } from "mongoose";


export const NetworkOfferingSchema = new Schema<NetworkOffering>({
  network: {
    type: Schema.Types.String,
    ref: `Network`,
    required: true
  },
  active: Boolean,
  recommended: {
    type: Boolean,
    required: false
  },
  title: {
    type: String,
    required: [true, "Title is required"]
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  recurrence: {
    type: String,
    enum: Object.values(NetworkOfferingRecurrence),
    required: [true, "recurrence is required"]
  },
  items: {
    type: [new Schema<NetworkOfferingItem>({
      price: {
        type: Schema.Types.ObjectId,
        ref: 'NetworkPrice',
        required: [true, `price is required`]
      }
    })],
    required: [true, `items are required`]
  },
  billingCategory: {
    type: Schema.Types.ObjectId,
    ref: `NetworkPriceBillingCategory`,
    required: [true, "Billing Category _id is required"]
  },
  billingTier: {
    type: Schema.Types.ObjectId,
    ref: `BillingTier`,
    required: [true, "tier is required"]
  }
});


