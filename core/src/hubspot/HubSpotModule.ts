import { forwardRef, Module } from "@nestjs/common";
import { UsersModule } from "../users";
import { HubSpotController } from "./controllers/HubSpotController";
import { HubSpotService } from "./services/HubSpotService";
import { HttpModule } from "../http";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    HttpModule
  ],
  controllers: [HubSpotController],
  providers: [HubSpotService],
  exports: [HubSpotService]
})
export class HubSpotModule { }
