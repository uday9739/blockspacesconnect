import ApiResult from '@blockspaces/shared/models/ApiResult';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes } from '@nestjs/common';
import { ErpPaymentsService } from '../services/ErpPaymentsService';
import { ErpPaymentDto, UpdateErpPaymentDto } from '@blockspaces/shared/dtos/erp-data';
import { Tenant } from '../../../tenants/decorators/Tenant.decorator';
import { AllowAnonymous } from '../../../auth';
import { AuthGuard } from '@nestjs/passport';
import { Tenant as TenantDoc } from "@blockspaces/shared/models/tenants";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiSecurity, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { CustomValidationPipe } from '../../../exceptions/common';
import { domains, ErpPaymentResult } from '@blockspaces/shared/models/erp-integration/ErpObjects';

/**
 * CRUD operations for Erp Data Cache - Payments
 *
 * @class ErpPaymentsController
 * @typedef {ErpPaymentsController}
 */
@AllowAnonymous()
@UseGuards(AuthGuard('api-key'))
@UsePipes(new CustomValidationPipe())
@ApiBadRequestResponse({ description: "Request Failed" })
@ApiUnprocessableEntityResponse({ description: "Validation Failed or Lookup Failed" })
@ApiSecurity('ApiKey')
@ApiTags('Payment')
@Controller('payment')
export class ErpPaymentsController {
  constructor(
    private readonly erpPaymentsService: ErpPaymentsService,
  ) { }

  /**
   * Creates new Payment Doc in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {ErpPaymentDto} erpPaymentDto
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiBody({ type: ErpPaymentDto })
  @ApiCreatedResponse({ description: "Payment created", type: ErpPaymentResult })
  @Post()
  async create(@Tenant() tenant: TenantDoc, @Body() erpPaymentDto: ErpPaymentDto) {
    return ApiResult.success(await this.erpPaymentsService.create(erpPaymentDto, tenant.tenantId));
  }

  /**
   * Finds an existing Payment Doc in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} domain
   * @param {string} externalId
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "Object found", type: ErpPaymentResult })
  @ApiNotFoundResponse({ description: "Entity Not found" })
  @Get(':domain/:id')
  async findOne(@Tenant() tenant: TenantDoc, @Param('domain') domain: string, @Param('id') externalId: string) {
    return ApiResult.success(await this.erpPaymentsService.findOne(tenant.tenantId, externalId, domain));
  }

  /**
   * Finds all existing Payment Docs in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} domain
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiOkResponse({ description: "Objects found" })
  @Get(':domain')
  async find(@Tenant() tenant: TenantDoc, @Param('domain') domain: string) {
    return ApiResult.success(await this.erpPaymentsService.findAll(tenant.tenantId, domain));
  }

  /**
   * Finds and updates existing Payment Docs in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} externalId
   * @param {UpdateErpPaymentDto} erpPaymentDto
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiBody({ type: UpdateErpPaymentDto })
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "Success" })
  @Patch(':domain/:id')
  async update(@Tenant() tenant: TenantDoc, @Param('domain') domain: string, @Param('id') externalId: string, @Body() erpPaymentDto: UpdateErpPaymentDto) {
    return ApiResult.success(await this.erpPaymentsService.update(tenant.tenantId, externalId, domain, erpPaymentDto));
  }

  /**
   * Finds and removes a Payment Docs in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} externalId
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "Success" })
  @Delete(':domain/:id')
  async remove(@Tenant() tenant: TenantDoc, @Param('domain') domain: string, @Param('id') externalId: string) {
    return ApiResult.success(await this.erpPaymentsService.remove(tenant.tenantId, externalId, domain));
  }
}
