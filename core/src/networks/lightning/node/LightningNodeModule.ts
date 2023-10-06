import { Module } from "@nestjs/common";
import { LightningNodeController } from "./controllers/LightningNodeController";
import { ConnectDbModule } from "../../../connect-db/ConnectDbModule";
import { SecretsModule } from "../../../secrets/SecretsModule";
import { LightningMacaroonController } from "./controllers/LightningMacaroonController";
import { LightningMacaroonService } from "./services/LightningMacaroonService";
@Module({
  imports: [ConnectDbModule, SecretsModule],
  controllers: [LightningNodeController, LightningMacaroonController],
  providers: [LightningMacaroonService],
  exports: []
})
export class LightningNodeModule {}
