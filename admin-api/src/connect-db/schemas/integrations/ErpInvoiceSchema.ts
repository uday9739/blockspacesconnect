import { Schema } from "mongoose";
import { TaxLine, ItemDetails, ErpInvoice, LineItem } from "@blockspaces/shared/models/erp-integration/ErpInvoice";
import { InvoiceStatus } from "@blockspaces/shared/models/lightning/Invoice";
import { SupportedCurrencies } from "@blockspaces/shared/models/lightning/Currencies";

const TaxLineSchema = new Schema<TaxLine>(
  {
    totalTax: { type: Number, required: [true, "totalTax is Required"] },
    netAmountTaxable: { type: Number, required: [true, "netAmountTaxable is Required"] },
    taxPercent: { type: Number, required: [true, "taxPercent is Required"] }
  },
  { _id: false }
);

const ItemDetailsSchema = new Schema<ItemDetails>(
  {
    itemName: { type: String, required: [true, "itemName is Required"] },
    description: { type: String },
    lineNum: { type: Number },
    quantity: { type: Number },
    unitPrice: { type: Number }
  },
  { _id: false }
);

const LineItemSchema = new Schema<LineItem>(
  {
    amount: { type: Number, required: [true, "amount is Required"] },
    itemDetails: { type: ItemDetailsSchema }
  },
  { _id: false }
);

export const ErpInvoiceSchema = new Schema<ErpInvoice>(
  {
    txnDate: {
      type: String,
      required: [true, "txnDate is required"]
    },
    currencyCode: {
      type: String,
      lowercase: true,
      required: [true, "currencyCode is required"],
      enum: SupportedCurrencies
    },
    status: {
      type: String,
      uppercase: true,
      enum: InvoiceStatus,
      required: [true, "status is required"]
    },
    totalAmt: {
      type: Number,
      required: [true, "btcValue is Required"]
    },
    dueDate: { type: String }, // TODO: Add validation for date
    lines: {
      type: [LineItemSchema],
      required: [true, "lines is Required"]
    },
    taxLine: {
      type: TaxLineSchema
    }
  },
  { _id: false, versionKey: false }
);
