import { Schema } from "mongoose";
import { InvoiceReference } from "@blockspaces/shared/models/lightning/Invoice";
import { LightningQuotesSchema } from "./LightningQuotesSchema";
import { ErpMetadataSchema } from "../integrations/ErpObjectSchema";

const LightningInvoicesSchema = new Schema<InvoiceReference>(
  {
    invoiceId: {
      type: String,
      required: [true, "InvoiceId is required"],
      unique: true
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
    quote: {
      type: LightningQuotesSchema,
      required: false
    },
    integrations: {
      type: [Object],
      required: false
    },
    source: {
      type: String,
      required: false
    },
    erpMetadata: {
      type: [ErpMetadataSchema],
      required: false
    },
    settleTimestamp: {
      type: Number,
      required: false,
    },
    settledPayreq: {
      type: String,
      unique: true,
      sparse: true,
    }
  },
);
LightningInvoicesSchema.index({ tenantId: 1, settleTimestamp: 1 }, { sparse: true });
// LightningInvoicesSchema.index({ settledPayreq: 1 }, { sparse: true, unique: true });
export { LightningInvoicesSchema };
