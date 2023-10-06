import { Schema } from "mongoose";
import { BitcoinTxnReference, TxnStatus } from "@blockspaces/shared/models/lightning/Invoice";
import { LightningAmountSchema } from "./LightningAmountSchema";
import { ErpMetadataSchema } from "../integrations/ErpObjectSchema";

const BitcoinTxnSchema = new Schema<BitcoinTxnReference>(
  {
    txnHash: {
      type: String,
      unique: true,
      sparse: true
    },
    tenantId: {
      type: String,
      required: [true, "tenantId is required"]
    },
    description: {
      type: String
    },
    status: {
      type: String,
      enum: Object.values(TxnStatus),
      required: [true, "status is Required"]
    },
    amount: {
      type: LightningAmountSchema,
      required: [true, "amount is Required"]
    },
    totalFees: {
      type: LightningAmountSchema,
      required: [true, "totalFees is Required"]
    },
    netBalanceChange: {
      type: LightningAmountSchema,
      required: [true, "netBalanceChange is Required"]
    },
    isSender: {
      type: Boolean,
      required: [true, "isSender is Required"]
    },
    erpMetadata: {
      type: [ErpMetadataSchema],
      required: false
    },
    submittedTimestamp: {
      type: Number,
    },
    blockTimestamp: {
      type: Number,
      required: [true, "blockTimestamp is required"],
      index: true
    }
  }, { versionKey: false }
);
BitcoinTxnSchema.index({ tenantId: 1, status: 1, blockTimestamp: -1, submittedTimestamp: -1 });
export { BitcoinTxnSchema };

