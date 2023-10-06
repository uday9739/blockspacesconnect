import { Notification } from '@blockspaces/shared/models/platform';
import { Injectable } from '@nestjs/common';
import { NotificationChannelInterface, NotificationInterface } from '../types';
import { ConnectDbDataContext } from '../../connect-db/services/ConnectDbDataContext';

@Injectable()
export class InAppChannel implements NotificationChannelInterface {
  constructor(
    private readonly db: ConnectDbDataContext
  ) { }

  /**
   * 
   * Send - Adds the {@link Notification} to the InApp Notifications Collection 
   * 
   * @param notification {@link NotificationInterface}
   * 
   * @returns Promise void
   * 
   */
  public async send(notification: NotificationInterface): Promise<void> {
    const data = this.getData(notification) as Notification;
    await this.db.notifications.create(data);
  }

  /**
   * GetData - Get the data for the notification.
   * 
   * @param notification {@link NotificationInterface} - the Notification
   * 
   */
  getData(notification: NotificationInterface) {
    return notification.toPayload();
  }
}