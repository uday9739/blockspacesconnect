import { NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { BillingTier, BillingTierCode } from "@blockspaces/shared/models/network-catalog/Tier";
import { Schema } from "mongoose";


export const BillingTierSchema = new Schema<BillingTier>({
  displayName: {
    type: String,
  },
  code: {
    type: String,
    enum: Object.values(BillingTierCode),
    unique: true,
    required: [true, "code is required"]
  },
});