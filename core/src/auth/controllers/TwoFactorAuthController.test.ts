import { TwoFactorAuthConfigurationDto, TwoFactorConfigResultDto } from '@blockspaces/shared/dtos/authentication/two-factor-auth-configuration'
import { Logger } from 'log4js';
import { createMock } from 'ts-auto-mock';
import { LoginService } from '../services/LoginService';
import { TwoFactorAuthController } from "./TwoFactorAuthController";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { TwoFactorAuthService } from "../services/TwoFactorAuthService";
import { TwoFactorAuthConfigurationFailureReason } from "@blockspaces/shared/types/two-factor-auth-configuration";
import { ADMIN_ONLY_DECORATOR_KEY } from '../decorators/AdminOnly.decorator';
import { ConnectLogger } from '../../logging/ConnectLogger';



describe(TwoFactorAuthController, () => {
  let controller: TwoFactorAuthController;
  let twoFactorAuthConfigurationDto = new TwoFactorAuthConfigurationDto();
  let mocks: {
    twoFactorAuthService: TwoFactorAuthService
    loginService: LoginService,
    logger: ConnectLogger,
  };

  beforeEach(async () => {
    mocks = {
      twoFactorAuthService: createMock<TwoFactorAuthService>(),
      loginService: createMock<LoginService>(),
      logger: createMock<ConnectLogger>(),
    }

    twoFactorAuthConfigurationDto = { email: "test email", password: "test password" }
    controller = new TwoFactorAuthController(mocks.logger, mocks.twoFactorAuthService);
  });

  it('should return a successful result when there are no errors', async () => {

    const expectedResult = new TwoFactorConfigResultDto({ barcode: "test barcode", url: "test url", secret: "my code" });

    mocks.twoFactorAuthService.get2FAConfiguration = async () => expectedResult;

    const actualResult = await controller.twoFactorAuthConfiguration(twoFactorAuthConfigurationDto);
    expect(actualResult.status).toEqual(ApiResultStatus.Success);
    expect(actualResult.data).toEqual(expectedResult);
  });

  it('should return a failed result when unable to retrieve 2FA configuration', async () => {

    const expectedResult = new TwoFactorConfigResultDto({
      failureReason: TwoFactorAuthConfigurationFailureReason.FAILED_2FA_CONFIGURATION
    });

    mocks.twoFactorAuthService.get2FAConfiguration = async () => expectedResult;

    const actualResult = await controller.twoFactorAuthConfiguration(twoFactorAuthConfigurationDto);
    expect(actualResult.status).toEqual(ApiResultStatus.Failed);
    expect(actualResult.data).toEqual(expectedResult);
  });

  it('should return a failed result when credentials are not valid', async () => {

    const expectedResult = new TwoFactorConfigResultDto({
      failureReason: TwoFactorAuthConfigurationFailureReason.INVALID_CREDENTIALS
    });

    mocks.twoFactorAuthService.get2FAConfiguration = async () => expectedResult;

    const actualResult = await controller.twoFactorAuthConfiguration(twoFactorAuthConfigurationDto);
    expect(actualResult.status).toEqual(ApiResultStatus.Failed);
    expect(actualResult.data).toEqual(expectedResult);
  });

  it(`ensure ${TwoFactorAuthController.prototype.resetUserTwoFactorStatus} implements AdminOnly Guard`, async () => {
    const isAdminOnlyApplied = Reflect.getMetadata(ADMIN_ONLY_DECORATOR_KEY, TwoFactorAuthController.prototype.resetUserTwoFactorStatus)
    expect(isAdminOnlyApplied).toEqual(true);
  })

});
