import { Schema } from "mongoose";
import { Notification } from '@blockspaces/shared/models/platform/';

export const NotificationSchema = new Schema<Notification>({
  user_id: {
    type: String,
    required: false
  },
  tenant_id: {
    type: String,
    required: false
  },
  expiration_date: {
    type: String,
    required: false,
    default: (Date.now() - 30).toString(),
  },
  read: {
    type: Boolean,
    required: false,
    default: false
  },
  read_date: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: [true, 'Notification title is required']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  action_url: {
    type: String,
    required: false
  }

})