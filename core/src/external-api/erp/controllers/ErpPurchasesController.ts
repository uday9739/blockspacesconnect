import { Body, Controller, Post, UseGuards, UsePipes } from "@nestjs/common";
import { AllowAnonymous } from "../../../auth";
import { AuthGuard } from "@nestjs/passport";
import { CustomValidationPipe } from "../../../exceptions/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiSecurity, ApiTags, ApiUnprocessableEntityResponse } from "@nestjs/swagger";
import { Tenant as TenantDoc } from "@blockspaces/shared/models/tenants";
import { ErpPurchasesService } from "../services/ErpPurchasesService";
import { Tenant } from "../../../tenants/decorators";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { ErpPurchaseDto } from "@blockspaces/shared/dtos/erp-data";
import { ErpPurchaseResult } from "@blockspaces/shared/models/erp-integration/ErpObjects";

/**
 * CRUD ops for ERP Purchases Cache
 *
 * @class ErpPurchasesService
 * @typedef {ErpPurchasesService}
 */
@AllowAnonymous()
@UseGuards(AuthGuard('api-key'))
@UsePipes(new CustomValidationPipe())
@ApiBadRequestResponse({ description: "Request Failed" })
@ApiUnprocessableEntityResponse({ description: "Validation Failed or Lookup Failed" })
@ApiSecurity('ApiKey')
@ApiTags('Purchase')
@Controller('purchase')
export class ErpPurchasesController {
  constructor(
    private readonly erpPurchasesService: ErpPurchasesService,
  ) {}

  /**
   * Creates new Purchase Doc in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {ErpPurchaseDto} erpPurchaseDto
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiBody({ type: ErpPurchaseDto })
  @ApiCreatedResponse({ description: "Purchase created", type: ErpPurchaseResult })
  @Post()
  async create(@Tenant() tenant: TenantDoc, @Body() erpPurchaseDto: ErpPurchaseDto) {
    return ApiResult.success(await this.erpPurchasesService.create(erpPurchaseDto, tenant.tenantId));
  }
}