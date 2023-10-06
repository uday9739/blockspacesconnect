import { QuickUserRegistrationDto, UserRegistrationDto, UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { Injectable } from "@nestjs/common";
import e from "express";
import { FeatureFlagsService } from "../../feature-flags";
import { UserDataService } from "../../users/services/UserDataService";
import { GoogleRecaptcha } from "../services/GoogleRecaptcha";
import { UserRegistrationData } from "../types";
import { BaseRegistrationStep, StepExecutionResult } from "./BaseRegistrationStep";


@Injectable()
export class ValidateRecaptchaStep extends BaseRegistrationStep {

  constructor(private readonly googleRecaptcha: GoogleRecaptcha, public readonly featureFlagService: FeatureFlagsService) {
    super();
  }

  protected async execute(registrationData: UserRegistrationData): Promise<StepExecutionResult> {

    const systemFeatureFlags = await this.featureFlagService.getSystemFeatureFlagList();

    if (systemFeatureFlags.some(flag => flag.userRegistrationRecaptcha === true)) {
      const score = await this.googleRecaptcha.ValidateRecaptcha(registrationData.formData.token);
      (<any>registrationData.formData).gaScore = score;
      return StepExecutionResult.success(
        registrationData
      );
    } else {
      return StepExecutionResult.success(registrationData);
    }
  }

}