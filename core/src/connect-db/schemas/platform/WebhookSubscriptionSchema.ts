import { Schema } from "mongoose";
import { WebhookEventTypes } from "../../../../../shared/models/webhooks/WebhookTypes";

const WebhookEndpointSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: [true, 'tenantId is required']
    },
    url: {
      type: String,
      required: [true, 'Webhook url is required']
    }
  },
  {
    versionKey: false,
    _id: false
  }
);

export const WebhookSubscriptionSchema = new Schema({
  webhookEndpoint: {
    type: WebhookEndpointSchema,
    required: [true, 'Webhook Endpoint is Required']
  },
  eventType: {
    type: [String],
    validate: {
      validator: (v: WebhookEventTypes[]) => {
        let valid: boolean = true;
        for (let i = 0; i < v.length; i++) {
          if (valid) {
            valid = Object.values(WebhookEventTypes).includes(v[i]);
          }
        }
        return valid;
      }
    },
    required: [true, 'Event Type is required'],
  }
}, { versionKey: false });
