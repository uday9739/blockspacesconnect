import { Module } from "@nestjs/common";
import { LightningWalletService } from "./services/LightningWalletService";
import { LightningWalletController } from "./controllers/LightningWalletController";
import { LndModule } from "../lnd/LndModule";
import { ConnectDbModule } from "../../../connect-db/ConnectDbModule";

// For interacting with keygen and unlocking a node
@Module({
  imports: [LndModule, ConnectDbModule],
  controllers: [LightningWalletController],
  providers: [LightningWalletService],
  exports: [LightningWalletService]
})
export class LightningWalletModule {}
