import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ValidRoute } from "../../validation";
import { Tenant, TenantUser } from "../decorators";
import { TenantPermissionsService } from "../services";
import { TenantResourceGuard } from "../../authorization/guards/TenantResourceGuard";
import { Tenant as ITenant } from "@blockspaces/shared/models/tenants";
import { TenantPermissionsDto, TenantRole } from "@blockspaces/shared/dtos/tenants";
import { IUser } from "@blockspaces/shared/models/users";

@Controller('tenant-member-permissions')
@ValidRoute()
export class TenantPermissionsController {

  constructor(
    private readonly tenantPermissionsService: TenantPermissionsService,
  ) { }

  /**
   * 
   * getTenantMemberPermissions - Gets a set of permissions for the specified userId within the active tenant
   * 
   * @param {string} userId - The user Id to retrieve
   * 
   * @returns {TenantPermissions} - The object containing the user's permissions
   * 
   */
  @Get(':userId')
  @UseGuards(TenantResourceGuard)
  async getTenantMemberPermissions(@TenantUser() user: IUser, @Param('userId') userId: string): AsyncApiResult<TenantPermissionsDto> {
    const permissions = await this.tenantPermissionsService.getTenantMemberPermissions(user.activeTenant?.tenantId, userId);
    return ApiResult.success(permissions);
  }

  @Patch(':userId')
  @UseGuards(TenantResourceGuard)
  async updateTenantMemberPermissions(@TenantUser() user: IUser, @Param('userId') userId: string, @Body() body: { role: TenantRole, enabled: boolean }): AsyncApiResult<void> {
    await this.tenantPermissionsService.updateTenantMemberPermission(user.activeTenant?.tenantId, userId, body.role, body.enabled)
    return ApiResult.success();
  }

}