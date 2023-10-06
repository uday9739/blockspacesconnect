import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { BadRequestException, Body, Controller, Delete, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ValidRoute } from "../../validation";
import { TenantMemberService } from "../services/TenantMemberService";
import { TenantResourceGuard } from "../../authorization/guards/TenantResourceGuard";
import { TenantUser } from "../decorators";
import { IUser } from "@blockspaces/shared/models/users";

@Controller('tenant-member')
@ValidRoute()
export class TenantMemberController {

  constructor(
    private readonly tenantMemberService: TenantMemberService,
  ) { }

  /**
   * 
   * invite - Invite a user to a tenant
   * 
   * @param  {string} body - {email:string} - the email to invite
   * @param  {string} tenantId - The tenant ID to invite the user to
   * 
   * @returns 
   * 
   */
  @Post(`:tenantId`)
  @UseGuards(TenantResourceGuard)
  async invite(@Body() body: { email: string }, @Param('tenantId') tenantId: string): AsyncApiResult<void> {
    await this.tenantMemberService.inviteUserToTenant(body.email, tenantId);
    return ApiResult.success();
  }

  /**
   * 
   * removeTenantMember - Removes a member from the tenant
   * 
   * @param  {string} tenantId - the tenant id from which to remove the user from
   * @param  {string} userId - the user id to remove
   * 
   * @returns 
   * 
   */
  @Delete(':tenantId/:userId')
  @UseGuards(TenantResourceGuard)
  async removeTenantMember(@Param('tenantId') tenantId: string, @Param('userId') userId: string): AsyncApiResult<void> {
    await this.tenantMemberService.removeUserFromTenant(tenantId, userId)
    return ApiResult.success();
  }

  /**
   * 
   * updateInvitation - updates an invitation as accepted 
   * 
   * @param  {string} tenantId - the tenant that is accepting the invitation from
   * @param  {IUser} user - the logged in user
   * @param  {string} acceptInvite - a query parameter that is either true or false (converted to a boolean)
   * 
   * @returns 
   * 
   */
  @Patch(':tenantId')
  async updateInvitation(@Param('tenantId') tenantId: string, @TenantUser() user: IUser, @Query('acceptInvite') acceptInvite: string): AsyncApiResult<void> {
    if (!tenantId || tenantId === 'undefined') {
      throw new BadRequestException('Tenant Id not passed')
    }
    if (acceptInvite && acceptInvite === 'true') {
      this.tenantMemberService.acceptInvite(tenantId, user.email, user.id)
    }
    return ApiResult.success();
  }

}