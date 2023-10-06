import { QuickUserRegistrationDto, UserRegistrationDto, UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { Inject, Injectable } from "@nestjs/common";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { AppIdService } from "../../app-id";
import { AppIdRegistrationResult } from "../../app-id/models";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { UserRegistrationData } from "../types";
import { BaseRegistrationStep, StepExecutionResult } from "./BaseRegistrationStep";

/**
 * This registration step that will register the user with IBM App ID, if they were not registered previously
 *
 * If the user is already registered in App ID, no further action will be taken
 */
@Injectable()
export class RegisterWithAppId extends BaseRegistrationStep {

  constructor(
    private readonly appIdService: AppIdService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
  ) {
    logger.setModule(RegisterWithAppId.name);
    super();
  }

  protected async execute(registrationData: UserRegistrationData): Promise<StepExecutionResult> {

    if (!registrationData?.formData) {
      throw new Error("no form data was provided");
    }

    const user = registrationData.user;
    const { email, password } = <UserRegistrationDto | QuickUserRegistrationDto>registrationData.formData;

    // const { user, formData: { email, password } } = registrationData;

    if (!user) {
      throw new Error("no user document was provided");
    }

    if (!email || !password) {
      throw new Error("no email or password were provided");
    }

    const appIdResult: AppIdRegistrationResult = await this.appIdService.registerNewUser(email, password);

    if (appIdResult.status !== ApiResultStatus.Success) {
      this.logger.error("App ID user registration failed", null, appIdResult.message + " :: " + email);

      return StepExecutionResult.failure(UserRegistrationFailureReason.APP_ID_ERROR);
    }

    // Do we need to handle inactive users in App ID (active === false)???

    const appIdUserData = appIdResult.data;
    user.id = appIdUserData.profileId;

    if (appIdUserData.attributes?.twofastatus) {
      user.twoFAStatus = appIdUserData.attributes.twofastatus;
    }

    registrationData.newAppId = appIdUserData.isNew;
    registrationData.user = await user.save();

    return StepExecutionResult.success(registrationData);
  }

}