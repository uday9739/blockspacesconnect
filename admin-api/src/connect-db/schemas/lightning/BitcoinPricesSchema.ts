import { Schema } from "mongoose";
import { PriceReference } from "@blockspaces/shared/models/lightning/Invoice";
import { SupportedCurrencies } from "@blockspaces/shared/models/lightning/Currencies";

export const BitcoinPricesSchema = new Schema<PriceReference>(
  {
    timestamp: {
      type: Number,
      unique: true,
      required: [true, "timestamp is required"],
      index: true
    },
    currency: {
      type: String,
      enum: SupportedCurrencies,
      required: [true, "currency is required"],
      lowercase: true
    },
    exchangeRate: {
      type: Number,
      min: [1000, 'exchangeRate may not drop below 1000'],
      required: [true, "exchangeRate is required"]
    }
  },
);
