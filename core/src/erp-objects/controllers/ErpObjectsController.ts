import { Controller, Get, Param } from "@nestjs/common";
import { ErpObjectsService } from "../services/ErpObjectsService";
import { AllowAnonymous } from "../../auth";
import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { ErpObject } from "@blockspaces/shared/models/erp-integration/ErpObjects";

@Controller("/erp")
export class ErpObjectsController {
  constructor(private readonly erpObjectService: ErpObjectsService) {}

  @AllowAnonymous()
  @Get("invoice/:tenantId/:domain/:externalId")
  async lookupErpInvoice(@Param("tenantId") tenantId: string, @Param("domain") domain: string, @Param("externalId") externalId: string): AsyncApiResult<ErpObject> {
    const result = await this.erpObjectService.lookupErpObject(tenantId, externalId, domain)
    return ApiResult.success(result)
  }
}