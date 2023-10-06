import { Module } from "@nestjs/common";
import { PlatformStatusController } from "./controllers/PlatformStatusController";
import { AppIdModule } from "../app-id/AppIdModule";
import { VaultModule } from "../vault/VaultModule";
import { HaproxyModule } from "../haproxy/HaproxyModule"
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { PlatformStatusService } from "./index";
import { CyclrModule } from "../cyclr/CyclrModule";
import { FeatureFlagsModule } from "../feature-flags/FeatureFlagsModule";
import { BitcoinModule } from "../networks/bitcoin/BitcoinModule";

/**
 * Encapsulates resources that provide information about the BlockSpaces platform
 */
@Module({
  imports: [
    AppIdModule,
    VaultModule,
    ConnectDbModule,
    HaproxyModule,
    FeatureFlagsModule,
    CyclrModule,
    BitcoinModule
  ],
  providers: [PlatformStatusService],
  controllers: [PlatformStatusController],
})
export class PlatformModule { }
