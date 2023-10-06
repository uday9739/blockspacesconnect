import { InitialLoginDto, InitialLoginResultDto } from "@blockspaces/shared/dtos/authentication/initial-login";
import { AuthFailureReason } from "@blockspaces/shared/types/authentication";
import { BadRequestException, Body, Controller, Get, Inject, NotFoundException, Post, Req, Res, UnauthorizedException, UseGuards, Param } from "@nestjs/common";
import { returnErrorStatus } from "../../exceptions/utils";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { AllowAnonymous } from "../decorators/AllowAnonymous.decorator";
import { LoginService } from "../services/LoginService";
import { ConnectLogger } from "../../logging/ConnectLogger";
import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { HttpStatus } from "@blockspaces/shared/types/http";
import {
  TwoFactorLoginDto,
  TwoFactorLoginResultDto,
} from "@blockspaces/shared/dtos/authentication/two-factor-auth-login";
import { Request, Response } from "express";
import CookieName from "@blockspaces/shared/models/CookieName";
import { getCookieOptions, TwoFactorAuthService } from "../services/TwoFactorAuthService";
import { TwoFactorAuthLoginFailureReason } from "@blockspaces/shared/types/two-factor-auth-login";
import { JwtService } from "../services/JwtService";
import { TwoFactorAuthJwtGuard } from "../guards/TwoFactorAuthJwtGuard";
import { User } from "../../users";
import { IUser } from "@blockspaces/shared/models/users";
import { UserDataService } from "../../users/services/UserDataService";
import { TenantService } from "../../tenants";
import { TenantMemberStatus } from "@blockspaces/shared/models/tenants";


@Controller('auth')
export class AuthController {

