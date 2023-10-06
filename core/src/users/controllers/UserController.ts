import ApiResult, { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { IResetPassword, IUser } from "@blockspaces/shared/models/users";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Ip,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  UnauthorizedException, Req
} from "@nestjs/common";
import { AppIdService } from "../../app-id";
import { AllowAnonymous } from "../../auth";
import { BscStatusResponse } from "../../legacy/types/BscStatusResponse";
import { User } from "../decorators/User.decorator";
import { UserDataService } from "../services/UserDataService";
import { ConnectSubscriptionService } from "../../connect-subscription/services/ConnectSubscriptionService";
import { AppSettings } from "@blockspaces/shared/models/app-settings";
import { AdminOnly } from "../../auth/decorators/AdminOnly.decorator";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { JwtService } from "../../auth/services/JwtService";
import { Request, Response } from "express";
import CookieName from "@blockspaces/shared/models/CookieName";
@Controller("users")
export class UserController {
  constructor(
    private readonly userDataService: UserDataService,
    // TODO: replace usage of AppIdService with a more general "AuthService" that utilize AppId behind the scenes
    private readonly appIdService: AppIdService,
    private readonly connectSubscriptionService: ConnectSubscriptionService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,

  ) { }

  /** Returns the Current user UserDetails data */
  @Get("current")
  async getCurrentUser(@User() user: IUser, @Req() request: Request): Promise<ApiResult> {

    const userFromDb: IUser = await this.userDataService.getUserById(user.id);

    if (!user) {
      throw new NotFoundException("User was not found.");
    }
    return ApiResult.success(userFromDb);
  }

  // TODO: refactor "terms" related endpoints in to their own resource/controller (i.e. /users/terms)
  @Get("acceptToS")
  async acceptToS(@User() user: IUser) {
    const toS: BscStatusResponse = await this.userDataService.acceptToS(user.id);

    if (toS.status !== ApiResultStatus.Success) {
      throw new NotFoundException(toS.data?.toString() || "Term of Service acceptance was not updated.");
    }

    // ToS was accepted and successfully updated. Now, Is this the users first login?
    if (toS.data.firstLogin) {
      const setFirstLogin: BscStatusResponse = await this.userDataService.setFirstLogin(user.id);
      if (setFirstLogin.status === ApiResultStatus.Failed) {
        // ToS was a success but the FirstLogin flag failed to updated.
        return ApiResult.success(toS.data, setFirstLogin.data);
      }
    }

    return ApiResult.success(toS.data);
  }
  // TODO: move "forgot/reset password" endpoints to "auth" module (i.e. path like /auth/password-reset)
  /** Begin the password reset workflow */
  @Get("forgotPassword/:email")
  @AllowAnonymous()
  async forgotPassword(@Param("email") email: string) {
    await this.userDataService.forgotPassword(email);

    return ApiResult.success();
  }
  /** Confirm the AppId context is still valid */
  @Get("forgotPasswordConfirm/:context")
  @AllowAnonymous()
  async forgotPasswordConfirmResult(@Param("context") context: string) {
    const resetResponse: BscStatusResponse = await this.userDataService.forgotPasswordConfirmResult(context);
    if (resetResponse.status !== ApiResultStatus.Success) {
      throw new UnauthorizedException(resetResponse.data?.toString());
    }
    return ApiResult.success(resetResponse.data);
  }
  /** Change the users password in AppId */
  @Post("changePassword")
  @AllowAnonymous()
  async changePassword(@Body() resetDto: IResetPassword, @Ip() ip: string) {
    const resetResponse: BscStatusResponse = await this.userDataService.changePassword(resetDto, ip);
    if (resetResponse.status !== ApiResultStatus.Success) {
      throw new UnauthorizedException(resetResponse.data?.toString());
    }
    return ApiResult.success(resetResponse.data);
  }

  // TODO: move to "auth" module
  @Get("heartbeat")
  async heartbeat() {
    return ApiResult.success();
  }
  // TODO: move "email verification" endpoints to "auth" module
  /** Sends a verification email to a user with a given email address */
  @Post("verifyemail")
  @AllowAnonymous()
  async sendVerification(@Body("email") email: string) {

    const user: IUser = await this.userDataService.findByEmail(email);
    if (this.env.appId.enableEmailConfirmation === false && user.emailVerified === false) {
      await this.userDataService.sendEmailVerification(user);
    } else {
      const response = await this.appIdService.requestEmailVerification(email);
      if (response.status !== "success") {
        throw new BadRequestException("The server encountered an error while sending verification email.");
      }
    }
    return ApiResult.success(`Verification email has been sent to ${email}`);
  }

  // TODO: move welcome endpoints to "welcome" controller (i.e. /users/welcome)
  @Get("welcome")
  async getWelcome(@User() user: IUser) {
    const result = await this.userDataService.get(user.id);
    const userData = result?.data as IUser;

    if (result.status === ApiResultStatus.Failed) {
      throw new NotFoundException(`No user was found with id = ${user.id}`);
    }

    return ApiResult.success(Boolean(userData.viewedWelcome));
  }
  @Put("welcome")
  async setWelcome(@User() user: IUser): Promise<ApiResult> {
    return this.updateWelcome(user.id, true);
  }
  @Delete("welcome")
  async resetWelcome(@User() user: IUser): Promise<ApiResult> {
    return this.updateWelcome(user.id, false);
  }
  private async updateWelcome(userId: string, viewedWelcome: boolean) {
    const result = await this.userDataService.setViewedWelcome(userId, viewedWelcome);

    if (result.isFailure) {
      throw new NotFoundException(result.message);
    }

    return result;
  }

  @Put("settings")
  async updateAppSettings(@Body() setting: AppSettings, @User() user: IUser): Promise<ApiResult> {
    const result = await this.userDataService.update({ ...user, appSettings: { ...user.appSettings, ...setting } })
    if (result.status === ApiResultStatus.Failed) {
      throw new BadRequestException("COuld not update user app settings.")
    }
    return ApiResult.success(result.data)
  }

  @Patch("settings")
  async patchAppSettings(@Body() settings: AppSettings, @User() user: IUser): Promise<ApiResult> {
    const result = await this.userDataService.patchSettings(user, settings);
    if (result.status === ApiResultStatus.Failed) {
      throw new BadRequestException("COuld not update user app settings.")
    }
    return ApiResult.success(result.data)
  }

  @AdminOnly()
  @Post('set-feature-flag')
  async setUserFeatureFlag(@User() user: IUser, @Body("flagName") flagName: String) {
    const result = await this.userDataService.update({ ...user, featureFlags: { ...user.featureFlags, [flagName as string]: true } });
    if (result.status === ApiResultStatus.Failed) {
      throw new BadRequestException("Could not update user ");
    }
    return ApiResult.success(result.data);
  }


  @AdminOnly()
  @Post('set-status')
  async setUserStatus(@Body("userId") userId: string, @Body("accountLocked") accountLocked: boolean) {
    const user = await this.userDataService.findById(userId);
    const result = await this.userDataService.update({ ...user, accountLocked: accountLocked });
    if (result.status === ApiResultStatus.Failed) {
      throw new BadRequestException("Could not update user ");
    }
    return ApiResult.success(result.data);
  }


}
