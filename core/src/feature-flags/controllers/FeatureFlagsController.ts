import ApiResult from "@blockspaces/shared/models/ApiResult";
import {Controller, Get} from '@nestjs/common';
import {FeatureFlagsService} from "../services/FeatureFlagsService";
import {AllowAnonymous} from "../../auth";
import {UserFeatureFlags} from "../../users";

@Controller("feature-flags")
export class FeatureFlagsController {
  constructor(
    private readonly featureFlagsService: FeatureFlagsService
  ) { }

  @AllowAnonymous()
  @Get("flags")
  async getFlags(): Promise<ApiResult> {
    const flagList:Array<string> = await this.featureFlagsService.getFeatureFlagList();
    return ApiResult.success(flagList,"a list of user feature flags");
  }
  @AllowAnonymous()
  @Get("system-flags")
  async getSystemFlags(): Promise<ApiResult> {
    const flagList:Array<any> = await this.featureFlagsService.getSystemFeatureFlagList();
    return ApiResult.success(flagList,"a list of system feature flags");
  }
  @Get("user-flags")
  async getUserFlags(@UserFeatureFlags() userFlags: Object): Promise<ApiResult> {
    return ApiResult.success(userFlags,"a list of the active user's feature flags");
  }
}
