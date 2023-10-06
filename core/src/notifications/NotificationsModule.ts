import { DynamicModule, Global, Module, ValueProvider } from '@nestjs/common';
import { InAppChannel } from './channels';
import { ConnectDbModule } from '../connect-db/ConnectDbModule';
import { EmailService, InvitationService, NotificationsService, UserNotificationsService } from './services';
import { NotificationsController } from './controllers/NotificationsController';
import {
  NESTJS_NOTIFICATIONS_JOB_OPTIONS,
  NESTJS_NOTIFICATIONS_OPTIONS,
  NESTJS_NOTIFICATIONS_QUEUE,
  NestJsNotificationsModuleAsyncOptions,
  NotificationsModuleOptions,
  NotificationsModuleOptionsFactory,
  UserNotification,
  Invitation,
} from './types';
import { HttpModule } from '../http';


@Global()
@Module({})
export class NotificationsModule {
  public static forRoot(
    options: NotificationsModuleOptions,
  ): DynamicModule {
    const queueProvider: ValueProvider = {
      provide: NESTJS_NOTIFICATIONS_QUEUE,
      useValue: options.queue ? options.queue : null,
    };

    const jobOptionsProvider: ValueProvider = {
      provide: NESTJS_NOTIFICATIONS_JOB_OPTIONS,
      useValue: options.defaultJobOptions ? options.defaultJobOptions : {},
    };

    return {
      global: true,
      module: NotificationsModule,
      controllers: [
        NotificationsController
      ],
      imports: [
        ConnectDbModule,
        HttpModule,
      ],
      providers: [
        queueProvider,
        jobOptionsProvider,
        InAppChannel,
        NotificationsService,
        UserNotificationsService,
        InvitationService,
        EmailService
      ],
      exports: [
        NESTJS_NOTIFICATIONS_QUEUE,
        NESTJS_NOTIFICATIONS_JOB_OPTIONS,
        InAppChannel,
        NotificationsService,
        UserNotificationsService,
        InvitationService,
        EmailService
      ],
    };
  };
};
