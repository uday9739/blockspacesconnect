import { UserRegistrationDto } from "@blockspaces/shared/dtos/users";
import { Tenant } from "@blockspaces/shared/models/tenants";
import { UnregisteredUser } from "@blockspaces/shared/models/users";
import { HydratedDocument } from "mongoose";
import { createMock } from "ts-auto-mock";
import { TenantService } from "../../tenants";
import { UserRegistrationData } from "../types";
import { CreateDefaultTenant } from "./CreateDefaultTenant";

describe(CreateDefaultTenant, () => {

  let mocks: {
    tenantService: TenantService
  };

  let registrationData: UserRegistrationData;
  let tenantDoc: HydratedDocument<Tenant>;
  let step: CreateDefaultTenant;

  beforeEach(() => {
    mocks = {
      tenantService: createMock<TenantService>()
    };

    tenantDoc = createMock<HydratedDocument<Tenant>>();

    registrationData = {
      formData: createMock<UserRegistrationDto>({ email: "joe@shmo.com", password: "abcd1234" }),
      user: createMock<HydratedDocument<UnregisteredUser>>({
        registered: false,
        save: async () => registrationData.user
      })
    };

    step = new CreateDefaultTenant(mocks.tenantService);
  });

  it("should use existing default tenant, if defined", async () => {
    const { user } = registrationData;
    const tenantId = "12345";
    user.tenants = [tenantId];

    mocks.tenantService.findByTenantId = async () => tenantDoc;

    const stepResult = await step.run(registrationData);
    expect(stepResult.success).toBe(true);
    expect(stepResult.registrationData.defaultTenant).toBe(tenantDoc);
  });

  it('should add default tenant, if it does not already exist', async () => {
    registrationData.user.tenants = [];

    mocks.tenantService.createTenant = async () => tenantDoc;

    const stepResult = await step.run(registrationData);
    const resultData = stepResult.registrationData;

    expect(stepResult.success).toBe(true);
    expect(resultData.defaultTenant).toBe(tenantDoc);
  });

  it('should store TenantId from default tenant on user document', async () => {
    registrationData.user.tenants = [];
    const newTenant: Tenant = createMock<Tenant>({ tenantId: "new-tenant-id" });

    mocks.tenantService.buildDefaultTenantObject = () => newTenant;
    mocks.tenantService.createTenant = async () => tenantDoc;
    registrationData.user.tenants = [newTenant.tenantId]

    const stepResult = await step.run(registrationData);

    expect(stepResult.registrationData.user.tenants).toEqual([newTenant.tenantId]);
  });
});