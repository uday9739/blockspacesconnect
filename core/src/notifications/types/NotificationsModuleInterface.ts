import { ModuleMetadata, Type } from '@nestjs/common';
import { JobOptions, Queue } from 'bull';

export type NotificationsModuleOptions = {
  queue?: Queue;
  defaultJobOptions?: JobOptions;
};

export interface NotificationsModuleOptionsFactory {
  createNestJsNotificationsModuleOptions():
    | Promise<NotificationsModuleOptions>
    | NotificationsModuleOptions;
}

export interface NestJsNotificationsModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useExisting?: Type<NotificationsModuleOptionsFactory>;
  useClass?: Type<NotificationsModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) =>
    | Promise<NotificationsModuleOptions>
    | NotificationsModuleOptions;
}
