import { Schema } from "mongoose";
import { QuoteReference } from "@blockspaces/shared/models/lightning/Invoice";
import { LightningAmountSchema } from "./LightningAmountSchema";

const LightningQuotesSchema = new Schema<QuoteReference>(
  {
    quoteId: {
      type: String,
      required: [true, "QuoteId is required"],
      unique: true,
      sparse: true,
    },
    invoiceId: {
      type: String,
      required: [true, "InvoiceId is required"],
    },
    tenantId: {
      type: String,
      index: true,
      required: [true, "TenantId is required"]
    },
    paymentRequest: {
      type: String,
      required: [true, "PaymentRequest is required"],
      unique: true,
      sparse: true,
    },
    expiration: {
      type: Number,
      required: [true, "Expiration is required"]
    },
    status: {
      type: String,
      required: [true, "Status is Required"]
    },
    channelId: {
      type: String,
      required: false
    },
    amount: {
      type: LightningAmountSchema,
      required: [true, "Amount is Required"]
    },
  },
);
LightningQuotesSchema.index({invoiceId: 1, expiration: -1});
export { LightningQuotesSchema };