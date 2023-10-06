import ApiResult, { AsyncApiResult } from '@blockspaces/shared/models/ApiResult';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes } from '@nestjs/common';
import { ErpInvoicesService } from '../services/ErpInvoicesService';
import { ErpInvoiceDto, UpdateErpInvoiceDto } from '@blockspaces/shared/dtos/erp-data';
import { Tenant } from '../../../tenants/decorators/Tenant.decorator';
import { AllowAnonymous } from '../../../auth';
import { AuthGuard } from '@nestjs/passport';
import { Tenant as TenantDoc } from "@blockspaces/shared/models/tenants";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiParam, ApiSecurity, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { CustomValidationPipe } from '../../../exceptions/common';
import { domains, ErpInvoiceResult, ErpObject } from '@blockspaces/shared/models/erp-integration/ErpObjects';

/**
 * CRUD operations for Erp Data Cache - Invoices
 * 
 * @class ErpInvoicesController
 * @typedef {ErpInvoicesController}
 */
@AllowAnonymous()
@UseGuards(AuthGuard('api-key'))
@UsePipes(new CustomValidationPipe())
@ApiBadRequestResponse({ description: "Request Failed" })
@ApiUnprocessableEntityResponse({ description: "Validation Failed or Lookup Failed" })
@ApiSecurity('ApiKey')
@ApiTags('Invoice')
@Controller('invoice')
export class ErpInvoicesController {
  constructor(
    private readonly erpInvoicesService: ErpInvoicesService,
  ) { }

  /**
   * Creates new Invoice Doc in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {ErpInvoiceDto} erpInvoiceDto
   * @throws {BadRequestException}
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiCreatedResponse({ description: "Invoice created", type: ErpInvoiceResult })
  @Post()
  async create(@Tenant() tenant: TenantDoc, @Body() erpInvoiceDto: ErpInvoiceDto): AsyncApiResult<ErpObject> {
    return ApiResult.success(await this.erpInvoicesService.create(erpInvoiceDto, tenant.tenantId));
  }

  /**
   * Finds an existing Invoice Doc in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} externalId
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiOkResponse({ description: "Object found", type: ErpInvoiceResult })
  @ApiNoContentResponse({ description: "Entity Not found" })
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiParam({ name: "id", type: String })
  @Get(':domain/:id')
  async findOne(@Tenant() tenant: TenantDoc, @Param('domain') domain: string, @Param('id') externalId: string) {
    return ApiResult.success(await this.erpInvoicesService.findOne(tenant.tenantId, externalId, domain));
  }
  /**
   * Finds all existing Invoice Docs in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} domain
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiOkResponse({ description: "Object found" })
  @Get(':domain')
  async find(@Tenant() tenant: TenantDoc, @Param('domain') domain: string) {
    return ApiResult.success(await this.erpInvoicesService.findAll(tenant.tenantId, domain));
  }

  /**
   * Finds and updates existing Invoice Docs in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} externalId
   * @param {UpdateErpInvoiceDto} erpInvoiceDto
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiOkResponse({ description: "Success" })
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiParam({ name: "id", type: String })
  @Patch(':domain/:id')
  async update(@Tenant() tenant: TenantDoc, @Param('domain') domain: string, @Param('id') externalId: string, @Body() erpInvoiceDto: UpdateErpInvoiceDto) {
    return ApiResult.success(await this.erpInvoicesService.update(tenant.tenantId, externalId, domain, erpInvoiceDto));
  }

  /**
   * Finds and removes a Invoice Docs in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} externalId
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiOkResponse({ description: "Success" })
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiParam({ name: "id", type: String })
  @Delete(':domain/:id')
  async remove(@Tenant() tenant: TenantDoc, @Param('domain') domain: string, @Param('id') externalId: string) {
    return ApiResult.success(await this.erpInvoicesService.remove(tenant.tenantId, externalId, domain));
  }
}
