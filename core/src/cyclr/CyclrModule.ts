
import { Module } from "@nestjs/common";
import { HttpModule } from "../http";
import { LoggingModule } from "../logging/LoggingModule";
import { CyclrService } from "./services/CyclrService";
import { CyclrController } from "./controllers/CyclrController";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";

@Module({
  imports: [
    HttpModule,
    LoggingModule,
    ConnectDbModule
  ],
  controllers: [
    CyclrController
  ],
  providers: [
    CyclrService
  ],
  exports: [
    CyclrService
  ]
})
export class CyclrModule { }
