import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConnectDbModule } from '../connect-db/ConnectDbModule';
import { ConnectSubscriptionModule } from '../connect-subscription/ConnectSubscriptionModule';
import { HttpModule } from '../http/HttpModule';
import { QuickbooksClient } from '../quickbooks/clients/QuickbooksClient';
import { QuickbooksClientFactory } from '../quickbooks/clients/QuickbooksClientFactory';
import { SecretService } from '../secrets/services/SecretService';
import { VaultService } from '../vault';
import { TaskQueueItemDataService } from './services/TaskQueueItemDataService';
import { TasksRunnerService } from './services/TasksRunnerService';
import { AppIdService } from "../app-id";
import { LightningOnboardingModule } from '../networks/lightning/onboarding/LightningOnboardingModule';
import { EndpointsModule } from '../endpoints/EndpointsModule';
import { LndModule } from '../networks/lightning/lnd/LndModule';

@Module({
  imports: [
    HttpModule,
    ConnectDbModule,
    ScheduleModule.forRoot(),
    forwardRef(() => ConnectSubscriptionModule),
    LightningOnboardingModule,
    LndModule,
    EndpointsModule
  ],
  providers: [
    TasksRunnerService,
    TaskQueueItemDataService,
    QuickbooksClient,
    SecretService,
    QuickbooksClientFactory,
    VaultService,
    AppIdService
  ],
  exports: [TaskQueueItemDataService]
})
export class TaskQueueModule { }