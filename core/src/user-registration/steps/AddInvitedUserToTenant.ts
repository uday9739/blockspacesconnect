import { InviteUserRegistrationDto, UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
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
export class AddInvitedUserToTenant extends BaseRegistrationStep {

  constructor(private readonly tenantService: TenantService) {
    super();
  }

  protected async execute(registrationData: UserRegistrationData): Promise<StepExecutionResult> {

    if (!registrationData?.user) {
      throw new Error("A user document was not provided");
    }

    const formData: InviteUserRegistrationDto = registrationData.formData;
    if (!formData.tenantId) {
      throw new Error("An inviting tenant ID was not provided");
    }

    try {
      await this.tenantService.addInvitedUserToTenant(formData.tenantId, formData.email, registrationData.user.id)
    } catch (error) {
      return StepExecutionResult.failure(UserRegistrationFailureReason.ADD_INVITED_USER_TO_TENANT_FAILED)
    }

    return StepExecutionResult.success(registrationData);
  }

}