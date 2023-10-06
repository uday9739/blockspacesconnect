import { Module } from "@nestjs/common";
import { AppIdModule } from "../app-id/AppIdModule";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { HttpModule } from "../http";
import { NotificationsModule } from "../notifications/NotificationsModule";
import { SecretsModule } from "../secrets/SecretsModule";
import { E2eController } from "./controllers/E2eController";
import { E2eService } from "./services/E2eService";

@Module({
  imports: [
    HttpModule,
    ConnectDbModule,
    SecretsModule,
    AppIdModule,
    NotificationsModule
  ],
  controllers: [
    E2eController
  ],
  providers: [
    E2eService,
  ],
  exports: [
    E2eService
  ]
})
export class E2eModule {};