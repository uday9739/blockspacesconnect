import { Type } from '@nestjs/common';
import { NotificationInterface, NotificationChannelInterface } from '.';
import { EmailChannel, InAppChannel } from '../channels';
import { Notification } from '@blockspaces/shared/models/platform';
import { MailDataRequired } from '@sendgrid/mail';

export class Invitation implements NotificationInterface {

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
      EmailChannel,
    ];
  }

  toHttp() { }

  toEmail(): MailDataRequired {
    const msg: MailDataRequired = {
      from: { email: 'support@blockspaces.com' },
      to: this.data.email_id,
      // bcc: [{ email: 'pokt-reports@blockspaces.com' }],
      dynamicTemplateData: this.data.dynamic_email_data,
      subject: this.data.title,
      templateId: this.data.dynamic_email_template_id,
    };
    return msg;
  }

  /**
   * Get the json representation of the notification.
   * @returns {}
   */
  toPayload(): any {
    return this.data;
  }
}