import { NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { Schema } from "mongoose";


export const NetworkPriceBillingCategorySchema = new Schema<NetworkPriceBillingCategory>({
  name: {
    type: String,
  },
  code: {
    type: String,
    enum: Object.values(NetworkPriceBillingCodes),
    unique: true,
    required: [true, "code is required"]
  },
  description: {
    type: String,
  },
  sortOrder: {
    type: Number,
  },
  slug: {
    type: String,
    required: [true, "slug is required"]
  },
  active: {
    type: Boolean,
  },
});