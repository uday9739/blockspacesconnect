import { Schema } from "mongoose";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";


/**
 * Schema for UserSecret, which contains metadata about secrets stored for users (or groups of users/tenants)
 */
export const UserSecretSchema = new Schema<ICredentialReference>(
  {
    credentialId: {
      type: String,
      required: [true, "Client Credential ID is required"]
    },
    userId: {
      type: String,
      required: [true, "User ID is required"]
    },
    tenantId: {
      type: String,
      required: [true, "Tenant Id is required"]
    },
    label: {
      type: String,
      required: [true, "Client Credential Label is Required"]
    },
    subPath: String,
    description: String
  },
  { timestamps: true }
);
