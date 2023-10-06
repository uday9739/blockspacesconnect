import { InviteUserRegistrationDto, QuickUserRegistrationDto, UserRegistrationDto, UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { Tenant } from "@blockspaces/shared/models/tenants";
import { IUser, UnregisteredUser } from "@blockspaces/shared/models/users";
import { NotFoundException } from "@nestjs/common";
import { HydratedDocument } from "mongoose";
import { createMock } from "ts-auto-mock";
import { AddInvitedUserToTenant, StepExecutionResult } from ".";
import { TenantService } from "../../tenants";
import { UserRegistrationData } from "../types";
import { CreateDefaultTenant } from "./CreateDefaultTenant";

describe(AddInvitedUserToTenant, () => {

  let mocks: {
    tenantService: TenantService
  };

  let registrationData: UserRegistrationData;
  let tenantDoc: HydratedDocument<Tenant>;
  let step: AddInvitedUserToTenant;

  beforeEach(() => {
    mocks = {
      tenantService: createMock<TenantService>()
    };

    tenantDoc = createMock<HydratedDocument<Tenant>>(createMock<Tenant>());

    registrationData = {
      formData: createMock<UserRegistrationDto>({ email: "joe@shmo.com", password: "abcd1234" }),
      user: createMock<HydratedDocument<UnregisteredUser>>({
        registered: false,
        save: async () => registrationData.user
      })
    };

    step = new AddInvitedUserToTenant(mocks.tenantService);
  });

  it('should throw an error if no user found', async () => {
    registrationData.user = undefined;
    await expect(step.run(registrationData)).rejects.toThrowError("A user document was not provided");
  })

  it('should throw error if no inviting tenant ID was populated', async () => {
    (<UserRegistrationDto | QuickUserRegistrationDto>registrationData.formData).inivtorTenantId = undefined;
    await expect(step.run(registrationData)).rejects.toThrowError("An inviting tenant ID was not provided");
  })

  it('should throw error if no inviting tenant ID was populated', async () => {
    (<InviteUserRegistrationDto>registrationData.formData).tenantId = undefined;
    await expect(step.run(registrationData)).rejects.toThrowError("An inviting tenant ID was not provided");
  })

  it('should return a failure when receiving an error from the tenant service', async () => {
    mocks.tenantService.addInvitedUserToTenant = jest.fn().mockRejectedValueOnce(new NotFoundException());
    (<InviteUserRegistrationDto>registrationData.formData).tenantId = '1234';
    await expect(step.run(registrationData)).resolves.toEqual(StepExecutionResult.failure(UserRegistrationFailureReason.ADD_INVITED_USER_TO_TENANT_FAILED))
  })

  it('should return a success', async () => {
    mocks.tenantService.addInvitedUserToTenant = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
    (<InviteUserRegistrationDto>registrationData.formData).tenantId = '1234';
    await expect(step.run(registrationData)).resolves.toEqual(StepExecutionResult.success(registrationData))
  })

});