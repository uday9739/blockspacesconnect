import { UserRegistrationDto, UserRegistrationResultDto, QuickUserRegistrationDto, InviteUserRegistrationDto } from "@blockspaces/shared/dtos/users";
import { Injectable } from "@nestjs/common";
import { UserRegistrationData } from "../types";
import { RegistrationStepProvider } from "./RegistrationStepProvider";
import { InvitationStepProvider } from "./InvitationStepProvider";

@Injectable()
export class UserRegistrationService {

  constructor(
    private readonly registrationStepProvider: RegistrationStepProvider,
    private readonly invitationStepProvider: InvitationStepProvider,
  ) {
  }

  /**
   * Registers a user with the BlockSpaces Connect platform.
   *
   * This process can be re-run for existing users, if registration was not previously completed.
   *
   * If a registration is attempted by, or for, a user that previously registered,
   * then this method will return gracefully with a "failed" result.
   *
   * @param userFormData the user-submitted form data
   * @returns a result DTO indicating the success, or failure, of the registration; if the registration failed, a reason will also be indicated
   */
  async register(userFormData: UserRegistrationDto | QuickUserRegistrationDto): Promise<UserRegistrationResultDto> {

    /*
      To Add a New Step to the Registration Process:
      =====

      1. Define the step class in the "steps" directory;
        a. it must extend the BaseRegistrationStep class
        b. it must use the @Injectable() decorator

      2. Add the new step class to the RegistrationStepProvider.OrderedSteps array, in the order in which it should be executed
    */

    let registrationData: UserRegistrationData = { formData: userFormData };

    const steps = this.registrationStepProvider.getSteps();

    for (const step of steps) {
      const stepResult = await step.run(registrationData);

      if (!stepResult.success) {
        return { success: false, failureReason: stepResult.failureReason };
      }

      registrationData = stepResult.registrationData;
    }

    return { success: true };
  }

  /**
 * Registers a user with the BlockSpaces Connect platform.
 *
 * This process can be re-run for existing users, if registration was not previously completed.
 *
 * If a registration is attempted by, or for, a user that previously registered,
 * then this method will return gracefully with a "failed" result.
 *
 * @param userFormData the user-submitted form data
 * @returns a result DTO indicating the success, or failure, of the registration; if the registration failed, a reason will also be indicated
 */
  async invite(userFormData: InviteUserRegistrationDto): Promise<UserRegistrationResultDto> {

    /*
      To Add a New Step to the Registration Process:
      =====

      1. Define the step class in the "steps" directory;
        a. it must extend the BaseRegistrationStep class
        b. it must use the @Injectable() decorator

      2. Add the new step class to the RegistrationStepProvider.OrderedSteps array, in the order in which it should be executed
    */

    let registrationData: UserRegistrationData = { formData: userFormData };

    const steps = this.invitationStepProvider.getSteps();

    for (const step of steps) {
      const stepResult = await step.run(registrationData);

      if (!stepResult.success) {
        return { success: false, failureReason: stepResult.failureReason };
      }

      registrationData = stepResult.registrationData;
    }

    return { success: true };
  }

}