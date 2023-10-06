import { Schema } from "mongoose";
import { Tenant, TenantStatus, TenantType } from "@blockspaces/shared/models/tenants";

/** Schema for Tenants collection */
export const TenantSchema = new Schema<Tenant>(
  {
    tenantId: {
      type: String,
      unique: true,
      required: [true, "Tenant ID is required"]
    },
    name: {
      type: String,
      required: [true, "name is required"]
    },
    ownerId: {
      type: String,
      required: [true, "ownerId is required"]
    },
    status: {
      type: String,
      required: false,
      enum: Object.values(TenantStatus),
      default: TenantStatus.ACTIVE
    },
    description: {
      type: String,
      required: false,
      default: ""
    },
    tenantType: {
      type: String,
      required: false,
      enum: Object.values(TenantType),
      default: TenantType.ORGANIZATION
    },
    users: Array,
    vault: {
      type: Object,
      required: false,
      default: {}
    },
    whmcsClientId: Number
  },
  { timestamps: true }
);
