import { Schema } from "mongoose";
import { WebhookEventRecord, WebhookResponseTypes } from "@blockspaces/shared/models/webhooks/WebhookTypes";

export const WebhookEventSchema = new Schema<WebhookEventRecord>({
  event: {
    type: Schema.Types.Mixed,
    required: [true, 'Event is required'],
  },
  responseStatus: {
    type: String,
    lowercase: true,
    enum: WebhookResponseTypes,
    required: [true, 'responseStatus is required']
  },
  response: {
    type: Schema.Types.Mixed
  },
  reason: {
    type: Schema.Types.Mixed
  },
});
