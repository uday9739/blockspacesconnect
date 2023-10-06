import { Schema } from "mongoose";
import { ErpAccount, ErpAccountTypes } from "@blockspaces/shared/models/erp-integration/ErpAccount";

export const ErpAccountSchema = new Schema<ErpAccount>(
  {
    accountType: {
      type: String,
      lowercase: true,
      enum: ErpAccountTypes,
      required: [true, "accountType is required"]
    },
    fullyQualifiedName: {
      type: String,
      required: [true, "fullyQualifiedName is required"]
    },
    name: {
      type: String,
      required: [true, "name is required"]
    },
    active: {
      type: Boolean,
      required: [true, "active is required"]
    }
  },
  { _id: false, versionKey: false }
);
