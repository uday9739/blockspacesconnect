import { Type } from '@nestjs/common';
import { JobOptions } from 'bull';
import { NotificationChannelInterface } from './NotificationChannelInterface';

export interface NotificationInterface {
  /**
   * Get the channels the notification should broadcast on.
   * @returns {Type<NotificationChannelInterface>[]} array
   */
  broadcastOn(): Type<NotificationChannelInterface>[];

  /**
   * Get the json representation of the notification.
   * @returns json
   */
  toPayload?(): Record<string, any>;
}

export interface QueuedNotification {
  /**
   * Return any job options for this Notification
   * @returns {JobOptions | null}
   */
  getJobOptions(): JobOptions | null;
}
