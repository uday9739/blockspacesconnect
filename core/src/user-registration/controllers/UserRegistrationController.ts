import { UserRegistrationDto, UserRegistrationResultDto, QuickUserRegistrationDto, InviteUserRegistrationDto } from '@blockspaces/shared/dtos/users';
import ApiResult, { AsyncApiResult } from '@blockspaces/shared/models/ApiResult';
import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { AllowAnonymous } from '../../auth';
import { ValidRoute } from '../../validation';
import { UserRegistrationService } from '../services/UserRegistrationService';

// TODO change to /user/registration (once other controller is removed)
@Controller('user-registration')
export class UserRegistrationController {
  constructor(
    private readonly registrationService: UserRegistrationService
  ) { }

  /**
   * Register a user with the Connect platform
   *
   * @returns an ApiResult with a {@link UserRegistrationResultDto}, indicating the success or failure of registration
   * @throws HTTP 403 (Forbidden) if registration is unsuccessful; will include the ApiResult w/ registration result data
   */
  @Post()
  @AllowAnonymous()
  @ValidRoute()
  async register(@Body() formData: UserRegistrationDto): AsyncApiResult<UserRegistrationResultDto> {

    const registrationResult = await this.registrationService.register(formData);

    if (!registrationResult.success) {
      const apiResult = ApiResult.failure("The user registration process did not complete successfully", registrationResult);
      throw new ForbiddenException(apiResult);
    }

    return ApiResult.success(registrationResult);
  }

  @Post(`quick`)
  @AllowAnonymous()
  @ValidRoute()
  async quickRegister(@Body() formData: QuickUserRegistrationDto): AsyncApiResult<UserRegistrationResultDto> {

    const registrationResult = await this.registrationService.register(formData);

    if (!registrationResult.success) {
      const apiResult = ApiResult.failure("The user registration process did not complete successfully", registrationResult);
      throw new ForbiddenException(apiResult);
    }

    return ApiResult.success(registrationResult);
  }

  @Post(`invite`)
  @ValidRoute()
  async invite(@Body() formData: InviteUserRegistrationDto): AsyncApiResult<UserRegistrationResultDto> {

    const registrationResult = await this.registrationService.invite(formData);

    if (!registrationResult.success) {
      const apiResult = ApiResult.failure("The user registration process did not complete successfully", registrationResult);
      throw new ForbiddenException(apiResult);
    }

    return ApiResult.success(registrationResult);
  }

}