  constructor(
    private readonly loginService: LoginService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly jwtService: JwtService,
    private readonly userDataService: UserDataService,
    private readonly tenantService: TenantService,
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Performs the initial authentication step, verifying a user's email and password, but not returning a JWT.
   *
   * - If email and password are valid, the result will indicate whether the user has setup two-factor authentication
   * - If the the user's email address has not been verified, HTTP 403 (forbidden) will be returned
   * - If the user's credentials are not valid, HTTP 401 (unauthorized) will be returned
   */
  @Post("initial")
  @AllowAnonymous()
  async initialLogin(
    @Body() dto: InitialLoginDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request
  ): Promise<ApiResult<InitialLoginResultDto>> {

    if (!dto || !dto.email || !dto.password) {
      throw new NotFoundException("No data was provided");
    }

    const result = await this.loginService.doInitialLogin(dto.email, dto.password);

    if (result.success) {
      const getJwtResponse = await this.jwtService.get2faJwt(result.jwtResult.payload.sub, dto.email);

      if (getJwtResponse.success === false) {
        returnErrorStatus(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ApiResult.failure(getJwtResponse.failureReason),
          { log: true }
        );
      }

      response.cookie(CookieName.TwoFactorConfigurationToken, getJwtResponse.jwtEncoded, {
        ...getCookieOptions(request.originalUrl), maxAge: 1000 * 60 * 4.999, signed: true
      }); // expires approximately at the same time the token expires

      this.logger.info(`Initial login successful for ${dto.email}`);
      return ApiResult.success(result.dto);
    }

    const errorMessage = `Initial login failed for ${dto.email} - ${result.failureReason}`;
    this.logger.error(errorMessage, null, { data: result });

    const resultDto =
      result.dto
      || new InitialLoginResultDto({ email: dto.email, failureReason: result.failureReason });

    if (result.failureReason === AuthFailureReason.EMAIL_NOT_VERIFIED) {
      returnErrorStatus(
        HttpStatus.FORBIDDEN,
        ApiResult.failure("Initial login failed", resultDto),
        { log: false }
      );
    }

    returnErrorStatus(
      HttpStatus.UNAUTHORIZED,
      ApiResult.failure("Initial login failed", resultDto),
      { log: false }
    );
  }

  /**
   * Login with credentials + two-factor authentication TOTP code
   *
   * @throws HTTP 401 (unauthorized) if credentials or 2FA code are invalid
   */
  @Post("login")
  @AllowAnonymous()
  @UseGuards(TwoFactorAuthJwtGuard)
  async login(
    @Body() dto: TwoFactorLoginDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ): Promise<ApiResult<TwoFactorLoginResultDto>> {

    if (!TwoFactorLoginDto.validateRequest(dto)) {
      returnErrorStatus(
        HttpStatus.BAD_REQUEST,
        ApiResult.failure(TwoFactorAuthLoginFailureReason.INVALID_REQUEST_BODY, new TwoFactorLoginResultDto({ failureReason: TwoFactorAuthLoginFailureReason.INVALID_REQUEST_BODY })),
        { log: false }
      );
    }

    const twoFactorAuthServiceRes = await this.twoFactorAuthService.login(dto);
    if (twoFactorAuthServiceRes.data?.userDetails?.accountLocked === true) {
      throw new UnauthorizedException("Account Locked");
    }

    if (!twoFactorAuthServiceRes.success) {
      returnErrorStatus(
        HttpStatus.UNAUTHORIZED,
        ApiResult.failure(twoFactorAuthServiceRes.failureReason, new TwoFactorLoginResultDto({ failureReason: twoFactorAuthServiceRes.failureReason })),
        { log: false }
      );
    }

    if (dto.cookie) {
      response.cookie(CookieName.AccessToken, twoFactorAuthServiceRes.data.userDetails.accessToken, {
        ...getCookieOptions(request.originalUrl), signed: true, expires: twoFactorAuthServiceRes.tokenExpiration
      });
    }

    const activeTenant = await this.tenantService.findByTenantId(twoFactorAuthServiceRes.data.userDetails.tenants[0]);
    if (activeTenant.users.some((tenantUser) => tenantUser.userId === twoFactorAuthServiceRes.data.userDetails.id && tenantUser.memberStatus === TenantMemberStatus.ACTIVE)) {
      response.cookie(CookieName.ActiveTenant, activeTenant, {
        ...getCookieOptions(request.originalUrl)
      });
    }


    // remove the temporary 2FA cookie on a successful login
    response.clearCookie(CookieName.TwoFactorConfigurationToken, getCookieOptions(request.originalUrl));

    return ApiResult.success(twoFactorAuthServiceRes.data);

  };

  /**
   * Before logging out the token is revoked for proper session management.
   * @param user Logged in user
   * @returns void
   */
  @Get("revoke-token")
  async revokeToken(@User() user: IUser): AsyncApiResult {
    if (!user) return ApiResult.failure()

    await this.jwtService.revokeJwt(user.accessToken)
    return ApiResult.success()
  }

  @Get("logout")
  @AllowAnonymous()
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @User() user: IUser
  ): AsyncApiResult {
    if (user) {
      this.logger.info(`Logging out user: ${user.email}`);
    }
    res.clearCookie(CookieName.AccessToken, getCookieOptions(req.originalUrl));
    return ApiResult.success(null, "User logged out successfully");
  }


  @Post("verify-email")
  @AllowAnonymous()
  async verifyEmail(@Body("token") token, @Body("userId") userId) {
    const results = await this.jwtService.verify2faJwt(token);

    if (results.success) {
      const tokenEmail = results.payload.email;
      const user = await this.userDataService.findById(userId);

      if (user.email !== tokenEmail) {
        throw new BadRequestException("Please request new email");
      }

      // mark email Verified
      user.emailVerified = true;

      await this.userDataService.update(user);

    } else {
      throw new BadRequestException("Please request new email");
    }

    return ApiResult.success(true);
  }

  @Post('set-active-tenant/:tenantId')
  async setActiveTenant(
    @User() user: IUser,
    @Param('tenantId') tenantId: string,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ): AsyncApiResult<void> {
    const activeTenant = await this.tenantService.findByTenantId(tenantId);
    if (activeTenant.users.some((tenantUser) => tenantUser.userId === user.id && tenantUser.memberStatus === TenantMemberStatus.ACTIVE)) {
      response.cookie(CookieName.ActiveTenant, activeTenant, {
        ...getCookieOptions(request.originalUrl)
      });
    }
    return ApiResult.success();
  }

}
