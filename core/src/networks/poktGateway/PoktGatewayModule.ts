import { forwardRef, Module } from "@nestjs/common";
import { ConnectDbModule } from "../../connect-db/ConnectDbModule";
import { HttpModule } from "../../http";
import { UsersModule } from "../../users/UsersModule";
import { PoktGatewayController } from "./controllers/PoktGatewayController";
import GatewayUserDataService from "./services/GatewayUserDataService";
import GatewayProvisioningService from "./services/PoktGatewayProvisioningService";

import GatewayProxyService from "./services/PoktGatewayService";

@Module({
  imports: [HttpModule, forwardRef(() => UsersModule), ConnectDbModule],
  controllers: [PoktGatewayController],
  providers: [GatewayProxyService, GatewayProvisioningService, GatewayUserDataService],
  exports: [GatewayUserDataService]
})
export class PoktGatewayModule {}
