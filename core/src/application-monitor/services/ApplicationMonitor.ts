import {OnApplicationShutdown, Inject, Injectable} from "@nestjs/common";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";

@Injectable()
export class ApplicationMonitor implements OnApplicationShutdown {
  constructor(
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ){
    logger.setModule(this.constructor.name);
  }

  onApplicationShutdown(signal: string) {
    this.logger.debug(`Process ${process.pid} has been interrupted by ${signal}`);
  }
}
