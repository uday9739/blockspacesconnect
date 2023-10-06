import { Type } from '@nestjs/common';
import { NotificationInterface, NotificationChannelInterface } from '../types';
import { InAppChannel } from '../channels';
import { Notification } from '@blockspaces/shared/models/platform';

export class UserNotification implements NotificationInterface {

  /**
   * Data passed into the notification to be used when
   * constructing the different payloads
   */
  private data: Notification;

  constructor(data: Notification) {
    this.data = data;
  }

  /**
   * Get the channels the notification should broadcast on
   * @returns {Type<NotificationChannel>[]} array
   */
  public broadcastOn(): Type<NotificationChannelInterface>[] {
    return [
      InAppChannel,
    ];
  }

  toHttp() { }

  toEmail() { }

  /**
   * Get the json representation of the notification.
   * @returns {}
   */
  toPayload(): any {
    return this.data;
  }
}