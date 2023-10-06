import { Module } from "@nestjs/common";
import { ConnectDbModule } from "../../../connect-db/ConnectDbModule";
import { SecretsModule } from "../../../secrets/SecretsModule";
import { LndModule } from "../lnd/LndModule";
import { LightningNodeModule } from "../node/LightningNodeModule";
import { OnboardController } from "./controllers/LightningOnboardController";
import { OnboardService } from "./services/LightningOnboardService";
import { SnsTransportModule } from "../../../sns-transport/sns-transport.module";
import { LightningInvoicesModule } from "../invoices/LightningInvoicesModule";
import { LightningTasksService } from "./services/LightningTasksService";
import { HttpModule } from "../../../http";
import { ExternalOnboardService } from "./services/ExternalNodeOnboardingService";

@Module({
  imports: [
    LightningNodeModule,
    LndModule,
    SecretsModule,
    ConnectDbModule,
    SnsTransportModule,
    LightningInvoicesModule,
    HttpModule
  ],
  controllers: [OnboardController],
  providers: [
    OnboardService,
    LightningTasksService,
    ExternalOnboardService
  ],
  exports: [
    OnboardService,
    LightningTasksService,
  ]
})
export class LightningOnboardingModule { }
