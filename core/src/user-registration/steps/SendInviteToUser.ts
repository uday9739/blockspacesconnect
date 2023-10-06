import { InviteUserRegistrationDto } from "@blockspaces/shared/dtos/users";
import { Tenant } from "@blockspaces/shared/models/tenants";
import { Injectable } from "@nestjs/common";
import { InvitationService } from "../../notifications/services";
import { TenantService } from "../../tenants";
import { UserRegistrationData } from "../types";
import { BaseRegistrationStep, StepExecutionResult } from "./BaseRegistrationStep";
import { Notification } from "@blockspaces/shared/models/platform";

/**
 * Registration step for creating a default tenant.
 * This step will be skipped if a default tenant has already been defined for the user
 */
@Injectable()
export class SendInviteToUser extends BaseRegistrationStep {

  constructor(
    private readonly invitationService: InvitationService,
    private readonly tenantService: TenantService,
  ) {
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

    console.log('will use the SendGrid service to send an email to the invited user', formData.email, formData.tenantId)
    const tenant = await this.tenantService.findByTenantId(formData.tenantId)
    let invite: Notification = {
      user_id: registrationData.user.id,
      email_id: formData.email,
      dynamic_email_data: {
        emailId: formData.email,
        environment: 'https://localhost',
        organization: tenant.name,
        newUser: registrationData.user.id === undefined,
      },
      dynamic_email_template_id: 'd-c58fa24e5b774c6abe9e1e453588d29b',
      title: `Invitation to Organization`,
      message: `You have been invited to join an organization, click here and accept the invitation.`,
      action_url: '/connect?modal=accept-organization-invitation'
    }
    this.invitationService.sendInvitation(invite)
    if (registrationData.user.id !== undefined) {
    }

    return StepExecutionResult.success(registrationData);
  }

}