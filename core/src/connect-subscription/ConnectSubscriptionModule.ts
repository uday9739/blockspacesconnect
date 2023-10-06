

import { forwardRef, Module } from "@nestjs/common";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { EndpointsModule } from "../endpoints/EndpointsModule";
import { JiraModule } from "../jira/JiraModule";
import { NetworkCatalogModule } from "../network-catalog/NetworkCatalogModule";
import { LightningInvoicesModule } from "../networks/lightning/invoices/LightningInvoicesModule";
import { LightningModule } from "../networks/lightning/LightningModule";
import { LndModule } from "../networks/lightning/lnd/LndModule";
import { LightningWalletModule } from "../networks/lightning/wallet/LightningWalletModule";
import { NodeMonitoringDbModule } from "../node-monitoring-db";
import { QuickbooksModule } from "../quickbooks/QuickbooksModule";
import { StripeModule } from "../stripe/StripeModule";
import { TaskQueueModule } from "../task-queue/TaskQueueRunnerModule";
import { UserNetworksModule } from "../user-network/UserNetworkModule";
import { UsersModule } from "../users/UsersModule";
import { ConnectSubscriptionController } from "./controllers/ConnectSubscriptionController";
import { InvoicesController } from "./controllers/InvoicesController";
import { CancellationService } from "./services/CancellationService";
import { ConnectSubscriptionService } from "./services/ConnectSubscriptionService";
import { PaymentStorageService } from "./services/PaymentStorageService";
import { PaymentMethodsController } from "./controllers/PaymentMethodsController";
import { AuthorizationModule } from "../authorization/AuthorizationModule";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ConnectDbModule,
    forwardRef(() => NetworkCatalogModule),
    forwardRef(() => StripeModule),
    UserNetworksModule,
    LightningInvoicesModule,
    forwardRef(() => TaskQueueModule),
    QuickbooksModule,
    EndpointsModule,
    NodeMonitoringDbModule,
    LightningWalletModule,
    LndModule,
    JiraModule,
    AuthorizationModule
  ],
  controllers: [ConnectSubscriptionController, InvoicesController, PaymentMethodsController],
  providers: [ConnectSubscriptionService, CancellationService, PaymentStorageService],
  exports: [ConnectSubscriptionService, CancellationService, PaymentStorageService]
})
export class ConnectSubscriptionModule { }
