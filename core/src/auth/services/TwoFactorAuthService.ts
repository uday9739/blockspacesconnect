import { Inject, Injectable } from "@nestjs/common";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { JwtService } from "../services/JwtService";
import { VaultService } from "../../vault";
import parseURI from "otpauth-uri-parser";
import { TwoFactorSetupStatus } from "@blockspaces/shared/models/users";
import ApiResult, { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { TwoFactorAuthConfigurationFailureReason } from "@blockspaces/shared/types/two-factor-auth-configuration";
import {
  TwoFactorConfigResultDto
} from "@blockspaces/shared/dtos/authentication/two-factor-auth-configuration";
import { UserDataService } from "../../users/services/UserDataService";
import { AppIdService } from "../../app-id";
import {
  TwoFactorLoginDto,
  TwoFactorLoginResultDto,
} from "@blockspaces/shared/dtos/authentication/two-factor-auth-login";
import { CookieOptions } from "express";
import { TwoFactorAuthLoginFailureReason } from "@blockspaces/shared/types/two-factor-auth-login";
import { TenantService } from "../../tenants";

@Injectable()
export class TwoFactorAuthService {

  constructor(
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly vaultService: VaultService,
    private readonly jwtService: JwtService,
    private readonly userDataService: UserDataService,
    private readonly tenantDataService: TenantService,
    private readonly appIdService: AppIdService
  ) {
    logger.setModule(this.constructor.name);
  }

  async setTwoFactorAsPendingForUser(email: string): Promise<ResetTwoFactorStatusResult> {

    // update app id
    const appIdResponse = await this.appIdService.updateTwoFactorStatusForUserByEmail(email, TwoFactorSetupStatus.Pending);

    // update user object to reflect change 
    const userResponse = await this.userDataService.getByEmail(email);
    const user = userResponse?.data;
    const updateUserResponse = await this.userDataService.update2FAStatus(user?.id, TwoFactorSetupStatus.Pending);

    if (appIdResponse.isSuccess && updateUserResponse.status === ApiResultStatus.Success) {
      return ResetTwoFactorStatusResult.success();
    }

    return ResetTwoFactorStatusResult.failure(appIdResponse.message || updateUserResponse.data.toString() || "Error updating 2FA Status");

  }

  get2FAConfiguration = async (email: string, password: string): Promise<TwoFactorConfigResultDto> => {

    const jwtResponse = await this.jwtService.getJwt(email, password);
    if (!jwtResponse.success) {
      return new TwoFactorConfigResultDto({
        failureReason: TwoFactorAuthConfigurationFailureReason.INVALID_CREDENTIALS
      });
    }
    const response = await this.vaultService.createTOTPKey("BlockSpaces Connect", jwtResponse.payload.sub);

    if (!(response.status === ApiResultStatus.Success)) {
      return new TwoFactorConfigResultDto({
        failureReason: TwoFactorAuthConfigurationFailureReason.FAILED_2FA_CONFIGURATION
      });
    }
    const parameters = parseURI(response.data.url);
    return new TwoFactorConfigResultDto({
      barcode: response.data.barcode,
      secret: parameters["query"]["secret"],
      url: response.data.url
    });
  };


  /**
   * @param dto 2 factor login request
   * @returns UserDetails or Error
   */
  login = async (dto: TwoFactorLoginDto): Promise<loginResult> => {
    /** JWT Payload Sub */
    let userId = "";

    this.logger.debug("Started Login...", null, { data: dto.email });
    const jwtResponse = await this.jwtService.getJwt(dto.email, dto.password);

    if (!(jwtResponse.payload && jwtResponse.payload.sub && jwtResponse.success)) {
      return { success: false, failureReason: TwoFactorAuthLoginFailureReason.UNAUTHORIZED_USER };
    }

    userId = jwtResponse.payload.sub;
    const validateTOTPCodeResponse = await this.vaultService.validateTOTPCode(dto.code, jwtResponse.payload.sub);

    if (!(validateTOTPCodeResponse.status === ApiResultStatus.Success && validateTOTPCodeResponse.data.valid === true)) {
      return { success: false, failureReason: TwoFactorAuthLoginFailureReason.INVALID_CODE };
    }

    const confirm2FAStatusResponse = await this.confirm2FAStatus(userId, jwtResponse.payload);
    const user = await this.userDataService.getUserById(userId);

    if (!confirm2FAStatusResponse.success || !user) {
      return { success: false, failureReason: TwoFactorAuthLoginFailureReason.USER_NOT_FOUND };
    }

    if (!user || user.registered === false) {
      return { success: false, failureReason: TwoFactorAuthLoginFailureReason.NOT_REGISTERED };
    }

    const tenant = await this.tenantDataService.findByTenantId(user.activeTenant?.tenantId || user.tenants[0]);
    if (!tenant) {
      return { success: false, failureReason: TwoFactorAuthLoginFailureReason.TENANT_NOT_FOUND }
    }

    this.logger.debug("Finished Login...", null, { data: dto.email });
    user.accessToken = jwtResponse.jwtEncoded;
    user.activeTenant = tenant;
    const data = new TwoFactorLoginResultDto({ userDetails: user });
    const expiration = jwtResponse.payload.exp ? new Date(jwtResponse.payload.exp * 1000) : undefined;
    return { success: true, data: data, tokenExpiration: expiration };

  };

  private confirm2FAStatus = async (userId: any, payload: any): Promise<{ success: boolean, failureReason?: string }> => {
    if (!payload.twofastatus) {
      return { success: false, failureReason: "User's identity is misconfigured, the 2FA flag is missing." };
    }

    if (payload.twofastatus === TwoFactorSetupStatus.Confirmed) {
      return { success: true };
    }

    if (payload.twofastatus === TwoFactorSetupStatus.Pending) {
      const update2FAStatusResponse = await this.appIdService.updateTwoFactorStatus(userId, TwoFactorSetupStatus.Confirmed);

      if (update2FAStatusResponse.status !== ApiResultStatus.Success) {
        return { success: false, failureReason: "Failed to update user's 2FA status." };
      }

      if (update2FAStatusResponse.status === ApiResultStatus.Success) {
        const userDataServiceStatus = await this.userDataService.update2FAStatus(userId);// Update 2FA Status
        if (userDataServiceStatus.status !== "success") {
          return { success: false, failureReason: "Failed to update user's 2FA database record." };
        }
        return { success: true };
      }
    }
  };

}
export class ResetTwoFactorStatusResult extends ApiResult<string>{ }

export interface get2FAConfigurationResult {
  success: boolean;
  data?: TwoFactorConfigResultDto;
  failureReason?: TwoFactorAuthConfigurationFailureReason;
}

export function getCookieOptions(requestUrl: string): CookieOptions {
  return {
    path: requestUrl.match(/\/[^\/]*/)[0],
    httpOnly: true,
    secure: true,
    sameSite: true,
  };
}

export interface loginResult {
  success: boolean;
  tokenExpiration?: Date;
  data?: TwoFactorLoginResultDto;
  failureReason?: TwoFactorAuthLoginFailureReason;
}
