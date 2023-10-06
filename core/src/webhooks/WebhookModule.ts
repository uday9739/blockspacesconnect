import { Module } from "@nestjs/common";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { HttpModule } from "../http";
import { EventEmitService } from "./services/EventEmitService";
import { WebhookService } from "./services/WebhookService";

@Module({
  imports: [
    HttpModule,
    ConnectDbModule,
  ],
  controllers: [],
  providers: [
    WebhookService,
    EventEmitService
  ],
  exports: [
    WebhookService,
    EventEmitService
  ]
})
export class WebhookModule { };
