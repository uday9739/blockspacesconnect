import { Controller, Post, Body } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import ApiResult from "@blockspaces/shared/models/ApiResult";

import { ConnectLogger } from "../../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import GatewayProvisioningService from "../services/PoktGatewayProvisioningService";
import { User } from "../../../users";
import { CreateNetworkEndpointForUserResponse } from "../models";
import { IUser } from "@blockspaces/shared/models/users";

@Controller("/networks/gateway")
export class PoktGatewayController {
  constructor(private readonly gatewayProvisioningService: GatewayProvisioningService, @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger) {
    logger.setModule(this.constructor.name);}

  @Post("request")
  async requestEndpoint(@User() user: IUser, @Body("networkId") networkId): Promise<ApiResult<CreateNetworkEndpointForUserResponse>> {
    let results = await this.gatewayProvisioningService.CreateNetworkEndpointForUser(user.id, networkId);
    if (results.isFailure) return ApiResult.failure(results.message);
    return ApiResult.success(results.data);
  }
}
