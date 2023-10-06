import { UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { Injectable } from "@nestjs/common";
import { UserDataService } from "../../users/services/UserDataService";
import { UserRegistrationData } from "../types";
import { BaseRegistrationStep, StepExecutionResult } from "./BaseRegistrationStep";

/**
 * Creates a new unregistered Connect platform user, based on user-provided registration data.
 *
 * This step will fail if a registered user is found with the same email address.
 */
@Injectable()
export class CreateUnregisteredUser extends BaseRegistrationStep {

  constructor(private readonly userDataService: UserDataService) {
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

    if (userDoc.registered !== false) {
      // this ensures that documents with no "registered" property (registered === undefined)
      // will be treated the same as if registered were === true
      return StepExecutionResult.failure(UserRegistrationFailureReason.ALREADY_REGISTERED);
    }

    const updatedRegistrationData: UserRegistrationData = { ...registrationData, user: userDoc };
    return StepExecutionResult.success(updatedRegistrationData);
  }

}