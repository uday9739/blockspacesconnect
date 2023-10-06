import { Schema, SchemaTypes } from "mongoose";
import { Connectors, NetworkConnectorIntegration } from "@blockspaces/shared/models/connectors";

export const ConnectorSchema = new Schema<Connectors>({
  cyclrId: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  base64Icon: {
    type: String,
    required: true
  },
  longDescription: {
    type: String,
    required: false
  },
  isFeatured: {
    type: Boolean,
    required: false
  }
});



export const NetworkConnectorIntegrationSchema = new Schema<NetworkConnectorIntegration>({
  active: {
    type: Boolean,
    required: true
  },
  connector: {
    type: Schema.Types.ObjectId,
    ref: 'Connector',
    required: true
  },
  network: {
    type: Schema.Types.String,
    ref: 'Network',
    required: true
  },
  titleOverride: {
    type: String,
    required: false
  },
  descriptionOverride: {
    type: String,
    required: false
  },
  longDescriptionOverride: {
    type: String,
    required: false
  },
  isFeatured: {
    type: Boolean,
    required: false
  }
});