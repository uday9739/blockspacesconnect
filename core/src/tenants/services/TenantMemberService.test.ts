import { TenantMemberService } from "./TenantMemberService";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { IUser, UnregisteredUser } from "@blockspaces/shared/models/users";
import { PolicyService } from "../../authorization";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { TenantMemberStatus, Tenant } from "@blockspaces/shared/models/tenants";
import { InvitationService } from "../../notifications/services";
import { TenantService } from ".";
import { EnvironmentVariables } from "../../env";
import { TenantMemberProfileDto } from "@blockspaces/shared/dtos/tenants";

describe(TenantMemberService, () => {

  let tenantMemberService: TenantMemberService;
  let mocks: {
    db: ConnectDbDataContext,
    policyService: PolicyService,
    invitatationService: InvitationService,
    tenantService: TenantService,
    logger: ConnectLogger,
    env: EnvironmentVariables,
  };

  beforeEach(() => {
    mocks = {
      db: createMock<ConnectDbDataContext>(),
      policyService: createMock<PolicyService>(),
      invitatationService: createMock<InvitationService>(),
      tenantService: createMock<TenantService>(),
      logger: createMock<ConnectLogger>(),
      env: createMock<EnvironmentVariables>(),
    };

    tenantMemberService = new TenantMemberService(mocks.db, mocks.policyService, mocks.invitatationService, mocks.tenantService, mocks.logger, mocks.env);
  });


  describe(TenantMemberService.prototype.getTenantMemberProfile, () => {

    it('should throw an error if the user is not found', async () => {
      mocks.db.users.findOne = jest.fn().mockResolvedValueOnce(null);

      await expect(tenantMemberService.getTenantMemberProfile('')).rejects.toThrowError(NotFoundException);
    });

    it('should return a tenant member profile', async () => {
      const user = createMock<IUser>();
      mocks.db.users.findOne = jest.fn().mockResolvedValueOnce(user);
      const tenantMemberProfile = createMock<TenantMemberProfileDto>(
        { email: '', firstName: '', lastName: '' }
      );

      await expect(tenantMemberService.getTenantMemberProfile('')).resolves.toEqual(tenantMemberProfile);
    });
  });

  describe(TenantMemberService.prototype.inviteUserToTenant, () => {

    it('should throw an error if the tenant is not found', async () => {
      const user = createMock<IUser>();
      mocks.db.users.findOne = jest.fn().mockResolvedValueOnce(user);
      mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(null);

      await expect(tenantMemberService.inviteUserToTenant('', '')).rejects.toThrowError(NotFoundException);
    });

    it('should create a new unregistered user if inviting a new user', async () => {
      const user = createMock<IUser>();
      mocks.db.users.findOne = jest.fn().mockResolvedValueOnce(null);
      let tenant = createMock<Tenant>({
        tenantId: '',
        name: '',
      });
      mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(tenant);
      mocks.db.unregisteredUsers.create = jest.fn().mockResolvedValueOnce(user)
      mocks.invitatationService.sendInvitation = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      mocks.tenantService.addInvitedUserToTenant = jest.fn().mockResolvedValueOnce(() => Promise.resolve())
      await expect(tenantMemberService.inviteUserToTenant('', '')).resolves.not.toThrowError();
      expect(mocks.db.unregisteredUsers.create).toBeCalledTimes(1);
    });

    it('should invite an existing user', async () => {
      const user = createMock<IUser>({
        id: '',
        email: ''
      });
      mocks.db.users.findOne = jest.fn().mockResolvedValueOnce(user);
      let tenant = createMock<Tenant>({
        tenantId: '',
        name: '',
      });
      mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(tenant);
      mocks.invitatationService.sendInvitation = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      mocks.tenantService.addInvitedUserToTenant = jest.fn().mockResolvedValueOnce(() => Promise.resolve())
      await expect(tenantMemberService.inviteUserToTenant('', '')).resolves.not.toThrowError();
      expect(mocks.db.unregisteredUsers.create).toBeCalledTimes(0);
    });
  });

  describe(TenantMemberService.prototype.acceptInvite, () => {
    it('should throw an error if the tenant is not found', async () => {
      mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(null);

      await expect(tenantMemberService.acceptInvite('', '', '')).rejects.toThrowError(NotFoundException);
    });

    it('should throw an error if the tenant is found, but the invited email is not', async () => {
      const tenant = createMock<Tenant>({
        users: [
          { email: '', memberStatus: TenantMemberStatus.INACTIVE }
        ]
      })
      mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(tenant);

      await expect(tenantMemberService.acceptInvite('', '', '')).rejects.toThrowError(NotFoundException);
    });

    it('should return successful', async () => {
      const tenant = createMock<Tenant>({
        users: [
          { email: '', memberStatus: TenantMemberStatus.INVITED }
        ]
      })
      mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(tenant);

      mocks.db.tenants.findOneAndUpdate = jest.fn().mockResolvedValueOnce(() => Promise.resolve())
      const user = createMock<IUser>();
      user.tenants = [
      ]
      mocks.db.users.findOne = jest.fn().mockResolvedValueOnce(user)
      mocks.db.users.findOneAndUpdate = jest.fn().mockResolvedValueOnce(() => Promise.resolve())

      mocks.policyService.addUserToRoles = jest.fn().mockResolvedValueOnce(true)
      await expect(tenantMemberService.acceptInvite('', '', '')).resolves.not.toThrowError();
    });

  });

  describe(TenantMemberService.prototype.removeUserFromTenant, () => {
    it('should throw an error if the tenant is not found', async () => {
      mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(null);

      await expect(tenantMemberService.removeUserFromTenant('', '')).rejects.toThrowError(NotFoundException);
    });

    it('should return successful', async () => {
      const tenant = createMock<Tenant>({
        users: [
          { email: '', userId: '', memberStatus: TenantMemberStatus.INACTIVE }
        ]
      })
      mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(tenant);
      mocks.db.tenants.findOneAndUpdate = jest.fn().mockResolvedValueOnce(() => Promise.resolve())
      const user = createMock<IUser>();
      user.tenants = [
        tenant.tenantId
      ]
      mocks.db.users.findOne = jest.fn().mockResolvedValueOnce(user)
      mocks.db.users.findOneAndUpdate = jest.fn().mockResolvedValueOnce(() => Promise.resolve())

      mocks.policyService.removeUserFromAllRoles = jest.fn().mockResolvedValueOnce(true)
      await expect(tenantMemberService.removeUserFromTenant('', '')).resolves.not.toThrowError();
    });
  });

});
