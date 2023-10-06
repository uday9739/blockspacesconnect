import { Module } from "@nestjs/common";
import { HttpModule } from "../http";
import { HaproxyApiService } from "./services/HaproxyApiService";
import { HaproxyService } from "./services/HaproxyService";

@Module({
  imports: [
    HttpModule
  ],
  providers: [
    HaproxyApiService,
    HaproxyService,
  ],
  exports: [
    HaproxyApiService,
    HaproxyService
  ]
})
export class HaproxyModule { };
