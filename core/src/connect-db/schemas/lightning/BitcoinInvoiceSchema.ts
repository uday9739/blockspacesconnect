import { Schema } from "mongoose";
import { OnchainInvoice } from "@blockspaces/shared/models/lightning/Invoice";
import { BitcoinTxnSchema } from "./BitcoinTransactionSchema";
import { ErpMetadataSchema } from "../integrations/ErpObjectSchema";
import { v4 as uuidv4 } from "uuid";

const BitcoinInvoiceSchema = new Schema<OnchainInvoice>(
  {
    invoiceId: {
      type: String,
      required: [true, "InvoiceId is required"],
      unique: true,
      default: uuidv4
    },
    tenantId: {
      type: String,
      required: [true, "TenantId is required"]
    },
    description: {
      type: String,
      required: [true, "Description is required"]
    },
    status: {
      type: String,
      required: [true, "Status is Required"]
    },
    amount: {
      type: Object,
      required: [true, "Amount is Required"]
    },
    source: {
      type: String,
    },
    erpMetadata: {
      type: [ErpMetadataSchema],
    },
    settleTimestamp: {
      type: Number,
    },
    onchainAddress: {
      type: String,
      required: [true, "onchainAddress is Required"]
    },
    paidTransaction: {
      type: BitcoinTxnSchema
    },
  },
);
BitcoinInvoiceSchema.index({ tenantId: 1, settleTimestamp: 1 }, { sparse: true });
export { BitcoinInvoiceSchema };
