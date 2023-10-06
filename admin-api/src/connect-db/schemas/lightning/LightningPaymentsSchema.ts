import { Schema } from "mongoose";
import { PaymentReference } from "@blockspaces/shared/models/lightning/Invoice";
import { LightningAmountSchema } from "./LightningAmountSchema";
import { ErpMetadataSchema } from "../integrations/ErpObjectSchema";

const LightningPaymentsSchema = new Schema<PaymentReference>(
  {
    tenantId: {
      type: String,
      required: [true, "TenantId is required"]
    },
    paymentHash: {
      type: String,
      unique: true,
      required: [true, "PaymentRequest is required"]
    },
    status: {
      type: String,
      // required: [true, "Status is Required"]
    },
    channelId: {
      type: String,
      // required: [true, "ChannelId is Required"]
    },
    amount: {
      type: LightningAmountSchema,
      // required: [true, "Amount is Required"]
    },
    integrations: {
      type: [Object],
    },
    erpMetadata: {
      type: [ErpMetadataSchema],
    },
    settleTimestamp: {
      type: Number,
      required: false,
      sparse: true
    },
    feesPaid: {
      type: LightningAmountSchema,
    },
    netBalanceChange: {
      type: LightningAmountSchema,
    }
  },
);
LightningPaymentsSchema.index({ tenantId: 1, settleTimestamp: -1 }, { sparse: true });
export { LightningPaymentsSchema };
