import { Module } from "@nestjs/common";
import { AuthModule } from "../auth";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { CyclrModule } from "../cyclr/CyclrModule";
import { WebhookModule } from "../webhooks/WebhookModule";
import { IntegrationsController } from "./controllers/IntegrationsController";
import { IntegrationsService } from "./services/IntegrationsService";

@Module({
  imports: [
    ConnectDbModule,
    CyclrModule,
    AuthModule,
    WebhookModule,
  ],
  controllers: [
    IntegrationsController
  ],
  providers: [
    IntegrationsService,
  ],
  exports: [
    IntegrationsService
  ]
})
export class IntegrationsModule { };