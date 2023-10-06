import { NotificationInterface } from './NotificationInterface';

export interface NotificationChannelInterface {
  /**
   * Send the given notification
   * @param notification
   */
  send(notification: NotificationInterface): Promise<any>;
}
