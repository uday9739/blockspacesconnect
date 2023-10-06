import { Injectable } from '@nestjs/common';
import { PolicyService } from '../../authorization';
import { TenantPermissionsDto, TenantPermission, TenantRole } from '@blockspaces/shared/dtos/tenants'
import { IUser } from '@blockspaces/shared/models/users';
import { ConnectDbDataContext } from '../../connect-db/services/ConnectDbDataContext';


@Injectable()
export class TenantPermissionsService {

  constructor(
    private readonly policyService: PolicyService,
    private readonly db: ConnectDbDataContext

  ) {
  }

  /**
   * 
   * getTenantMemberPermissions - Get's the permissions that a user has within the selected tenant
   * 
   * @param  {string} tenantId - the tenant id
   * @param  {string} userId - the user id
   * 
   * @returns {TenantPermissions}
   * 
   */
  async getTenantMemberPermissions(tenantId: string, userId: string): Promise<TenantPermissionsDto> {
    const allRoles = await this.policyService.getRoles();
    const rolesForUser = await this.policyService.getRolesForUser(userId, tenantId);
    const user: IUser = await this.db.users.findOne({ id: userId }, {}, { lean: true });

    const tenantPermissions: TenantPermissionsDto = {
      tenantId: tenantId,
      userId: userId,
      user: {
        userId: userId,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email
      },
      permissions: [],
    }
    tenantPermissions.permissions = allRoles.map((role) => {
      const tenantPermission: TenantPermission = {
        role: role as TenantRole,
        enabled: rolesForUser.includes(role)
      }
      return tenantPermission;
    })

    return tenantPermissions;
  }

  async updateTenantMemberPermission(tenantId: string, userId: string, role: TenantRole, enabled: boolean): Promise<void> {
    if (enabled === true) {
      await this.policyService.addUserToRoles(userId, tenantId, [role])
    } else {
      await this.policyService.removeUserFromRoles(userId, tenantId, [role])
    }
  }
}
