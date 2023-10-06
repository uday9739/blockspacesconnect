import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_LOGGER_TOKEN } from '../../logging/constants';
import { ConnectLogger } from "../../logging/ConnectLogger";
import { ConnectDbDataContext } from '../../connect-db/services/ConnectDbDataContext';
import { TenantMemberStatus, Tenant, TenantStatus, TenantType } from '@blockspaces/shared/models/tenants';
import { Policy, PolicyPermission, PolicyResource, PolicyService } from '../../authorization';
import { TenantDto, TenantMemberDto, TenantMemberProfileDto } from '@blockspaces/shared/dtos/tenants';
import { IUser, UnregisteredUser } from '@blockspaces/shared/models/users';
import { v4 as uuid } from "uuid";
import { Notification } from '@blockspaces/shared/models/platform';
import { EnvironmentVariables, ENV_TOKEN } from '../../env';
import { InvitationService } from '../../notifications/services';
import { TenantService } from '.';
import { TenantRole } from '@blockspaces/shared/dtos/tenants';

@Injectable()
export class TenantMemberService {

  constructor(
    private readonly db: ConnectDbDataContext,
    private readonly policyService: PolicyService,
    private readonly invitationService: InvitationService,
    private readonly tenantService: TenantService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables
  ) {
    logger.setModule(this.constructor.name);
  }

  async getTenantMemberProfile(userId: string): Promise<TenantMemberProfileDto> {
    const user = await this.db.users.findOne({ id: userId });

    let memberUserProfile: TenantMemberProfileDto = null;

    if (user) {
      memberUserProfile = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } else {
      throw new NotFoundException(`Tenant Member user is not found ${userId}`);
    }

    return memberUserProfile;
  }

  /**
   * 
   * inviteUserToTenant - Invite a user by email to join an organization tenant
   * 
   * @param  {string} email
   * @param  {string} tenantId
   */
  async inviteUserToTenant(email: string, tenantId: string): Promise<void> {
    const user: IUser = await this.db.users.findOne({ email: email });
    const tenant: Tenant = await this.tenantService.findByTenantId(tenantId)
    if (!tenant) {
      throw new NotFoundException(`Invitor Tenant not found ${tenantId}`)
    }
    let newUser: UnregisteredUser = undefined;
    if (!user) {
      newUser = {
        email: email,
        id: uuid()
      }
      await this.db.unregisteredUsers.create(newUser);
    }
    const userId = newUser !== undefined ? newUser.id : user?.id

    //Note: had to re-use the cyclr.callbackBaseUrl because it has the correct value
    let invite: Notification = {
      user_id: userId,
      email_id: email,
      dynamic_email_data: {
        emailId: email,
        environment: `https://${this.env.cyclr.callbackBaseUrl}`,
        organization: tenant.name,
        newUser: newUser !== undefined,
      },
      dynamic_email_template_id: 'd-c58fa24e5b774c6abe9e1e453588d29b',
      title: `Invitation to Organization`,
      message: `You have been invited to join an organization, click here and accept the invitation.`,
      action_url: `/connect?modal=accept-organization-invitation&invitorTenantId=${tenantId}&invitorTenantName=${tenant.name}`
    }
    await this.invitationService.sendInvitation(invite)

    await this.tenantService.addInvitedUserToTenant(tenantId, email, userId)

    return;
  }

  /**
   * 
   * acceptInvite - when a user accepts the invite, their entry in the users array needs to be marked active
   * 
   * @param  {string} tenantId
   * @param  {string} email
   * @param  {string} userId
   * 
   * @returns 
   */
  async acceptInvite(tenantId: string, email: string, userId: string): Promise<void> {
    const tenant: Tenant = await this.tenantService.findByTenantId(tenantId)
    if (!tenant) {
      throw new NotFoundException(`Invitor Tenant not found ${tenantId}`)
    }
    const tenantIndex: number = tenant.users.findIndex((user) => user.email === email && user.memberStatus === TenantMemberStatus.INVITED);
    if (tenantIndex === -1) {
      throw new NotFoundException("User Invite not found")
    } else {
      tenant.users[tenantIndex] = { userId: userId, email: email, memberStatus: TenantMemberStatus.ACTIVE }
      await this.db.tenants.findOneAndUpdate({ tenantId: tenant.tenantId }, { $set: { users: tenant.users } })

    }

    const user: IUser = await this.db.users.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException(`User not found while accepting invite ${userId}`)
    }
    const userIndex: number = user.tenants.findIndex((tenant) => tenant === tenantId);
    if (userIndex === -1) {
      user.tenants.push(tenantId);
      await this.db.users.findOneAndUpdate({ id: userId }, { tenants: user.tenants })
    }

    await this.policyService.addUserToRoles(userId, tenantId, [TenantRole.TENANT_USER])

    return;
  }

  /**
   * 
   * removeUserFromTenant - If the Tenant/Organizaiton admin removes the user, mark their record in the users array as inactive
   * 
   * @param  {string} tenantId
   * @param  {string} userId
   * 
   * @returns 
   */
  async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
    const tenant: Tenant = await this.tenantService.findByTenantId(tenantId)
    if (!tenant) {
      throw new NotFoundException(`Invitor Tenant not found ${tenantId}`)
    }
    const tenantIndex: number = tenant.users.findIndex((user) => user.userId === userId);
    if (tenantIndex !== -1) {
      tenant.users[tenantIndex].memberStatus = TenantMemberStatus.INACTIVE;
      await this.db.tenants.findOneAndUpdate({ tenantId: tenant.tenantId }, { $set: { users: tenant.users } })
    }

    const user: IUser = await this.db.users.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException(`User not found while accepting invite ${userId}`)
    }
    const userIndex: number = user.tenants.findIndex((tenant) => tenant === tenantId);
    if (userIndex !== -1) {
      user.tenants = user.tenants.filter((tenant) => tenant !== tenantId);
      await this.db.users.findOneAndUpdate({ id: userId }, { tenants: user.tenants })
    }

    await this.policyService.removeUserFromAllRoles(userId, tenantId);

    return;
  }
}
