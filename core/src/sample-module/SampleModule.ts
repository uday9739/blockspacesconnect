import { Module } from "@nestjs/common";
import { AuthModule } from "../auth";
import { WebhookModule } from "../webhooks/WebhookModule";
import { SampleController } from "./controllers/SampleController";
import { SampleService } from "./services/SampleService";
import {SnsTransportModule} from "../sns-transport/sns-transport.module";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";


@Module({
  imports: [
    AuthModule,
    WebhookModule,
    SnsTransportModule,
    ConnectDbModule
  ],
  controllers: [SampleController],
  providers: [
    SampleService
  ],
  exports: []
})
export class SampleModule { }
