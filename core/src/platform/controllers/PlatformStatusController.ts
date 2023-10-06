import ApiResult from "@blockspaces/shared/models/ApiResult";
import { Controller, Get } from '@nestjs/common';
import { PlatformStatusService } from "../services/PlatformStatusService";
import { AllowAnonymous } from "../../auth";
import { FeatureFlagsService } from "../../feature-flags";

@Controller("platform")
export class PlatformStatusController {
  constructor(
    private readonly platformStatusService: PlatformStatusService
  ) { }

  @AllowAnonymous()
  @Get("status")
  async getStatus(): Promise<ApiResult> {
    return ApiResult.success(await this.platformStatusService.getStatus());
  }

  @AllowAnonymous()
  @Get(["status/detailed", "detailedStatus"])
  async getDetailedStatus(): Promise<ApiResult> {
    return ApiResult.success(await this.platformStatusService.getDetailedStatus());
  }
}
