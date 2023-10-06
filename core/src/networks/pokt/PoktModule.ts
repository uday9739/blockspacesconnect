/* eslint-disable new-cap */
import {Module} from "@nestjs/common";
import { PoktDashboardController } from "./controllers/PoktDashboardController";
import { NodeMonitoringDbModule } from "../../node-monitoring-db/NodeMonitoringDbModule";
import { ServiceCatalogModule } from "../../service-catalog";
import { PoktDashboardService } from "./services/PoktDashboardService";

/** Module containing resources related to Pocket Network (POKT) */
@Module({
  controllers: [PoktDashboardController],
  imports: [
    NodeMonitoringDbModule,
    ServiceCatalogModule
  ],
  providers: [PoktDashboardService],
  exports: [PoktDashboardService]
})
export class PoktModule {}
