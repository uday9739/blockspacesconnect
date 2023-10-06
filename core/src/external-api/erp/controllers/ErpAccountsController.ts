import ApiResult from '@blockspaces/shared/models/ApiResult';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes } from '@nestjs/common';
import { ErpAccountsService } from '../services/ErpAccountsService';
import { ErpAccountDto, UpdateErpAccountDto } from '@blockspaces/shared/dtos/erp-data';
import { Tenant } from '../../../tenants/decorators/Tenant.decorator';
import { AllowAnonymous } from '../../../auth';
import { AuthGuard } from '@nestjs/passport';
import { Tenant as TenantDoc } from "@blockspaces/shared/models/tenants";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiParam, ApiSecurity, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { CustomValidationPipe } from '../../../exceptions/common';
import { domains, ErpAccountResult } from '@blockspaces/shared/models/erp-integration/ErpObjects';

/**
 * CRUD operations for Erp Data Cache - Accounts
 *
 * @class ErpAccountsController
 * @typedef {ErpAccountsController}
 */
@AllowAnonymous()
@UseGuards(AuthGuard('api-key'))
@UsePipes(new CustomValidationPipe())
@ApiBadRequestResponse({ description: "Request Failed" })
@ApiUnprocessableEntityResponse({ description: "Validation Failed or Lookup Failed" })
@ApiSecurity('ApiKey')
@ApiTags('Account')
@Controller('account')
export class ErpAccountsController {
  constructor(
    private readonly erpAccountsService: ErpAccountsService,
  ) { }

  /**
   * Creates new Account Doc in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {ErpAccountDto} erpAccountDto
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiBody({ type: ErpAccountDto })
  @ApiCreatedResponse({ description: "Account created", type: ErpAccountResult })
  @Post()
  async create(@Tenant() tenant: TenantDoc, @Body() erpAccountDto: ErpAccountDto) {
    return ApiResult.success(await this.erpAccountsService.create(erpAccountDto, tenant.tenantId));
  }

  /**
   * Finds an existing Account Doc in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} externalId
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiParam({ name: "id", type: String })
  @ApiNoContentResponse({ description: "Entity Not found" })
  @ApiOkResponse({ description: "Object found", type: ErpAccountDto })
  @Get(':domain/:id')
  async findOne(@Tenant() tenant: TenantDoc, @Param('domain') domain: string, @Param('id') externalId: string) {
    return ApiResult.success(await this.erpAccountsService.findOne(tenant.tenantId, externalId, domain));
  }

  /**
   * Finds all existing Account Docs in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} domain
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiOkResponse({ description: "Objects found", type: ErpAccountDto })
  @Get(':domain')
  async find(@Tenant() tenant: TenantDoc, @Param('domain') domain: string) {
    return ApiResult.success(await this.erpAccountsService.findAll(tenant.tenantId, domain));
  }

  /**
   * Finds and updates existing Account Docs in ERP Objects Cache
   *
   * @param {TenantDoc} tenant
   * @param {string} externalId
   * @param {UpdateErpAccountDto} erpAccountDto
   * @returns {AsyncApiResult<ErpObject>}
   */
  @ApiBody({ type: UpdateErpAccountDto })
  @ApiParam({ name: "domain", type: String, enum: domains })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "Success" })
  @Patch(':domain/:id')
  async update(@Tenant() tenant: TenantDoc, @Param('domain') domain: string, @Param('id') externalId: string, @Body() erpAccountDto: UpdateErpAccountDto) {
    return ApiResult.success(await this.erpAccountsService.update(tenant.tenantId, externalId, domain, erpAccountDto));
  }

  /**
   * Finds and removes a Account Docs in ERP Objects Cache
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
    return ApiResult.success(await this.erpAccountsService.remove(tenant.tenantId, externalId, domain));
  }
}
