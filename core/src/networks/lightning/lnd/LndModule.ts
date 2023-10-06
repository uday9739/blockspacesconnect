import { Module } from "@nestjs/common";
import { LightningNodeModule } from "../node/LightningNodeModule";
import { HttpModule } from "../../../http";
import { LndController } from "./controllers/LndController";
import { LightningHttpService } from "./services/LightningHttpService";
import { LndService } from "./services/LndService";
import { ConnectDbModule } from "../../../connect-db/ConnectDbModule";

// For communicating with LND
@Module({
  imports: [
    HttpModule,
    LightningNodeModule,
    ConnectDbModule
  ],
  controllers: [LndController],
  providers: [LightningHttpService, LndService],
  exports: [LndService, LightningHttpService]
})
export class LndModule {}
