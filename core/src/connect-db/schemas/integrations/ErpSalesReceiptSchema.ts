import { Schema } from "mongoose";
import { TaxLine, ItemDetails, ErpSalesReceipt, LineItem } from "@blockspaces/shared/models/erp-integration/ErpSalesReceipt";
import { ErpObjectStatuses } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { SupportedCurrencies } from "@blockspaces/shared/models/lightning/Currencies";

const TaxLineSchema = new Schema<TaxLine>(
  {
    totalTax: { type: Number, required: [true, "totalTax is Required"] },
    netAmountTaxable: { type: Number, required: [true, "netAmountTaxable is Required"] },
    taxPercent: { type: Number, required: [true, "taxPercent is Required"] }
  },
  {
    _id: false,
    versionKey: false
  }
);

const ItemDetailsSchema = new Schema<ItemDetails>(
  {
    itemName: { type: String, required: [true, "itemName is Required"] },
    description: { type: String },
    lineNum: { type: Number },
    quantity: { type: Number },
    unitPrice: { type: Number }
  },
  {
    _id: false,
    versionKey: false
  }
);

const LineItemSchema = new Schema<LineItem>(
  {
    amount: { type: Number, required: [true, "amount is Required"] },
    itemDetails: { type: ItemDetailsSchema }
  },
  {
    _id: false, 
    versionKey: false
  }
);

export const ErpSalesReceiptSchema = new Schema<ErpSalesReceipt>(
  {
    totalAmount: {
      type: Number,
      required: [true, "btcValue is Required"]
    },
    currencyCode: {
      type: String,
      lowercase: true,
      required: [true, "currencyCode is required"],
      enum: SupportedCurrencies
    },
    lines: {
      type: [LineItemSchema]
    },
    description: {
      type: String
    },
    status: {
      type: String,
      uppercase: true,
      enum: ErpObjectStatuses,
      required: [true, "status is required"]
    },
    taxLine: {
      type: TaxLineSchema
    }
  },
  { _id: false, versionKey: false }
);
