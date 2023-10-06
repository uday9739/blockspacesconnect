import { UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { Injectable } from "@nestjs/common";
import { CreateUnregisteredUser } from ".";
import { UserDataService } from "../../users/services/UserDataService";
import { UserRegistrationData } from "../types";
import { BaseRegistrationStep, StepExecutionResult } from "./BaseRegistrationStep";

/**
 * Creates a new unregistered Connect platform user, based on user-provided registration data.
 *
 * This step will fail if a registered user is found with the same email address.
 */
@Injectable()
export class CreateUnregisteredUserForInvitation extends BaseRegistrationStep {

  constructor(
    private readonly userDataService: UserDataService,
    private readonly createUnregisteredUser: CreateUnregisteredUser,
  ) {
    super();
  }

  protected async execute(registrationData: UserRegistrationData): Promise<StepExecutionResult> {
    const { formData } = registrationData;

    if (!formData?.email) {
      throw new Error("an email address is required");
    }

    let userDoc = await this.userDataService.findByEmailAsUnregisteredUser(formData.email);

    if (!userDoc) {
      userDoc = await this.userDataService.createUnregisteredUser(formData.toUnregisteredUser());
    }

    const updatedRegistrationData: UserRegistrationData = { ...registrationData, user: userDoc };
    return StepExecutionResult.success(updatedRegistrationData);
  }

}