import { Notification } from "@blockspaces/shared/models/platform";
import { Injectable } from "@nestjs/common";
import { NotificationsService } from "./NotificationsService";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { UserNotification } from "../types";

@Injectable()
export class UserNotificationsService {
  constructor(
    private readonly db: ConnectDbDataContext,
    private readonly notificationsService: NotificationsService
  ) { }
  /**
   * 
   * SendUserNotification - Send the given notification
   * 
   * @param  {Notification} notification
   * 
   * @returns Promise{Notification}
   * 
   */
  public async sendUserNotification(notification: Notification): Promise<Notification> {
    notification.read = false;
    notification.tenant_id = null;

    if (!notification.expiration_date) {
      const current_date = new Date();
      current_date.setDate(current_date.getDate() + 60);
      notification.expiration_date = current_date.toISOString().split('T')[0];
    }

    const userNotification = new UserNotification(notification);
    const responseNotification = await this.notificationsService.send(userNotification);
    return notification;
  }
  /**
   * 
   * GetUserNotifications - Get all of the Notifications for a specified user
   * 
   * @param  {string} user_id
   * 
   * @returns Promise{Notification[]}
   * 
   */
  public async getUserNotifications(user_id: string): Promise<Notification[]> {
    const notifications: Notification[] = await this.db.notifications.find({ user_id: user_id });
    return notifications;
  }

  /**
   * 
   * ReadUserNotification - Mark a specific Notification as Read. If the Notification is already read, it does not update the read date. 
   * 
   * @param  {string} id
   * 
   * @returns Promise{Notification}
   * 
   */
  public async readUserNotification(id: string): Promise<Notification> {
    const notification = await this.db.notifications.findOneAndUpdate({ _id: id, read: false },
      { read: true, read_date: new Date(Date.now()).toISOString() },
      { new: true }
    );
    return notification;
  }

  /**
   * 
   * DeleteUserNotification - Delete a user notification from the mongo collection
   * 
   * @param  {string} id
   * 
   * @returns Promise{void}
   * 
   */
  public async deleteUserNotification(id: string): Promise<void> {
    await this.db.notifications.findOneAndDelete({ _id: id });
    return;
  }
}
