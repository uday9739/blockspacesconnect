import { Schema } from "mongoose";
import { AmountReference } from "@blockspaces/shared/models/lightning/Invoice";
import { SupportedCurrencies } from "@blockspaces/shared/models/lightning/Currencies";

export const LightningAmountSchema = new Schema<AmountReference>(
  {
    fiatValue: {
      type: Number,
      required: [true, "fiatValue is required"]
    },
    currency: {
      type: String,
      // TODO: support more currencies
      enum: SupportedCurrencies,
      required: [true, "currency is required"]
    },
    btcValue: {
      type: Number,
      required: [true, "btcValue is Required"]
    },
    exchangeRate: {
      type: Number,
      required: [true, "exchangeRate is Required"]
    },
  }, { _id: false, versionKey: false }
);
