import { Schema } from "mongoose";
import { Endpoint } from "@blockspaces/shared/models/endpoints/Endpoint"
export const EndpointSchema = new Schema<Endpoint>({
  endpointId: {
    type: Schema.Types.String,
    required: true
  },
  tenantId: {
    type: Schema.Types.String,
    required: true
  },
  networkId: {
    type: Schema.Types.String,
    required: true
  },
  active: {
    type: Schema.Types.Boolean,
    required: true
  },
  alias: {
    type: Schema.Types.String,
    required: false
  },
  token: {
    type: Schema.Types.String,
    required: false
  },
  description: {
    type: Schema.Types.String,
    required: false
  }
});