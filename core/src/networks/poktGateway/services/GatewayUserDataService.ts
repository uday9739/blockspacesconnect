//#region imports
import { Inject, Injectable, NotImplementedException } from "@nestjs/common";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { GatewayUserAccountStatus, GatewayUserData } from "@blockspaces/shared/models/poktGateway";
import GatewayProvisioningService from "./PoktGatewayProvisioningService";
import { EnvironmentVariables, ENV_TOKEN } from "../../../env";

//#endregion

@Injectable()
export default class GatewayUserDataService {
  constructor(
    private readonly dataContext: ConnectDbDataContext,
    private readonly gatewayProvisioningService: GatewayProvisioningService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {
    logger.setModule(this.constructor.name);}
  async getGatewayByUserId(userId: string): Promise<GatewayUserData> {
    let poktUserDataQuery = await this.dataContext.gatewayUser.findOne({ userId: userId });
    return poktUserDataQuery?.toObject<GatewayUserData>();
  }
  async getAndVerifyGatewayByUserId(userId: string): Promise<GatewayUserDataWithEndpointPrefix> {
    let gatewayUserData = await this.getGatewayByUserId(userId);
    if (gatewayUserData?.status === GatewayUserAccountStatus.REQUESTED) {
      let verifyResults = await this.gatewayProvisioningService.VerifyUser(userId);
      if (verifyResults.isSuccess) {
        return {
          ...verifyResults.data,
          poktGatewayRelayUrlPart: this.env.poktGateway.poktGatewayRelayUrlPart
        };
      }
    }
    return {
      ...gatewayUserData,
      poktGatewayRelayUrlPart: this.env.poktGateway.poktGatewayRelayUrlPart
    };
  }
}

interface GatewayUserDataWithEndpointPrefix extends GatewayUserData {
  poktGatewayRelayUrlPart: string;
}
