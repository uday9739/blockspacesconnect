import { TwoFactorAuthConfigurationDto, TwoFactorConfigResultDto } from '@blockspaces/shared/dtos/authentication/two-factor-auth-configuration';
import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { DEFAULT_LOGGER_TOKEN } from '../../logging/constants';
import { AllowAnonymous } from '../decorators/AllowAnonymous.decorator';
import { ConnectLogger } from "../../logging/ConnectLogger";
import ApiResult from '@blockspaces/shared/models/ApiResult';
import { TwoFactorAuthService } from "../services/TwoFactorAuthService";
import { TwoFactorAuthJwtGuard } from "../guards/TwoFactorAuthJwtGuard";
import { AdminOnly } from '../decorators/AdminOnly.decorator';
import { IRequestUserTwoFactorStatusReset } from '../types';

@Controller("auth/2fa")
@AllowAnonymous()
export class TwoFactorAuthController {
  constructor(
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly twoFactorAuthService: TwoFactorAuthService

  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Creates a TOTP key and returns a configuration result back to the caller.
   */
  @Post("configure")
  @UseGuards(TwoFactorAuthJwtGuard)
  async twoFactorAuthConfiguration(
    @Body() dto: TwoFactorAuthConfigurationDto,
  ): Promise<ApiResult<TwoFactorConfigResultDto>> {
    const result = await this.twoFactorAuthService.get2FAConfiguration(dto.email, dto.password);
    if (result.success) {
      return ApiResult.success(result);
    } else {
      return ApiResult.failure(result.failureReason, result);
    }
  }

  /**
   * Admin only endpoint to reset user 2fa status
   */
  @Post("resetUserTwoFactorStatus")
  @AdminOnly()
  async resetUserTwoFactorStatus(@Body() model: IRequestUserTwoFactorStatusReset) {
    const result = await this.twoFactorAuthService.setTwoFactorAsPendingForUser(model.email);
    if (result.isSuccess) {
      return ApiResult.success(result.data);
    } else {
      return ApiResult.failure(result.message);
    }
  }

}

