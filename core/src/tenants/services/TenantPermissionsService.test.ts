import { createMock } from "ts-auto-mock";
import { PolicyService } from "../../authorization";
import { TenantPermissionsService } from "./TenantPermissionsService";
import { TenantPermissionsDto, TenantPermission, TenantRole } from '@blockspaces/shared/dtos/tenants'
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { IUser } from "@blockspaces/shared/models/users";
let tenantPermissionsService: TenantPermissionsService;
let mocks: {
  db: ConnectDbDataContext,
  policyService: PolicyService,
};

beforeEach(() => {
  mocks = {
    db: createMock<ConnectDbDataContext>(),
    policyService: createMock<PolicyService>(),
  };

  tenantPermissionsService = new TenantPermissionsService(mocks.policyService, mocks.db);
});


describe(TenantPermissionsService, () => {
  describe(TenantPermissionsService.prototype.getTenantMemberPermissions, () => {
    it('should succeed', async () => {
      const allRoles = [TenantRole.TENANT_USER, TenantRole.TENANT_USER_ADMIN];
      const rolesForUser = [TenantRole.TENANT_USER];
      const user = createMock<IUser>();
      mocks.policyService.getRoles = jest.fn().mockResolvedValueOnce(allRoles);
      mocks.policyService.getRolesForUser = jest.fn().mockResolvedValueOnce(rolesForUser);
      mocks.db.users.findOne = jest.fn().mockResolvedValueOnce(user);
      const tenantPermissions = createMock<TenantPermissionsDto>();
      tenantPermissions.permissions = [createMock<TenantPermission>({
        role: TenantRole.TENANT_USER,
        enabled: true,
      },
      ),
      createMock<TenantPermission>({
        role: TenantRole.TENANT_USER_ADMIN,
        enabled: false,
      },
      )
      ]
      tenantPermissions.user = {
        userId: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
      }
      await expect(tenantPermissionsService.getTenantMemberPermissions('', '')).resolves.toEqual(tenantPermissions)

    })
  })
})