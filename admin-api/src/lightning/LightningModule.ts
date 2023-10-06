import { Module } from "@nestjs/common";
import { HttpModule } from "src/http";
import { LightningNodeController } from "./controllers/LightningNodeController";
import { LightningNodeService } from "./services/LightningNodeService";
import { ProductionDbModule } from "src/connect-db/ProductionDbModule";
import { AdminDbModule } from "src/connect-db/AdminDbModule";
import { StagingDbModule } from "src/connect-db/StagingDbModule";
import { DatabaseModule } from "src/database/DatabaseModule";

/**
 * Encapsulates resources that provide information about the BlockSpaces platform
 */
@Module({
  imports: [
    DatabaseModule,
    HttpModule
  ],
  providers: [LightningNodeService],
  controllers: [LightningNodeController],
})
export class LightningModule { }
