import { Schema } from "mongoose";
import { ExternalIntegration } from "@blockspaces/shared/models/external-integration";
export const ExternalIntegrationSchema = new Schema<ExternalIntegration>({
  id: {
    type: Schema.Types.String,
    required: true
  },
  name: {
    type: Schema.Types.String,
    required: true
  },
  description: {
    type: Schema.Types.String,
    required: false
  },
  templates: {
    type: [Schema.Types.String],
    required: false
  }
});