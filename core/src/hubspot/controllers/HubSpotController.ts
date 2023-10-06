import { Controller} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { ConnectLogger } from "../../logging/ConnectLogger";
@Controller('hubspot')
export class HubSpotController {

  constructor(
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger) {
    logger.setModule(HubSpotController.name);
  }

  //TODO Implement this controller as needed

}