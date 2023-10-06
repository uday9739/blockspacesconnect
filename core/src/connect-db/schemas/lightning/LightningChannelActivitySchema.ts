import { Schema } from "mongoose";
import { ChannelActivityReference } from "@blockspaces/shared/models/lightning/Invoice";

const LightningChannelActivitySchema = new Schema<ChannelActivityReference>(
  {
    tenantId: {
      type: String,
      required: [true, "tenantId is required"]
    },
    action: {
      type: String,
      enum: ['OPEN', 'CLOSE'],
      required: [true, "action is Required"]
    },
    channelId: {
      type: String,
      required: [true, "channelId is Required"]
    },
    amount: {
      type: Object,
      required: [true, "amount is Required"]
    },
    timestamp: {
      type: Number,
      required: [true, "timestamp is required"],
      index: true
    }
  },
);
LightningChannelActivitySchema.index({ tenantId: 1, timestamp: -1 });
LightningChannelActivitySchema.index({ tenantId: 1, action: 1, channelId: 1 }, { unique: true });
export { LightningChannelActivitySchema };

