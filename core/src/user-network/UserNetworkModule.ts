import { Module } from "@nestjs/common";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { UserNetworkController } from "./controllers/UserNetworkController";
import { UserNetworkDataService } from "./services/UserNetworkDataService";

/**
 * Module providing services and endpoints related to "user networks", the relationships between users and specific blockchain networks
 */
@Module({
  imports: [ConnectDbModule],
  controllers: [UserNetworkController],
  providers: [UserNetworkDataService],
  exports: [UserNetworkDataService]
})
export class UserNetworksModule { }
