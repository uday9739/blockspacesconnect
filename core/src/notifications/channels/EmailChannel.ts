import { Inject, Injectable } from '@nestjs/common';
import { Invitation, NotificationChannelInterface, NotificationInterface } from '../types';
import { MailService, MailDataRequired } from '@sendgrid/mail';
import { HttpService } from '@blockspaces/shared/services/http';
import { EnvironmentVariables, ENV_TOKEN } from '../../env';

@Injectable()
export class EmailChannel implements NotificationChannelInterface {
  constructor(
    private readonly httpService: HttpService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables
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
  public async send(notification: Invitation): Promise<void> {
    const mail = new MailService();
    await mail.setApiKey(this.env.sendgrid.apiKey);
    await mail.send(this.getData(notification));
  }

  /**
   * GetData - Get the data for the notification.
   * 
   * @param notification {@link NotificationInterface} - the Notification
   * 
   */
  getData(notification: Invitation): MailDataRequired {
    return notification.toEmail();
  }
}