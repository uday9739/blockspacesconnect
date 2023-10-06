import { Module } from '@nestjs/common';
import { AppIdModule } from '../app-id/AppIdModule';
import { ConnectDbModule } from '../connect-db/ConnectDbModule';
import { TenantsModule } from '../tenants/TenantsModule';
import { UsersModule } from '../users';
import { VaultModule } from '../vault/VaultModule';
import { UserRegistrationController } from './controllers/UserRegistrationController';
import { RegistrationStepProvider } from './services/RegistrationStepProvider';
import { UserRegistrationService } from './services/UserRegistrationService';
import { GoogleRecaptcha } from './services/GoogleRecaptcha';
import { HttpModule } from '../http';
import { FeatureFlagsModule } from '../feature-flags/FeatureFlagsModule';
import { InvitationStepProvider } from './services/InvitationStepProvider';
import { NotificationsModule } from '../notifications/NotificationsModule';
import { HubSpotModule } from '../hubspot'

@Module({
  imports: [
    AppIdModule,
    TenantsModule,
    UsersModule,
    HubSpotModule,
    ConnectDbModule,
    VaultModule,
    HttpModule,
    FeatureFlagsModule,
    NotificationsModule
  ],
  controllers: [UserRegistrationController],
  providers: [
    UserRegistrationService,
    RegistrationStepProvider,
    InvitationStepProvider,
    GoogleRecaptcha,

    // registration steps
    ...RegistrationStepProvider.OrderedSteps,
    ...InvitationStepProvider.OrderedSteps,
  ],
})
export class UserRegistrationModule { };