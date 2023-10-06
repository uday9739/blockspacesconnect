import { Module } from "@nestjs/common";
import { FeatureFlagsController } from "./controllers/FeatureFlagsController";
import { FeatureFlagsService } from "./services/FeatureFlagsService";
import { SystemFeatureFlagsService } from "./services/SystemFeatureFlagsService";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";

/**
 * Encapsulates resources that provides information about feature flags
 */
@Module({
  imports: [ConnectDbModule],
  providers: [
    FeatureFlagsService,
    SystemFeatureFlagsService
  ],
  exports: [
    FeatureFlagsService,
    SystemFeatureFlagsService
  ],
  controllers: [FeatureFlagsController],
})
export class FeatureFlagsModule { }
