import { Module } from "@nestjs/common";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { FeatureFlagsModule } from "../feature-flags/FeatureFlagsModule";
import { HaproxyModule } from "../haproxy/HaproxyModule";
import { HttpModule } from "../http";
import { NodeMonitoringDbModule } from "../node-monitoring-db";
import { NotificationsModule } from "../notifications/NotificationsModule";
import { ServiceCatalogModule } from "../service-catalog";
import { UserNetworksModule } from "../user-network/UserNetworkModule";
import { EndpointController } from "./controllers/EndpointController";
import { EndpointsService, EndpointsDashboardService } from "./services";

@Module({
  imports: [
    HttpModule,
    HaproxyModule,
    ConnectDbModule,
    NodeMonitoringDbModule,
    ServiceCatalogModule,
    UserNetworksModule,
    FeatureFlagsModule,
    NotificationsModule
  ],
  controllers: [EndpointController],
  providers: [
    EndpointsService,
    EndpointsDashboardService
  ],
  exports: [EndpointsService]
})
export class EndpointsModule { };