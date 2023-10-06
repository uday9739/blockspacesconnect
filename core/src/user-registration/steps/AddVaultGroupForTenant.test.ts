import { UserRegistrationDto } from "@blockspaces/shared/dtos/users";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { Tenant } from "@blockspaces/shared/models/tenants";
import { HydratedDocument } from "mongoose";
import { createMock } from "ts-auto-mock";
import { VaultService } from "../../vault";
import { UserRegistrationData } from "../types";
import { AddVaultGroupForTenant } from "./AddVaultGroupForTenant";

describe(AddVaultGroupForTenant, () => {

  let mocks: {
    vaultService: VaultService
  };

  let registrationData: UserRegistrationData;
  let step: AddVaultGroupForTenant;

  beforeEach(() => {
    mocks = {
      vaultService: createMock<VaultService>()
    };

    registrationData = {
      formData: createMock<UserRegistrationDto>({ email: "joe@shmo.com", password: "abcd1234" }),
      defaultTenant: createMock<HydratedDocument<Tenant>>({
        tenantId: "12345",
        save: async () => registrationData.defaultTenant
      })
    };

    step = new AddVaultGroupForTenant(mocks.vaultService);
  });

  it("should throw if no tenant is provided", async () => {
    registrationData.defaultTenant.tenantId = "";
    expect(() => step.run(registrationData)).rejects.toThrow();
  });

  it("should return a success result if there are no errors", async () => {
    const result = await step.run(registrationData);
    expect(result.success).toBe(true);
  });

  it("should add vault resources based on the tenant's ID", async () => {
    let actualTenantId = "";

    mocks.vaultService.addTenantToVault = async (tenantId) => {
      actualTenantId = tenantId;
      return ApiResult.success();
    };

    await step.run(registrationData);

    expect(actualTenantId).toBe(registrationData.defaultTenant.tenantId);
  });
});