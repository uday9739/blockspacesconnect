import { Module } from "@nestjs/common";
import {ApplicationMonitor} from "./services/ApplicationMonitor";

/**
 * This module encapsulates all modules that contain resources related to monitoring
 */
@Module({
  providers: [ApplicationMonitor],
})
export class ApplicationMonitorModule {}
