import ApiResult from '@blockspaces/shared/models/ApiResult';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes } from '@nestjs/common';
import { ErpSalesReceiptsService } from '../services/ErpSalesReceiptsService';
import { ErpSalesReceiptDto, UpdateErpSalesReceiptDto } from '@blockspaces/shared/dtos/erp-data';
import { Tenant } from '../../../tenants/decorators/Tenant.decorator';
import { AllowAnonymous } from '../../../auth';
import { AuthGuard } from '@nestjs/passport';
import { Tenant as TenantDoc } from "@blockspaces/shared/models/tenants";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiSecurity, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { CustomValidationPipe } from '../../../exceptions/common';
import { domains, ErpSalesReceiptResult } from '@blockspaces/shared/models/erp-integration/ErpObjects';

/**
 * CRUD operations for Erp Data Cache - Sales Receipts
 *
 * @class ErpSalesReceiptsController
 * @typedef {ErpSalesReceiptsController}
 */
@AllowAnonymous()
@UseGuards(AuthGuard('api-key'))
@UsePipes(new CustomValidationPipe())
@ApiBadRequestResponse({ description: "Request Failed" })
@ApiUnprocessableEntityResponse({ description: "Validation Failed or Lookup Failed" })
@ApiTags('Sales Receipt')
@ApiSecurity('ApiKey')
@Controller('sales-receipt')
export class ErpSalesReceiptsController {
  constructor(
    private readonly erpSalesReceiptsService: ErpSalesReceiptsService,
  ) { }

  /**
   * Creates new Sales Receipt Doc in ERP Objects Cache  
   *
   * @param {TenantDoc} tenant
   * @param {ErpSalesReceiptDto} erpSalesReceiptDto
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiBody({ type: ErpSalesReceiptDto })
  @ApiCreatedResponse({ description: "Sales Receipt created", type: ErpSalesReceiptResult })
  @Post()
  async create(@Tenant() tenant: TenantDoc, @Body() erpSalesReceiptDto: ErpSalesReceiptDto) {
    return ApiResult.success(await this.erpSalesReceiptsService.create(erpSalesReceiptDto, tenant.tenantId));
  }

  /**
   * Finds an existing Sales Receipt Doc in ERP Objects Cache  
   *
   * @param {TenantDoc} tenant
   * @param {string} domain
   * @param {string} externalId
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "Object found", type: ErpSalesReceiptResult })
  @ApiNotFoundResponse({ description: "Entity Not found" })
  @Get(':domain/:id')
  async findOne(@Tenant() tenant: TenantDoc, @Param('domain') domain: string, @Param('id') externalId: string) {
    return ApiResult.success(await this.erpSalesReceiptsService.findOne(tenant.tenantId, externalId, domain));
  }

  /**
   * Finds all existing Sales Receipt Docs in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} domain
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiOkResponse({ description: "Objects found" })
  @Get(':domain')
  async find(@Tenant() tenant: TenantDoc, @Param('domain') domain: string) {
    return ApiResult.success(await this.erpSalesReceiptsService.findAll(tenant.tenantId, domain));
  }

  /**
   * Finds and updates existing Sales Receipt Docs in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} externalId
   * @param {string} domain
   * @param {UpdateErpSalesReceiptDto} erpSalesReceiptDto
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiBody({ type: UpdateErpSalesReceiptDto })
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "Success" })
  @Patch(':domain/:id')
  async update(@Tenant() tenant: TenantDoc, @Param('domain') domain: string, @Param('id') externalId: string, @Body() erpSalesReceiptDto: UpdateErpSalesReceiptDto) {
    return ApiResult.success(await this.erpSalesReceiptsService.update(tenant.tenantId, externalId, domain, erpSalesReceiptDto));
  }

  /**
   * Finds and removes a Sales Receipt Docs in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} externalId
   * @param {string} domain
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "Success" })
  @Delete(':domain/:id')
  async remove(@Tenant() tenant: TenantDoc, @Param('domain') domain: string, @Param('id') externalId: string) {
    return ApiResult.success(await this.erpSalesReceiptsService.remove(tenant.tenantId, externalId, domain));
  }
}
