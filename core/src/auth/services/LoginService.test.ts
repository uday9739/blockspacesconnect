import { IUser, TwoFactorSetupStatus } from '@blockspaces/shared/models/users';
import { Logger } from 'log4js';
import { AuthFailureReason } from '@blockspaces/shared/types/authentication';
import { createMock } from 'ts-auto-mock';
import { GetJwtResult, JwtService } from './JwtService';
import { LoginService } from './LoginService';
import { UserDataService } from '../../users/services/UserDataService';
import { ConnectLogger } from '../../logging/ConnectLogger';
import { EnvironmentVariables } from '../../env';

describe(LoginService, () => {

  let loginService: LoginService;

  let mocks: {
    jwtService: JwtService,
    userDataService: UserDataService,
    logger: ConnectLogger,
    env: EnvironmentVariables
  };

  beforeEach(async () => {
    mocks = {
      jwtService: createMock<JwtService>(),
      userDataService: createMock<UserDataService>(),
      logger: createMock<ConnectLogger>(),
      env: createMock<EnvironmentVariables>(),
    };

    loginService = new LoginService(mocks.jwtService, mocks.userDataService, mocks.logger, mocks.env);
  });

  /**
   * doInitialLogin
   */
  describe(LoginService.prototype.doInitialLogin, () => {

    let jwtResult: GetJwtResult;
    let user: IUser;

    beforeEach(() => {

      user = createMock<IUser>({ registered: true });
      mocks.userDataService.findByEmail = async () => user as any;

      jwtResult = {
        success: true,
        payload: {
          sub: "123456",
          twofastatus: TwoFactorSetupStatus.Confirmed,
          accessToken: "jnsdkjsekhjerjkfjknkj482397432894jknrj4knjk4nr"
        }
      };
    });

    it.each([{ email: "joe@shmo.com", password: null }, { email: null, password: "abc1234" }, { email: null, password: null }])(
      'Should return a failure result if email or password are not given (%o)',
      async ({ email, password }) => {
        const result = await loginService.doInitialLogin(email, password);

        expect(result.success).toBe(false);
        expect(result.failureReason).toBe(AuthFailureReason.INVALID_CREDENTIALS);
      }
    );

    it('should return a failure result if no user is found', async () => {
      user = null;

      const result = await loginService.doInitialLogin("joe@shmo.com", "abcd1234");
      expect(result.success).toBe(false);
      expect(result.failureReason).toBe(AuthFailureReason.NOT_REGISTERED);
    });

    it('should return a failure result if user is not registered', async () => {
      user.registered = false;

      const result = await loginService.doInitialLogin("joe@shmo.com", "abcd1234");
      expect(result.success).toBe(false);
      expect(result.failureReason).toBe(AuthFailureReason.NOT_REGISTERED);
    });

    it('should return a successful result if JWT is retrieved successfully', async () => {
      mocks.jwtService.getJwt = async () => (jwtResult);

      const result = await loginService.doInitialLogin("joe@shmo.com", "abc123");

      expect(result.success).toBeTruthy();
    });

    it(`should set userId based on JWT 'sub' property`, async () => {
      const expectedUserId = "123ef98459845dddc1243";
      jwtResult.payload.sub = expectedUserId;
      mocks.jwtService.getJwt = async () => jwtResult;

      const { dto: { userId } } = await loginService.doInitialLogin("joe@shmo.com", "abc123");

      expect(userId).toBe(expectedUserId);
    });

    it.each([...Object.values(TwoFactorSetupStatus), null])(
      'should set 2fa setup flag based on JWT 2fa status (%s)',
      async (twoFactorStatus) => {
        const expected2faSetupFlag = twoFactorStatus === TwoFactorSetupStatus.Confirmed;

        jwtResult.payload.twofastatus = twoFactorStatus;
        mocks.jwtService.getJwt = async () => jwtResult;

        const { dto: { twoFactorSetupComplete } } = await loginService.doInitialLogin("joe@shmo.com", "abc123");

        expect(twoFactorSetupComplete).toBe(expected2faSetupFlag);
      }
    );

    it.each(Object.values(AuthFailureReason))(
      'should return failure whenever getting a JWT access token fails (Failure Reason = "%s")',
      async (expectedReason: AuthFailureReason) => {
        mocks.jwtService.getJwt = async () => ({
          success: false,
          failureReason: expectedReason
        });

        const result = await loginService.doInitialLogin("foo@bar.com", "abc123");

        expect(result.success).toBeFalsy();
        expect(result.failureReason).toBe(expectedReason);
        expect(result.dto.failureReason).toBe(expectedReason);
      }
    );

  });
});
