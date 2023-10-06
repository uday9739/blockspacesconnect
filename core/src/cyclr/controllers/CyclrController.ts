import { Controller, Get, NotFoundException, Query } from "@nestjs/common";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { AllowAnonymous } from "../../auth";
import ApiResult from "@blockspaces/shared/models/ApiResult";

@Controller("/cyclr")
export class CyclrController {
  constructor(private readonly db: ConnectDbDataContext) {}

  /**
   * For cases where we need to know if cyclr is enabled for a payment on the point of sale.
   * 
   * @returns If cyclr is enabled for the tenant
   */
  @AllowAnonymous()
  @Get("/enabled")
  async isCyclrEnabled(@Query("tenantId") tenantId: string): Promise<ApiResult<boolean>> {
    const user = await this.db.users.findOne({tenants: tenantId})
    if (!user) throw new NotFoundException(ApiResult.failure("User not found"))
    return ApiResult.success(user.featureFlags.cyclrUserBIP)
  }
}