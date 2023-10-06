import { TenantService } from "./TenantService";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { IUser, UnregisteredUser } from "@blockspaces/shared/models/users";
import { PolicyService } from "../../authorization";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { TenantMemberStatus, Tenant } from "@blockspaces/shared/models/tenants";
import { TenantMemberService } from ".";
import { TenantDto, TenantMemberProfileDto } from "@blockspaces/shared/dtos/tenants";

describe(TenantService, () => {

  let tenantService: TenantService;
  let mocks: {
    db: ConnectDbDataContext,
    policyService: PolicyService,
    tenantMemberService: TenantMemberService,
    logger: ConnectLogger,
    tenantDto: TenantDto,
  };

  beforeEach(() => {
    mocks = {
      db: createMock<ConnectDbDataContext>(),
      policyService: createMock<PolicyService>(),
      tenantMemberService: createMock<TenantMemberService>(),
      logger: createMock<ConnectLogger>(),
      tenantDto: createMock<TenantDto>()
    };

    tenantService = new TenantService(mocks.db, mocks.policyService, mocks.tenantMemberService, mocks.logger);
  });


  describe(TenantService.prototype.buildDefaultTenantObject, () => {

    it('should throw an error if no ID is available for user', () => {
      const user = createMock<UnregisteredUser>();

      expect(() => tenantService.buildDefaultTenantObject(user)).toThrow();
    });

    it('should use email as name, if available', () => {
      const user = createMock<UnregisteredUser>({
        id: "new-user-id",
        email: "joe@shmo.com"
      });

      const tenant = tenantService.buildDefaultTenantObject(user);
      expect(tenant.name).toBe(user.email);
    });

    it('should use user.id as name, if no email available', () => {
      const user = createMock<UnregisteredUser>({
        id: "new-user-id"
      });

      const tenant = tenantService.buildDefaultTenantObject(user);
      expect(tenant.name).toBe(user.id);
    });

    it('should add user to tenant as the owner', () => {
      const user = createMock<UnregisteredUser>({ id: "new-user-id" });
      const tenant = tenantService.buildDefaultTenantObject(user);

      expect(tenant.ownerId).toBe(user.id);
      expect(tenant.users).toEqual([{ email: "", memberStatus: "active", userId: user.id }]);
    });
  });

  describe(TenantService.prototype.createTenant, () => {
    it('Should throw an error when an error is generated creating a Tenant', async () => {
      mocks.db.tenants.create = jest.fn().mockRejectedValueOnce(new BadRequestException());
      const tenant = createMock<Tenant>()
      await expect(tenantService.createTenant(tenant)).rejects.toThrowError(BadRequestException)
    })

    it('Should fail finding the Owner in the User Collection', async () => {
      const tenantInDb = createMock<Tenant>();
      tenantInDb.ownerId = '1234';
      mocks.db.tenants.create = jest.fn().mockResolvedValueOnce(tenantInDb);
      mocks.db.users.findOne = jest.fn().mockResolvedValueOnce(null)

      const tenant = createMock<Tenant>();
      mocks.policyService.addPolicy = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      await expect(tenantService.createTenant(tenant)).rejects.toThrow(NotFoundException)
    })

    it('Should create a new tenant with read write policy', async () => {
      const tenantInDb = createMock<Tenant>();
      tenantInDb.ownerId = '1234';
      mocks.db.tenants.create = jest.fn().mockResolvedValueOnce(tenantInDb);
      const user = createMock<IUser>()
      mocks.db.users.findOne = jest.fn().mockResolvedValueOnce(user)
      mocks.db.users.findOneAndUpdate = jest.fn().mockResolvedValue(() => Promise.resolve())
      const tenant = createMock<Tenant>();
      mocks.policyService.addPolicy = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      await expect(tenantService.createTenant(tenant)).resolves.toEqual(tenantInDb)
    })

  })

  describe(TenantService.prototype.addInvitedUserToTenant, () => {
    it('Should throw an error when an error is generated finding a Tenant', async () => {
      mocks.db.tenants.findOne = jest.fn().mockRejectedValueOnce(new NotFoundException());
      const tenant = createMock<Tenant>()
      await expect(tenantService.addInvitedUserToTenant('', '', '')).rejects.toThrowError(NotFoundException)
    })

    it('Should add a new user to a tenant', async () => {
      const tenantInDb = createMock<Tenant>();
      mocks.db.tenants.findOne = jest.fn().mockResolvedValueOnce(tenantInDb);
      const tenant = createMock<Tenant>();
      mocks.db.tenants.findOneAndUpdate = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      await expect(tenantService.addInvitedUserToTenant('', '', '')).resolves.not.toThrowError()
    })

    it('Should add an existing user to a tenant', async () => {
      const tenantInDb = createMock<Tenant>();
      tenantInDb.users = [{ userId: '', email: '', memberStatus: TenantMemberStatus.INVITED }]
      mocks.db.tenants.findOne = jest.fn().mockResolvedValueOnce(tenantInDb);
      mocks.db.tenants.findOneAndUpdate = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      await expect(tenantService.addInvitedUserToTenant('', '', '')).resolves.not.toThrowError()
    })

  })

  describe(TenantService.prototype.acceptInvite, () => {
    it('Should throw an error when an error is generated finding a Tenant', async () => {
      mocks.db.tenants.findOne = jest.fn().mockRejectedValueOnce(new NotFoundException());
      const tenant = createMock<Tenant>()
      await expect(tenantService.acceptInvite('', '', '')).rejects.toThrowError(NotFoundException)
    })

    it('Should throw an error if user accepting invite is not found in tenant users invite list', async () => {
      const tenantInDb = createMock<Tenant>();
      mocks.db.tenants.findOne = jest.fn().mockResolvedValueOnce(tenantInDb);
      const tenant = createMock<Tenant>();
      // mocks.db.tenants.findOneAndUpdate = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      await expect(tenantService.acceptInvite('', '', '')).rejects.toThrowError(NotFoundException)
    })

    it('Should add an existing user to a tenant', async () => {
      const tenantInDb = createMock<Tenant>();
      tenantInDb.users = [{ userId: '', email: '', memberStatus: TenantMemberStatus.INVITED }]
      mocks.db.tenants.findOne = jest.fn().mockResolvedValueOnce(tenantInDb);
      mocks.db.tenants.findOneAndUpdate = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      await expect(tenantService.acceptInvite('', '', '')).resolves.not.toThrowError()
    })

  })

  describe(TenantService.prototype.removeUserFromTenant, () => {
    it('Should throw an error when an error is generated finding a Tenant', async () => {
      mocks.db.tenants.findOne = jest.fn().mockRejectedValueOnce(new NotFoundException());
      const tenant = createMock<Tenant>()
      await expect(tenantService.removeUserFromTenant('', '')).rejects.toThrowError(NotFoundException)
    })

    it('Should not update the database if user was not previously invited or a member', async () => {
      const tenantInDb = createMock<Tenant>();
      mocks.db.tenants.findOne = jest.fn().mockResolvedValueOnce(tenantInDb);
      const tenant = createMock<Tenant>();
      await tenantService.removeUserFromTenant('', '');
      expect(mocks.db.tenants.findOneAndUpdate).not.toBeCalled();
    })

    it('Should update a user who was previously invited or a member', async () => {
      const tenantInDb = createMock<Tenant>();
      mocks.db.tenants.findOne = jest.fn().mockResolvedValueOnce(tenantInDb);
      tenantInDb.users = [{ userId: '', email: '', memberStatus: TenantMemberStatus.ACTIVE }]
      mocks.db.tenants.findOne = jest.fn().mockResolvedValueOnce(tenantInDb);
      mocks.db.tenants.findOneAndUpdate = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      await tenantService.removeUserFromTenant('', '');
      expect(mocks.db.tenants.findOneAndUpdate).toBeCalledTimes(1);
    })

  })

  describe(TenantService.prototype.convertTenantToDto, () => {
    it('Should throw an error when an error is generated finding a Tenant member profile', async () => {
      const tenant = createMock<Tenant>()
      const user = createMock<IUser>({ id: '1234', email: 'c@c.com' })
      tenant.users = [{ userId: user.id, email: user.email, memberStatus: TenantMemberStatus.ACTIVE }]
      mocks.tenantMemberService.getTenantMemberProfile = jest.fn().mockRejectedValueOnce(new NotFoundException())
      await expect(tenantService.convertTenantToDto(tenant)).rejects.toThrowError(NotFoundException)
    })

    it('Should return successfully', async () => {
      const tenant = createMock<Tenant>()
      const user = createMock<IUser>({ id: '1234', email: 'c@c.com' })
      tenant.users = [{ userId: user.id, email: user.email, memberStatus: TenantMemberStatus.ACTIVE }]
      const tenantMemberProfile = createMock<TenantMemberProfileDto>({ email: user.email, firstName: '', lastName: '' });

      mocks.tenantMemberService.getTenantMemberProfile = jest.fn().mockResolvedValueOnce(tenantMemberProfile)
      await expect(tenantService.convertTenantToDto(tenant)).resolves.toEqual(TenantDto.fromTenant(tenant))
    })

    it('Should return successfully', async () => {
      const tenant = createMock<Tenant>()
      const user = createMock<IUser>({ email: 'c@c.com' })
      tenant.users = [{ email: user.email, memberStatus: TenantMemberStatus.ACTIVE }]
      const tenantMemberProfile = createMock<TenantMemberProfileDto>({ email: user.email, firstName: '', lastName: '' });

      // mocks.tenantMemberService.getTenantMemberProfile = jest.fn().mockResolvedValueOnce(tenantMemberProfile)
      await expect(tenantService.convertTenantToDto(tenant)).resolves.toEqual(TenantDto.fromTenant(tenant))
    })

    // it('Should not update the database if user was not previously invited or a member', async () => {
    //   const tenantInDb = createMock<Tenant>();
    //   mocks.db.tenants.findOne = jest.fn().mockResolvedValueOnce(tenantInDb);
    //   const tenant = createMock<Tenant>();
    //   await tenantService.removeUserFromTenant('', '');
    //   expect(mocks.db.tenants.findOneAndUpdate).not.toBeCalled();
    // })

    // it('Should update a user who was previously invited or a member', async () => {
    //   const tenantInDb = createMock<Tenant>();
    //   mocks.db.tenants.findOne = jest.fn().mockResolvedValueOnce(tenantInDb);
    //   tenantInDb.users = [{ userId: '', email: '', memberStatus: TenantMemberStatus.ACTIVE }]
    //   mocks.db.tenants.findOne = jest.fn().mockResolvedValueOnce(tenantInDb);
    //   mocks.db.tenants.findOneAndUpdate = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
    //   await tenantService.removeUserFromTenant('', '');
    //   expect(mocks.db.tenants.findOneAndUpdate).toBeCalledTimes(1);
    // })

  })



});
