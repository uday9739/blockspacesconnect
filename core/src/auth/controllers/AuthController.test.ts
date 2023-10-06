import { InitialLoginDto, InitialLoginResultDto } from '@blockspaces/shared/dtos/authentication/initial-login';
import { Logger } from 'log4js';
import { AuthFailureReason } from '@blockspaces/shared/types/authentication';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { createMock } from 'ts-auto-mock';
import { LoginService } from '../services/LoginService';
import { AuthController } from './AuthController';
import ApiResult, { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { TwoFactorAuthService } from "../services/TwoFactorAuthService";
import { TwoFactorLoginDto, TwoFactorLoginResultDto } from "@blockspaces/shared/dtos/authentication/two-factor-auth-login";
import { Response, Request } from "express";
import { TwoFactorAuthLoginFailureReason } from "@blockspaces/shared/types/two-factor-auth-login";
import { Get2faJwtResult, JwtService } from "../services/JwtService";
import { IUser } from '@blockspaces/shared/models/users';
import { ConnectLogger } from '../../logging/ConnectLogger';
import { UserDataService } from '../../users/services/UserDataService';
import { TenantService } from '../../tenants';
import { Tenant, TenantMemberStatus } from '@blockspaces/shared/models/tenants';

describe(AuthController, () => {
  let controller: AuthController;
  let initialLoginDto = new InitialLoginDto();
  let mocks: {
    loginService: LoginService;
    logger: ConnectLogger;
    twoFactorAuthService: TwoFactorAuthService;
    jwtService: JwtService;
    res: Response;
    req: Request;
    userDataService: UserDataService;
    tenantService: TenantService;
  };
  const testDto = new TwoFactorLoginDto({
    email: "chris.tate+NI-1@blockspaces.com",
    password: "passw0rd",
    code: "213123",
    cookie: true
  });

  beforeEach(async () => {

    initialLoginDto.email = "joe@shmo.com";
    initialLoginDto.password = "abc123";

    const twoFactorJwtResult: Get2faJwtResult = {
      success: true,
      jwtEncoded: "jwt response",
      payload: {
        email: initialLoginDto.email,
        exp: 123
      }
    };

    mocks = {
      loginService: createMock<LoginService>(),
      logger: createMock<ConnectLogger>(),
      twoFactorAuthService: createMock<TwoFactorAuthService>(),
      jwtService: createMock<JwtService>({
        get2faJwt: async () => twoFactorJwtResult
      }),
      res: createMock<Response>({
        cookie: jest.fn().mockReturnValue({})
      }),
      req: createMock<Request>({
        originalUrl: "http://testurl"
      }),
      userDataService: createMock<UserDataService>(),
      tenantService: createMock<TenantService>(),
    };

    //mocks.res.cookie = jest.fn().mockImplementation((key, value) => { })
    //mocks.req.originalUrl = "http://testurl"
    mocks.jwtService.get2faJwt = jest.fn().mockResolvedValue({ success: true, jwtEncoded: "jwt response", payload: { exp: 123 } })

    controller = new AuthController(mocks.loginService, mocks.logger, mocks.twoFactorAuthService, mocks.jwtService, mocks.userDataService, mocks.tenantService);
  });

  it("should return a successful result when there are no errors", async () => {
    const expectedResult = new InitialLoginResultDto({
      email: initialLoginDto.email,
      twoFactorSetupComplete: true,
      userId: "123456"
    });
    mocks.loginService.doInitialLogin = jest.fn().mockResolvedValue({ success: true, dto: expectedResult, jwtResult: { payload: { sub: "test sub" } } });

    const actualResult = await controller.initialLogin(initialLoginDto, mocks.res, mocks.req);
    expect(actualResult.data).toBe(expectedResult);
  });

  it("should return 404 (not found) if no data is provided", async () => {
    const sampleData: InitialLoginDto[] = [undefined, { email: "foo@bar.com", password: undefined }, { email: undefined, password: "abc123" }];

    for (const data of sampleData) {
      await expect(controller.initialLogin(data, mocks.res, mocks.req)).rejects.toThrow(NotFoundException);
    }
  });

  it("should return 403 (forbidden, if user has not verified their email", async () => {
    const expectedFailureReason = AuthFailureReason.EMAIL_NOT_VERIFIED;

    mocks.loginService.doInitialLogin = async () => {
      return {
        success: false,
        failureReason: expectedFailureReason,
        dto: new InitialLoginResultDto({ failureReason: expectedFailureReason })
      };
    };

    try {
      await controller.initialLogin(initialLoginDto, mocks.res, mocks.req);
      expect(1).toBe(2);
    } catch (err) {
      const error = err as HttpException;
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);

      const errorData = err.getResponse() as ApiResult<InitialLoginResultDto>;
      expect(errorData.data.failureReason).toBe(expectedFailureReason);
    }
  });

  const failureReasonsBesidesEmailVerification = Object.values(AuthFailureReason).filter((x) => x !== AuthFailureReason.EMAIL_NOT_VERIFIED);

  it.each(failureReasonsBesidesEmailVerification)
    ('should return 401 (unauthorized) for authentication failures other than unverified email',
      async (expectedReason: AuthFailureReason) => {
        mocks.loginService.doInitialLogin = async () => {
          return {
            success: false,
            failureReason: expectedReason,
            dto: new InitialLoginResultDto({ failureReason: expectedReason })
          };
        };

        try {
          await controller.initialLogin(initialLoginDto, mocks.res, mocks.req);
          expect(1).toBe(2); // force failure if exception isn't thrown
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.UNAUTHORIZED)

          const errorData = err.getResponse() as ApiResult<InitialLoginResultDto>;
          expect(errorData.data.failureReason).toBe(expectedReason);
        }
      }
    );

  it("login should return successful result without cookie when there are no errors", async () => {
    mocks.twoFactorAuthService.login = jest.fn().mockResolvedValue({
      success: true,
      tokenExpiration: new Date(),
      data: new TwoFactorLoginResultDto({
        userDetails: createMock<IUser>()
      }),
    });
    const localTtestDto = testDto;
    localTtestDto.cookie = false; //set cookie flag false

    mocks.res.cookie = jest.fn().mockResolvedValue({});
    mocks.req.originalUrl = "https://testurl.com/getit";

    const tenant = createMock<Tenant>();
    mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(tenant);
    const response = await controller.login(localTtestDto, mocks.res, mocks.req);
    expect(mocks.res.cookie).toHaveBeenCalledTimes(0);
    expect(response.status).toEqual(ApiResultStatus.Success);
  });

  it("login generate exception when the DTO is malformed", async () => {
    const malformedDTO = new TwoFactorLoginDto({
      email: "chris.tate+NI-1@blockspaces.com",
      password: "passw0rd"
    });

    mocks.twoFactorAuthService.login = jest.fn().mockResolvedValue({
      success: true,
      tokenExpiration: new Date(),
      data: new TwoFactorLoginResultDto({
        userDetails: createMock<IUser>()
      }),
    });

    mocks.res.cookie = jest.fn().mockResolvedValue({});
    mocks.req.originalUrl = "https://testurl.com/getit";
    try {
      const response = await controller.login(malformedDTO, mocks.res, mocks.req);
    } catch (error) {
      expect(error.status).toEqual(400);
      expect(error.message).toEqual("Invalid request body.");
      expect(mocks.res.cookie).toHaveBeenCalledTimes(0);
    }
  });

  it("login should fail when the user 2FA login process fails", async () => {
    mocks.twoFactorAuthService.login = jest.fn().mockResolvedValue({
      success: false,
      failureReason: TwoFactorAuthLoginFailureReason.UNAUTHORIZED_USER
    });

    try {
      const response = await controller.login(testDto, mocks.res, mocks.req);
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe("User is not authorized.");
    }
  });

  it("should fail if there is an error finding the active tenant", async () => {
    mocks.tenantService.findByTenantId = jest.fn().mockRejectedValueOnce(new NotFoundException());
    const user = createMock<IUser>();

    await expect(controller.setActiveTenant(user, '', mocks.res, mocks.req)).rejects.toThrowError(NotFoundException);
  })

  it("should succeed and not update active tenant because the user is not a member of the tenant", async () => {
    const tenant = createMock<Tenant>({ users: [{ userId: '1234', memberStatus: TenantMemberStatus.ACTIVE, email: '' }] });
    mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(tenant);
    const user = createMock<IUser>({ id: '1235' });

    await expect(controller.setActiveTenant(user, '', mocks.res, mocks.req)).resolves.not.toThrowError();
    expect(mocks.res.cookie).toBeCalledTimes(0);
  })

  it("should succeed and not update active tenant because the user is not a member of the tenant", async () => {
    const tenant = createMock<Tenant>({ users: [{ userId: '1234', memberStatus: TenantMemberStatus.INACTIVE, email: '' }] });
    mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(tenant);
    const user = createMock<IUser>({ id: '1234' });

    await expect(controller.setActiveTenant(user, '', mocks.res, mocks.req)).resolves.not.toThrowError();
    expect(mocks.res.cookie).toBeCalledTimes(0);
  })

  it("should succeed and update the active tenant", async () => {
    const tenant = createMock<Tenant>({ users: [{ userId: '1234', memberStatus: TenantMemberStatus.ACTIVE, email: '' }] });
    mocks.tenantService.findByTenantId = jest.fn().mockResolvedValueOnce(tenant);
    const user = createMock<IUser>({ id: '1234' });

    await expect(controller.setActiveTenant(user, '', mocks.res, mocks.req)).resolves.not.toThrowError();
    expect(mocks.res.cookie).toBeCalledTimes(1);
  })

});