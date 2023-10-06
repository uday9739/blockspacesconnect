import { Notification } from "@blockspaces/shared/models/platform";
import { Injectable } from "@nestjs/common";
import { NotificationsService } from "./NotificationsService";
import { Email } from "../types/Email";

@Injectable()
export class EmailService {
  constructor(
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
  public async sendEmail(notification: Notification): Promise<Notification> {
    notification.read = false;
    notification.tenant_id = null;

    if (!notification.expiration_date) {
      const current_date = new Date();
      current_date.setDate(current_date.getDate() + 60);
      notification.expiration_date = current_date.toISOString().split('T')[0];
    }

    const email = new Email(notification);
    await this.notificationsService.send(email);
    return notification;
  }

}