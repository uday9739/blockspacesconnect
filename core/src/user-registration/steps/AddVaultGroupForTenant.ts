import { Injectable } from "@nestjs/common";
import { VaultService } from "../../vault";
import { UserRegistrationData } from "../types";
import { BaseRegistrationStep, StepExecutionResult } from "./BaseRegistrationStep";

/**
 * Adds Vault resources for the registering user's default tenant.
 *
 * This will typically include resources such as a Vault group, group alias,
 * and group security policy
 */
@Injectable()
export class AddVaultGroupForTenant extends BaseRegistrationStep {

  constructor(private readonly vaultService: VaultService) {
    super();
  }

  protected async execute(registrationData: UserRegistrationData): Promise<StepExecutionResult> {
    const tenant = registrationData?.defaultTenant;

    if (!tenant?.tenantId) {
      throw new Error("no tenant was available");
    }

    await this.vaultService.addTenantToVault(tenant.tenantId);

    return StepExecutionResult.success(registrationData);
  }
}