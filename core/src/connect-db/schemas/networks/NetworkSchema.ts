import { Network } from "@blockspaces/shared/models/networks";
import { Schema, SchemaTypes } from "mongoose";

/**
 * Mongoose schema for Network document/model, which contains metadata
 * for all the blockchain networks that the BlockSpaces platform provides resources for
 */
export const NetworkSchema = new Schema<Network>({
  _id: {
    type: String,
//    unique: true,
//    immutable: true
  },
  description: String,
  name: String,
  chain: {
    type: SchemaTypes.String,
    required: false
  },
  logo: String,
  primaryColor: {
    type: SchemaTypes.String,
    required: false
  },
  secondaryColor: {
    type: SchemaTypes.String,
    required: false
  },
  protocolRouterBackend: {
    type: SchemaTypes.String,
    required: false
  }
}, { _id: false });
