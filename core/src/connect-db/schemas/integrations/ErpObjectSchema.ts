import { ErpObject, Metadata, domains } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { ErpMetadata, ErpMetadataTypes } from "@blockspaces/shared/models/lightning/Integration";
import { Schema } from "mongoose";
import { ErpAccountSchema } from "./ErpAccountSchema";
import { ErpInvoiceSchema } from "./ErpInvoiceSchema";
import { ErpPaymentSchema } from "./ErpPaymentSchema";
import { ErpSalesReceiptSchema } from "./ErpSalesReceiptSchema";

type ErpSchemaMap = {
  Invoice: typeof ErpInvoiceSchema;
  SalesReceipt: typeof ErpSalesReceiptSchema;
  Account: typeof ErpAccountSchema;
  Payment: typeof ErpPaymentSchema;
};

export type ErpSchemaType = keyof ErpSchemaMap;
export type ErpSchemas = ErpSchemaMap[ErpSchemaType];
const schemaTypeNames = ["invoice", "salesreceipt", "account", "payment", "purchase"] as const;

const MetadataSchema = new Schema<Metadata>(
  {
    domain: {
      type: String,
      uppercase: true,
      enum: domains,
      required: [true, "domain is required"]
    },
    externalId: {
      type: String,
      required: [true, "externalId is required"]
    },
    tenantId: {
      type: String,
      required: [true, "tenantId is required"]
    },
    timestampSynced: { type: String }
  },
  { _id: false }
);

const ErpObjectSchema = new Schema<ErpObject>(
  {
    internalId: {
      type: String,
      required: [true, "internalId is required"],
      unique: true,
      index: true
    },
    objectType: {
      type: String,
      lowercase: true,
      enum: schemaTypeNames,
      required: [true, "type is required"],
    },
    metadata: {
      type: MetadataSchema,
      required: [true, "Metadata is required"]
    },
    invoiceData: { type: ErpInvoiceSchema },
    accountData: { type: ErpAccountSchema },
    paymentData: { type: ErpPaymentSchema },
    salesReceiptData: { type: ErpSalesReceiptSchema },
    jsonBlob: {
      type: String,
      required: [true, "jsonBlob is required"]
    }
  },
  {
    timestamps: {
      createdAt: "metadata.createdAt",
      updatedAt: "metadata.timestampSynced"
    },
    versionKey: false
  }
).index(
  {
    "metadata.tenantId": 1,
    "metadata.domain": 1,
    objectType: 1,
    "metadata.externalId": 1
  },
  { unique: true }
);

const ErpMetadataSchema = new Schema<ErpMetadata>({
  dataType: {
    type: String,
    enum: ErpMetadataTypes,
    required: [true, "dataType is required"]
  },
  domain: {
    type: String,
    uppercase: true,
    enum: domains,
    required: [true, "domain is required"]
  },
  value: {
    type: String,
    required: [true, "value is required"]
  }
}, { versionKey: false, _id: false });

export { ErpObjectSchema, ErpMetadataSchema };
