import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_LOGGER_TOKEN } from '../../logging/constants';
import { ConnectLogger } from "../../logging/ConnectLogger";
import { ConnectDbDataContext } from '../../connect-db/services/ConnectDbDataContext';
import { TenantMemberStatus, Tenant, TenantStatus, TenantType } from '@blockspaces/shared/models/tenants';
import { HydratedDocument } from 'mongoose';
import { IUser, UnregisteredUser } from '@blockspaces/shared/models/users';
import { v4 as uuid } from "uuid";
import { Policy, PolicyPermission, PolicyResource, PolicyService } from '../../authorization';
import { TenantDto, TenantMemberDto } from '@blockspaces/shared/dtos/tenants';
import { TenantMemberService } from '.';
import { TenantRole } from '@blockspaces/shared/dtos/tenants';

@Injectable()
export class TenantService {

  constructor(
    private readonly db: ConnectDbDataContext,
    private readonly policyService: PolicyService,
    @Inject(forwardRef(() => TenantMemberService)) private readonly tenantMemberService: TenantMemberService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Builds a tenant object for the given user, with default values.
   * This does not save any data to the database.
   *
   * @param user the user to build a default tenant object for
   * @throws if the user does not have an ID set
   */
  buildDefaultTenantObject(user: IUser | UnregisteredUser): Tenant {
    if (!user?.id) {
      throw new Error("user.id is required in order to build a default tenant");
    }

    return {
      tenantId: uuid(),
      name: user.email || user.id,
      ownerId: user.id,
      users: [{ userId: user.id, email: user.email, memberStatus: TenantMemberStatus.ACTIVE }],
      status: TenantStatus.ACTIVE,
      description: (user.firstName && user.lastName)
        ? `Default tenant for ${user.firstName} ${user.lastName}`
        : "Default tenant",
      tenantType: TenantType.PERSONAL,
      whmcsClientId: user.whmcs?.clientId
    };
  }

  /**
   * Creates a new tenant document from the given object, and returns the new document
   */
  createTenant = async (tenant: Tenant, createPolicies: boolean = true): Promise<HydratedDocument<Tenant>> => {
    const newTenant: Tenant = {
      tenantId: uuid(),   // sets tenantId, if it wasn't already set
      ...tenant
    };

    const tenantDoc = await this.db.tenants.create(newTenant);

    const user = await this.db.users.findOne({ id: tenantDoc.ownerId });
    if (!user) {
      throw new NotFoundException(`Tenant Owner not found - ${tenantDoc.ownerId}`)
    }
    user.tenants.push(newTenant.tenantId);
    await this.db.users.findOneAndUpdate({ id: tenantDoc.ownerId }, user)

    if (createPolicies && tenantDoc.ownerId) {
      const tenantReadPolicy: Policy = {
        roleId: TenantRole.TENANT_USER,
        tenantId: tenantDoc.tenantId,
        resource: PolicyResource.TENANT,
        permission: PolicyPermission.READ
      };

      const tenantWritePolicy: Policy = {
        ...tenantReadPolicy,
        roleId: TenantRole.TENANT_USER_ADMIN,
        permission: PolicyPermission.WRITE
      };

      const tenantMemberReadPolicy: Policy = {
        roleId: TenantRole.TENANT_USER,
        tenantId: tenantDoc.tenantId,
        resource: PolicyResource.TENANT_MEMBER,
        permission: PolicyPermission.READ
      };

      const tenantMemberWritePolicy: Policy = {
        ...tenantMemberReadPolicy,
        roleId: TenantRole.TENANT_USER_ADMIN,
        permission: PolicyPermission.WRITE
      };

      const tenantMemberPermissionsReadPolicy: Policy = {
        roleId: TenantRole.TENANT_USER_ADMIN,
        tenantId: tenantDoc.tenantId,
        resource: PolicyResource.TENANT_MEMEBER_PERMISSIONS,
        permission: PolicyPermission.READ
      };

      const tenantMemberPermissionsWritePolicy: Policy = {
        ...tenantMemberPermissionsReadPolicy,
        permission: PolicyPermission.WRITE
      };

      const paymentMethodPermissionsReadPolicy: Policy = {
        roleId: TenantRole.BILLING_ADMIN,
        tenantId: tenantDoc.tenantId,
        resource: PolicyResource.PAYMENT_METHOD,
        permission: PolicyPermission.READ
      };

      const paymentMethodPermissionsWritePolicy: Policy = {
        ...paymentMethodPermissionsReadPolicy,
        permission: PolicyPermission.WRITE
      };

      const invoicesPermissionsReadPolicy: Policy = {
        roleId: TenantRole.BILLING_ADMIN,
        tenantId: tenantDoc.tenantId,
        resource: PolicyResource.INVOICES,
        permission: PolicyPermission.READ
      };

      const invoicesPermissionsWritePolicy: Policy = {
        ...invoicesPermissionsReadPolicy,
        permission: PolicyPermission.WRITE
      };


      this.policyService.addPolicies([tenantReadPolicy, tenantWritePolicy, tenantMemberReadPolicy, tenantMemberPermissionsReadPolicy, tenantMemberWritePolicy, tenantMemberPermissionsWritePolicy, paymentMethodPermissionsReadPolicy, paymentMethodPermissionsWritePolicy, invoicesPermissionsReadPolicy, invoicesPermissionsWritePolicy]);
      this.policyService.addUserToRoles(tenantDoc.ownerId, tenantDoc.tenantId, [TenantRole.TENANT_USER, TenantRole.TENANT_USER_ADMIN, TenantRole.BILLING_ADMIN])
    }

    return tenantDoc;
  };

  /** Returns the tenant document matching the given TenantId, or null if no matching document is found */
  async findByTenantId(tenantId: string): Promise<HydratedDocument<Tenant>> {
    return await this.db.tenants.findOne({ tenantId });
  }

  /**
   * 
   * addInvitedUserToTenant - When a user is invited to join a tenant, need to add the user to the users array on the Tenant and mark as invited
   * 
   * @param  {string} tenantId
   * @param  {string} email
   * @param  {string} userId
   * 
   * @returns 
   */
  async addInvitedUserToTenant(tenantId: string, email: string, userId: string): Promise<void> {
    let tenant = await this.findByTenantId(tenantId);
    const tenantIndex: number = tenant.users.findIndex((user) => user.email === email);
    if (tenantIndex === -1) {
      tenant.users.push({ userId: userId, email: email, memberStatus: TenantMemberStatus.INVITED });
    } else {
      tenant.users[tenantIndex] = { userId: userId, email: email, memberStatus: TenantMemberStatus.INVITED }
    }
    await this.db.tenants.findOneAndUpdate({ tenantId: tenantId }, { $set: { users: tenant.users } })
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
    let tenant = await this.findByTenantId(tenantId);
    const tenantIndex: number = tenant.users.findIndex((user) => user.email === email);
    if (tenantIndex === -1) {
      throw new NotFoundException("User Invite not found")
    } else {
      tenant.users[tenantIndex] = { userId: userId, email: email, memberStatus: TenantMemberStatus.ACTIVE }
      await this.db.tenants.findOneAndUpdate({ tenantId: tenantId }, { $set: { users: tenant.users } })
    }
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
    let tenant = await this.findByTenantId(tenantId);
    const tenantIndex: number = tenant.users.findIndex((user) => user.userId === userId);
    if (tenantIndex !== -1) {
      tenant.users[tenantIndex].memberStatus = TenantMemberStatus.INACTIVE;
      await this.db.tenants.findOneAndUpdate({ tenantId: tenantId }, { $set: { users: tenant.users } })
    }
    return;
  }

  /**
   * 
   * converTenantToDto - converts a Tenant to a TenantDto
   * 
   * @param  {Tenant} - A core tenant object
   * 
   * @returns {TenantDto} - A tenant data transformation object
   */
  async convertTenantToDto(tenant: Tenant): Promise<TenantDto> {
    let newTenantDto = TenantDto.fromTenant(tenant);
    newTenantDto.members = await Promise.all(
      newTenantDto.members.map(async (member) => {
        if (member === null) return;
        if (member?.memberUserId) {
          member = TenantMemberDto.fromTenantUser(member.memberProfile.email, member.memberStatus, member.memberUserId)
          member.memberProfile = await this.tenantMemberService.getTenantMemberProfile(member.memberUserId);
          return member;
        } else {
          member = TenantMemberDto.fromTenantUser(member.memberProfile.email, member.memberStatus)
          return member;
        }
      })
    ).then((members) => {
      return members
    })
    return newTenantDto;
  }

}
