import { Module } from "@nestjs/common";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { ErpObjectsController } from "./controllers/ErpObjectsController";
import { ErpObjectsService } from "./services/ErpObjectsService";

@Module({
  controllers: [ErpObjectsController],
  providers: [ErpObjectsService],
  imports: [ConnectDbModule]
})
export class ErpObjectsModule { }