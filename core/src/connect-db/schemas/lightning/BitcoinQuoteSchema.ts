import { Schema } from "mongoose";
import { OnchainQuote } from "@blockspaces/shared/models/lightning/Invoice";
import { LightningAmountSchema } from "./LightningAmountSchema";

const BitcoinQuoteSchema = new Schema<OnchainQuote>(
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
    expiration: {
      type: Number,
      required: [true, "Expiration is required"]
    },
    status: {
      type: String,
      required: [true, "Status is Required"]
    },
    amount: {
      type: LightningAmountSchema,
      required: [true, "Amount is Required"]
    },
    uri: {
      type: String,
      required: [true, "uri is Required"]
    }
  }, { versionKey: false }
);
BitcoinQuoteSchema.index({ invoiceId: 1, expiration: -1 });
export { BitcoinQuoteSchema };