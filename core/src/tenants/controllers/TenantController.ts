import ApiResult, { AsyncApiResult } from '@blockspaces/shared/models/ApiResult';
import { TenantDto } from '@blockspaces/shared/dtos/tenants';
import { TenantMemberStatus, Tenant, TenantStatus, TenantType } from '@blockspaces/shared/models/tenants';
import { IUser } from '@blockspaces/shared/models/users';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TenantService } from '..';
import { ValidRoute } from '../../validation';
import { v4 as uuid } from "uuid";
import { TenantUser } from '../decorators';
import { TenantResourceGuard } from '../../authorization/guards/TenantResourceGuard';

@Controller('tenant')
@ValidRoute()
export class TenantController {

  constructor(
    private readonly tenantService: TenantService,
  ) { }

  /**
   * 
   * getTenantById - Get a tenant by the Tenant ID
   * 
   * @param  {string} tenantId
   * 
   * @returns {TenantDto} - The tenant
   */
  @Get(':tenantId')
  @UseGuards(TenantResourceGuard)
  async getTenantById(@Param('tenantId') tenantId: string): AsyncApiResult<TenantDto> {
    const tenant: Tenant = await this.tenantService.findByTenantId(tenantId);
    const dto: TenantDto = await this.tenantService.convertTenantToDto(tenant)
    return ApiResult.success(dto);
  }

  /**
   * 
   * getUsersTenants - Gets a list of the tenants that the logged in user belongs to
   * 
   * @returns {TenantDto[]} - The list of Tenants
   * 
   */
  @Get()
  async getUsersTenants(@TenantUser() user: IUser): AsyncApiResult<Array<TenantDto>> {
    return ApiResult.success(await Promise.all((user.tenants.map(async (tenantId) => {
      const tenant = await this.tenantService.findByTenantId(tenantId);
      const tenantDto = await this.tenantService.convertTenantToDto(tenant);
      return tenantDto;
    })))
      .then((results) => {
        return results;
      }));
  }

  /**
   * 
   * createOrganizationTenant - Creates a new organization tenant for the logged in user.
   * 
   * @param {Pick<TenantDto, "name" | "description">} - Name and description of a tenant
   * 
   * @returns {TenantDto} - The Tenant
   */
  @Post()
  async createOrganizationTenant(@TenantUser() user: IUser, @Body() tenant: Pick<TenantDto, "name" | "description">): AsyncApiResult<TenantDto> {
    const organizationTenant: Tenant = {
      tenantId: uuid(),
      name: tenant.name,
      ownerId: user.id,
      status: TenantStatus.ACTIVE,
      description: tenant.description,
      tenantType: TenantType.ORGANIZATION,
      users: [{
        userId: user.id,
        email: user.email,
        memberStatus: TenantMemberStatus.ACTIVE
      }]
    }
    const newTenant = await this.tenantService.createTenant(organizationTenant);
    const newTenantDto = await this.tenantService.convertTenantToDto(newTenant);
    return ApiResult.success(newTenantDto);
  }
}
