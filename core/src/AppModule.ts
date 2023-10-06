import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, RouterModule } from '@nestjs/core';
import { AppController } from './AppController';
import { AuthModule, JwtAuthGuard } from './auth';
import { EnvModule } from './env/EnvModule';
import { GlobalExceptionFilter } from './exceptions/filters/GlobalExceptionFilter';
import { LoggingModule } from './logging/LoggingModule';
import { NetworksModule } from './networks/NetworksModule';
import { PlatformModule } from './platform/PlatformModule';
import { UsersModule } from './users/UsersModule';
import { ApplicationMonitorModule } from "./application-monitor/ApplicationMonitorModule";
import { SecretsModule } from './secrets/SecretsModule';
import { NetworkCatalogModule } from './network-catalog/NetworkCatalogModule';
import { UserNetworksModule } from './user-network/UserNetworkModule';
import { QuickbooksModule } from './quickbooks/QuickbooksModule';
import { CartModule } from './cart/CartModule';
import { ConnectSubscriptionModule } from './connect-subscription/ConnectSubscriptionModule';
import { StripeModule } from './stripe/StripeModule';
import { UserRegistrationModule } from './user-registration/UserRegistrationModule';
import { EndpointsModule } from './endpoints/EndpointsModule';
import { UserProfileModule } from './user-profile/user-profile.module';
import { TaskQueueModule } from './task-queue/TaskQueueRunnerModule';
import { NotificationsModule } from './notifications/NotificationsModule';
import { SampleModule } from './sample-module/SampleModule';
import { FeatureFlagsModule } from "./feature-flags/FeatureFlagsModule";
import { CyclrModule } from './cyclr/CyclrModule';
import { ExternalApiModule } from './external-api/ExternalApiModule';
import { ErpModule } from './external-api/erp/ErpModule';
import { BipApiModule } from './external-api/bip/BipApiModule';
import { ExternalBitcoinModule } from './external-api/bitcoin/ExternalBitcoinModule';
import { IntegrationsModule } from './integrations/IntegrationsModule';
import { E2eModule } from './e2e/E2eModule';
import { ErpObjectsModule } from './erp-objects/ErpObjectsModule';
import { ConnectorsCatalogModule } from './connectors-catalog/ConnectorsCatalogModule';
import { WishlistModule } from './wishlist/WishlistModule';
import { TenantsModule } from './tenants/TenantsModule';
import { AuthenticatedMiddleware } from './middleware/services/AuthenticatedMiddleware';
import { ConnectDbModule } from './connect-db/ConnectDbModule';



@Module({
  imports: [
    ApplicationMonitorModule,
    EnvModule,
    LoggingModule,
    ConnectDbModule,
    AuthModule,
    NetworksModule,
    PlatformModule,
    FeatureFlagsModule,
    UsersModule,
    UserRegistrationModule,
    SecretsModule,
    NetworkCatalogModule,
    UserNetworksModule,
    QuickbooksModule,
    StripeModule,
    CartModule,
    ConnectSubscriptionModule,
    UserProfileModule,
    TaskQueueModule,
    NotificationsModule.forRoot({}),
    EndpointsModule,
    CyclrModule,
    SampleModule,
    ExternalApiModule,
    ErpModule,
    ErpObjectsModule,
    BipApiModule,
    ExternalBitcoinModule,
    IntegrationsModule,
    E2eModule,
    RouterModule.register([{
      path: 'external',
      module: ExternalApiModule,
      children: [{
        path: 'erp',
        module: ErpModule
      }, {
        path: 'bip',
        module: BipApiModule
      }, {
        path: 'bitcoin',
        module: ExternalBitcoinModule
      }]
    }]),
    ConnectorsCatalogModule,
    WishlistModule,
    TenantsModule,
  ],

  providers: [
    // use GlobalExceptionFilter as the default exception filter for all unhandled errors
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    },

    // enable authentication globally (routes will need to use the @AllowAnonymous decorator to not require authentication)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ],

  controllers: [AppController]
})
export class AppModule { 
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticatedMiddleware)
      .forRoutes('*');
  }
}
