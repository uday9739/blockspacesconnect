import { Schema } from "mongoose";
import { ErpPayment, DepositAccount } from "@blockspaces/shared/models/erp-integration/ErpPayment";
import { ErpObjectStatuses } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { SupportedCurrencies } from "@blockspaces/shared/models/lightning/Currencies";

const DepositAccountSchema = new Schema<DepositAccount>(
  {
    name: { type: String },
    value: { type: String, required: [true, "value is Required"] }
  },
  {
    _id: false,
    versionKey: false
  }
);

export const ErpPaymentSchema = new Schema<ErpPayment>(
  {
    totalAmount: {
      type: Number,
      required: [true, "btcValue is Required"]
    },
    currencyCode: {
      type: String,
      required: [true, "currencyCode is required"],
      lowercase: true,
      enum: SupportedCurrencies
    },
    status: {
      type: String,
      uppercase: true,
      enum: ErpObjectStatuses,
      required: [true, "status is required"]
    },
    depositAccount: {
      type: DepositAccountSchema
    },
    unappliedAmount: {
      type: Number
    },
    transactionDate: {
      type: String
    }
  },
  { _id: false, versionKey: false }
);
