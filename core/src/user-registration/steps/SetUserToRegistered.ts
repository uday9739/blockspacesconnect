import { QuickUserRegistrationDto, UserRegistrationDto, UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { getDefaultAppSettings } from "@blockspaces/shared/models/app-settings";
import { Inject, Injectable } from "@nestjs/common";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { TenantService, TenantMemberService } from "../../tenants";
import { UserDataService } from "../../users/services/UserDataService";
import { UserRegistrationData } from "../types";
import { BaseRegistrationStep, StepExecutionResult } from "./BaseRegistrationStep";

@Injectable()
export class SetUserToRegistered extends BaseRegistrationStep {

  constructor(
    private readonly db: ConnectDbDataContext,
    private readonly tenantService: TenantService,
    private readonly tenantMemberService: TenantMemberService,
    private readonly userDataService: UserDataService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
  ) {
    super();
  }

  protected async execute(registrationData: UserRegistrationData): Promise<StepExecutionResult> {
    const requireEmailVerification = this.env.isProduction || this.env.isStaging;
    const filter = { email: registrationData.formData.email }; // findOne search params

    const updatedUser = await this.db.users.findOne(filter);
    if (!updatedUser) {
      return StepExecutionResult.failure(UserRegistrationFailureReason.FINAL_VALIDATION_AND_SAVE);
    }

    updatedUser.emailVerified = !requireEmailVerification;
    updatedUser.appSettings = getDefaultAppSettings();
    updatedUser.registered = true;
    updatedUser.appSettings.bip.displayFiat = false;
    updatedUser.viewedWelcome = true;// https://blockspaces.atlassian.net/browse/BSPLT-2471

    // If the user is accepting an invite
    if ((<UserRegistrationDto | QuickUserRegistrationDto>registrationData.formData).acceptInvite) {
      const invitorTenantId = (<UserRegistrationDto | QuickUserRegistrationDto>registrationData.formData).inivtorTenantId;
      const alreadyMember = await updatedUser.tenants.findIndex((tenantId) => tenantId === invitorTenantId) !== -1;
      if (!alreadyMember) {
        const invitorTenant = await this.tenantService.findByTenantId(invitorTenantId)
        await this.tenantMemberService.acceptInvite(
          invitorTenant.tenantId,
          updatedUser.email,
          updatedUser.id
        );
        updatedUser.tenants.push((<UserRegistrationDto | QuickUserRegistrationDto>registrationData.formData).inivtorTenantId);
      }
    }

    await updatedUser.save();

    if (requireEmailVerification) {
      await this.userDataService.sendEmailVerification(updatedUser);
    }


    return StepExecutionResult.success(registrationData);
  }
}