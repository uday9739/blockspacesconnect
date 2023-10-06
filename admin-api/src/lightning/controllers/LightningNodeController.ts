import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { Controller, Get } from "@nestjs/common";
import { LightningNodeService } from "../services/LightningNodeService";

@Controller("lightningnode")
export class LightningNodeController {
  constructor(
    private readonly lightningNodeService: LightningNodeService
  ) {

  }

  @Get('/')
  async getNodes(): AsyncApiResult<LightningNodeReference[]> {
    try {
      return ApiResult.success(await this.lightningNodeService.getAllNodes());
    } catch (error) {
      return ApiResult.failure('Failed getting all nodes', error.message)
    }
  }
}