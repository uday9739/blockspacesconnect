import { Schema } from "mongoose";
import { BalanceReference } from "@blockspaces/shared/models/lightning/Invoice";
import { LightningAmountSchema } from "./LightningAmountSchema";

const LightningBalancesSchema = new Schema<BalanceReference>(
  {
    tenantId: {
      type: String,
      required: [true, "TenantId is required"]
    },
    offchainAmount: {
      type: LightningAmountSchema,
      required: [true, "offchainAmount is Required"]
    },
    onchainAmount: {
      type: LightningAmountSchema,
      required: [true, "onchainAmount is Required"]
    },
    timestamp: {
      type: Number,
      required: [true, "timestamp is required"],
    }
  }, { versionKey: false }
);
LightningBalancesSchema.index({ tenantId: 1, timestamp: -1 }, { unique: true });
export { LightningBalancesSchema };
