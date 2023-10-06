import { Module } from "@nestjs/common";
import { LndController } from "./controllers/LndController";
import { LightningHttpService } from "./services/LightningHttpService";
import { LndService } from "./services/LndService";
import { DatabaseModule } from "src/database/DatabaseModule";
import { HttpModule } from "src/http";

// For communicating with LND
@Module({
  imports: [
    DatabaseModule,
    HttpModule
  ],
  controllers: [LndController],
  providers: [LightningHttpService, LndService],
  exports: [LndService, LightningHttpService]
})
export class LndModule { }
