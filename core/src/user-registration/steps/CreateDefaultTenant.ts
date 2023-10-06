import { Tenant } from "@blockspaces/shared/models/tenants";
import { Injectable } from "@nestjs/common";
import { TenantService } from "../../tenants";
import { UserRegistrationData } from "../types";
import { BaseRegistrationStep, StepExecutionResult } from "./BaseRegistrationStep";

/**
 * Registration step for creating a default tenant.
 * This step will be skipped if a default tenant has already been defined for the user
 */
@Injectable()
export class CreateDefaultTenant extends BaseRegistrationStep {

  constructor(private readonly tenantService: TenantService) {
    super();
  }

  protected async execute(registrationData: UserRegistrationData): Promise<StepExecutionResult> {

    if (!registrationData?.user) {
      throw new Error("A user document was not provided");
    }

    // check for existing default tenant, using it if it exists
    if (registrationData.user.tenants?.length) {
      const tenantId = registrationData.user.activeTenant?.tenantId;
      const tenant = await this.tenantService.findByTenantId(tenantId);

      if (tenant) {
        registrationData.defaultTenant = tenant;
        return StepExecutionResult.success(registrationData);
      }
    }

    const newTenant: Tenant = this.tenantService.buildDefaultTenantObject(registrationData.user);

    registrationData.defaultTenant = await this.tenantService.createTenant(newTenant);

    return StepExecutionResult.success(registrationData);
  }

}