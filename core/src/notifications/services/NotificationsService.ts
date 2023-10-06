import { Inject, Injectable, OnModuleInit, Type } from '@nestjs/common';
import { JobOptions, Queue } from 'bull';
import { ConnectDbDataContext } from '../../connect-db/services/ConnectDbDataContext';
import { NotificationChannelInterface } from '../types';
import { ModuleRef } from '@nestjs/core';
import {
  NESTJS_NOTIFICATIONS_JOB_OPTIONS,
  NESTJS_NOTIFICATIONS_QUEUE,
} from '../types/NotificationsModuleConstants';
import { NotificationInterface, QueuedNotification } from '../types';

@Injectable()
export class NotificationsService implements OnModuleInit {
  processor_name = 'notification';
  constructor(
    private moduleRef: ModuleRef,
    @Inject(NESTJS_NOTIFICATIONS_QUEUE)
    private notificationsQueue: Queue,
    @Inject(NESTJS_NOTIFICATIONS_JOB_OPTIONS)
    private defaultJobOptions: JobOptions,
  ) { }

  onModuleInit() {
    if (this.notificationsQueue) {
      this.notificationsQueue.process(
        this.processor_name,
        async (job: { data: { notification; callback } }, done) => {
          try {
            await job.data.callback(job.data.notification).then(done());
          } catch (e) {
            throw e;
          }
        },
      );
    }
  }

  /**
   * Process a notification and send via designated channel
   * @param notification
   */
  public send(notification: NotificationInterface): Promise<any> {
    const channels = notification.broadcastOn();
    return Promise.all(
      channels.map((channel: Type<NotificationChannelInterface>) =>
        this.sendOnChannel(notification, channel),
      ),
    );
  }

  /**
   * Push a job to the queue
   * @param notification
   */
  public queue(notification: QueuedNotification): any {
    if (!this.notificationsQueue) throw new Error('No Queue Specified');

    return this.notificationsQueue.add(
      this.processor_name,
      {
        notification,
        callback: this.send,
      },
      notification.getJobOptions()
        ? notification.getJobOptions()
        : this.defaultJobOptions,
    );
  }

  /**
   * Send notification on designated channel
   * @param notification
   * @param channel
   */
  async sendOnChannel(
    notification: NotificationInterface,
    channel: Type<NotificationChannelInterface>,
  ): Promise<any> {
    const chann = await this.resolveChannel(channel);
    await chann.send(notification);
  }

  /**
   * Resolve the channel needed to send the Notification
   * @param channel
   */
  resolveChannel = (channel: Type<NotificationChannelInterface>) =>
    this.moduleRef.create(channel);


}