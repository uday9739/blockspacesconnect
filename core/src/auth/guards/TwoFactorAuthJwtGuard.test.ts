import { createMock } from 'ts-auto-mock';
import { JwtService } from "../services/JwtService";
import { TwoFactorAuthJwtGuard } from "./TwoFactorAuthJwtGuard"
import { ExecutionContext } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import CookieName from "@blockspaces/shared/models/CookieName";
import { JwtLibraryWrapper } from '../services/JwtLibraryWrapper';

describe(TwoFactorAuthJwtGuard, () => {
  let twoFactorAuthJwtGuard: TwoFactorAuthJwtGuard;
  let actualTwoFactorAuthJwtService = new JwtService(null, new JwtLibraryWrapper(),null);
  let mocks: {
    twoFactorAuthJwtService: JwtService,
    executionContext: ExecutionContext,
    httpArgumentHost: HttpArgumentsHost
  };

  beforeEach(async () => {
    mocks = {
      twoFactorAuthJwtService: createMock<JwtService>(),
      executionContext: createMock<ExecutionContext>(),
      httpArgumentHost: createMock<HttpArgumentsHost>()
    }
    twoFactorAuthJwtGuard = new TwoFactorAuthJwtGuard(actualTwoFactorAuthJwtService)
  });

  it('TwoFactorAuthJwtGuard should authorize action with valid JWT', async () => {
    const getJwtResponse = await actualTwoFactorAuthJwtService.get2faJwt("my userId", "myTestEmailAddress")
    let signedCookies = {};
    signedCookies[CookieName.TwoFactorConfigurationToken] = getJwtResponse.jwtEncoded;
    mocks.httpArgumentHost.getRequest = jest.fn().mockReturnValue({ signedCookies, body: { email: "myTestEmailAddress" } });
    mocks.executionContext.switchToHttp = jest.fn().mockReturnValue(mocks.httpArgumentHost);
    const canActivateResponse = await twoFactorAuthJwtGuard.canActivate(mocks.executionContext)
    expect(canActivateResponse).toBeTruthy()
  });

  it('TwoFactorAuthJwtGuard should fail with an invalid JWT', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJteSB1c2VySWQiLCJjb2RlIjoibXkgb25lIHRpbWUgY29kZSIsImlhdCI6MTY1NDcxNTcxNCwiZXhwIjoxNjU0NzE2MDE0LCJpc3MiOiJCbG9ja1NwYWNlcyBDb25uZWN0In0.Nhlfq9QZjI1rk3ySJSXrwY4f5N2gy5YAwAhu78fFJTw';
    mocks.httpArgumentHost.getRequest = jest.fn().mockReturnValue({ signedCookies: { TwoFactorJwtCookie: expiredToken } });
    mocks.executionContext.switchToHttp = jest.fn().mockReturnValue(mocks.httpArgumentHost);
    try {
      const canActivateResponse = await twoFactorAuthJwtGuard.canActivate(mocks.executionContext)
    } catch (error) {
      expect(error.message).toBe("jwt must be provided")
    }
  });

  it('TwoFactorAuthJwtGuard should fail with an malformed JWT', async () => {
    mocks.httpArgumentHost.getRequest = jest.fn().mockReturnValue({ signedCookies: { TwoFactorJwtCookie: 'malformed JWT' } });
    mocks.executionContext.switchToHttp = jest.fn().mockReturnValue(mocks.httpArgumentHost);
    try {
      const canActivateResponse = await twoFactorAuthJwtGuard.canActivate(mocks.executionContext)
    } catch (error) {
      expect(error.message).toBe("jwt must be provided")
    }
  });

});
