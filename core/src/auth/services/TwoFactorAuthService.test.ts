import { TwoFactorAuthConfigurationDto, TwoFactorConfigResultDto } from '@blockspaces/shared/dtos/authentication/two-factor-auth-configuration';
import { Logger } from 'log4js';
import { createMock } from 'ts-auto-mock';
import { TwoFactorAuthService } from "../services/TwoFactorAuthService";
import { JwtService } from "./JwtService";
import { VaultService } from "../../vault";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { UserDataService } from "../../users/services/UserDataService";
import { AppIdService } from "../../app-id";
import {
  TwoFactorLoginDto,
  TwoFactorLoginResultDto,
} from "@blockspaces/shared/dtos/authentication/two-factor-auth-login";
import { TwoFactorAuthLoginFailureReason } from "@blockspaces/shared/types/two-factor-auth-login";
import { AuthFailureReason } from "@blockspaces/shared/types/authentication";
import { IUser } from '@blockspaces/shared/models/users';
import { TenantService } from '../../tenants';
import { ConnectLogger } from '../../logging/ConnectLogger';

describe(TwoFactorAuthService, () => {
  let twoFactorAuthService: TwoFactorAuthService;
  const twoFactorAuthConfigurationDto = new TwoFactorAuthConfigurationDto();
  let mocks: {
    logger: ConnectLogger,
    vaultService: VaultService,
    jwtService: JwtService,
    userDataService: UserDataService,
    tenantDataService: TenantService,
    appIdService: AppIdService,
  };
  const testDto = new TwoFactorLoginDto({
    email: "e2e+dev3429@blockspaces.com",
    password: "passw0rd",
    code: "213123"
  });

  beforeEach(async () => {
    mocks = {
      logger: createMock<ConnectLogger>(),
      vaultService: createMock<VaultService>(),
      jwtService: createMock<JwtService>(),
      userDataService: createMock<UserDataService>(),
      tenantDataService: createMock<TenantService>(),
      appIdService: createMock<AppIdService>(),
    };

    mocks.jwtService.getJwt = jest.fn().mockResolvedValue({
      success: true,
      jwtEncoded: "encoded JWT",
      payload: {
        exp: Date(),
        sub: "user sub",
        userName: "user name",
        orgs: ["tenantId"],
        twofastatus: "CONFIRMED",
        whmcs: {
          cid: 1,
          oid: 2
        }
      }
    });
    mocks.vaultService.validateTOTPCode = jest.fn().mockResolvedValue({ status: "success", data: { valid: true } });
    mocks.appIdService.updateTwoFactorStatus = jest.fn().mockResolvedValue({ status: "success", data: {} });
    mocks.userDataService.update2FAStatus = jest.fn().mockResolvedValue({ status: "success", data: {} });
    mocks.userDataService.getUserById = jest.fn().mockResolvedValue({
      email: testDto.email,
      id: "userId",
      accessToken: "access token",
      tenants: ["tenantId"],
      migratedUser: true,
      firstLogin: true,
      whmcs: {
        clientId: 1,
        ownerId: 2,
      },
      twoFAStatus: "CONFIRMED",
      firstName: "First Name",
      lastName: "Last Name",
      tosDate: Date.now().toString(),
    });
    mocks.tenantDataService.findByTenantId = jest.fn().mockResolvedValue({
      tenantId: "11f0bdfa-bc4b-45b0-8e54-8635d4b5e2fa",
      name: "chris+local2@blockspaces.com",
      ownerId: "8408a506-6177-4375-9665-a1a9afdbdf0c",
      status: "active",
      description: "Default tenant for Chris Tyler",
      tenantType: "organization",
      users: [
        "8408a506-6177-4375-9665-a1a9afdbdf0c"
      ],
      whmcsClientId: 900,
      createdAt: "2022-11-29T15:14:26.141Z",
      updatedAt: "2022-11-29T15:14:26.141Z",
    })
    mocks.logger.debug = jest.fn().mockImplementation((message: string, module?, data?) => { });


    twoFactorAuthService = new TwoFactorAuthService(
      mocks.logger,
      mocks.vaultService,
      mocks.jwtService,
      mocks.userDataService,
      mocks.tenantDataService,
      mocks.appIdService
    );
    twoFactorAuthConfigurationDto.email = "testEmail";
    twoFactorAuthConfigurationDto.password = "testPassword";
  });

  describe("get2FAConfiguration", () => {

    it('get2FAConfiguration should return a successful result when there are no errors', async () => {
      const expectedResult = new TwoFactorConfigResultDto({
        barcode: "testBarcode",
        url: "otpauth://totp/BlockSpaces:ramos.jeremy+d9651edb-b56a-464a-9393-a54d753ae1000@gmail.com?algorithm=SHA1&digits=6&issuer=BlockSpaces&period=30&secret=DIYXFBRKMP2K3H67UTRJGMRFQIIN6FE2",
        secret: "DIYXFBRKMP2K3H67UTRJGMRFQIIN6FE2",
      });

      mocks.jwtService.getJwt = jest.fn().mockResolvedValue({ success: ApiResultStatus.Success, payload: { twofastatus: "PENDING", sub: "testSub" } });
      mocks.vaultService.createTOTPKey = jest.fn().mockResolvedValue({
        status: ApiResultStatus.Success,
        data: { barcode: expectedResult.barcode, url: expectedResult.url }
      });

      const actualResult = await twoFactorAuthService.get2FAConfiguration(twoFactorAuthConfigurationDto.email, twoFactorAuthConfigurationDto.password);
      expect(actualResult.success).toEqual(true);
      expect(actualResult).toEqual(expectedResult);

    });
  });

  describe("setTwoFactorAsPendingForUser", () => {

    it('setTwoFactorAsPendingForUser', async () => {

      mocks.userDataService.getByEmail = jest.fn().mockResolvedValue({ status: "success", data: { id: 123 } });
      mocks.userDataService.update2FAStatus = jest.fn().mockResolvedValue({ status: "success", data: {} });
      mocks.appIdService.updateTwoFactorStatusForUserByEmail = jest.fn().mockResolvedValue({ isSuccess: true, data: {} });
      const response = await twoFactorAuthService.setTwoFactorAsPendingForUser("admin@blockspaces.com");
      expect(response.isSuccess).toBeTruthy();
    });
  });


  describe("login", () => {

    it('login should return a successful Login', async () => {

      const response = await twoFactorAuthService.login(testDto);

      expect(response.success).toBeTruthy();
      expect(response.tokenExpiration).toBeDefined();
      expect(response.data.userDetails.activeTenant).toBeTruthy();
      expect(response.data).toBeInstanceOf(TwoFactorLoginResultDto);
    });

    it('should return failure result if user is not registered', async () => {
      mocks.userDataService.getUserById = async () => createMock<IUser>({ registered: false });

      const result = await twoFactorAuthService.login(testDto);

      expect(result.success).toBe(false);
      expect(result.failureReason).toBe(TwoFactorAuthLoginFailureReason.NOT_REGISTERED);
    });

    it('login should return UNAUTHORIZED_USER failed response when the jwt is not authorized', async () => {

      mocks.jwtService.getJwt = jest.fn().mockResolvedValue({
        success: false,
        failureReason: AuthFailureReason.INVALID_JWT
      });

      const response = await twoFactorAuthService.login(testDto);

     expect(response.success).toBeFalsy();
      expect(response.failureReason).toEqual(TwoFactorAuthLoginFailureReason.UNAUTHORIZED_USER);
    });

    it('login should return INVALID_CODE failed response when the code is invalid', async () => {

      mocks.jwtService.getJwt = jest.fn().mockResolvedValue({
        success: true,
        jwtEncoded: "encoded JWT",
        payload: {
          exp: Date(),
          sub: "user sub",
          userName: "user name",
          orgs: ["tenantId"],
          twofastatus: "CONFIRMED",
          whmcs: {
            cid: 1,
            oid: 2
          }
        }
      });
      mocks.vaultService.validateTOTPCode = jest.fn().mockResolvedValue({ status: "failed", data: { valid: false } });

      const response = await twoFactorAuthService.login(testDto);

      expect(response.success).toBeFalsy();
    });

    it('login should return USER_NOT_FOUND failed response when the code is invalid', async () => {

      mocks.userDataService.getUserById = jest.fn().mockResolvedValue(undefined);

      const response = await twoFactorAuthService.login(testDto);

      expect(response.success).toBeFalsy();
      expect(response.failureReason).toEqual(TwoFactorAuthLoginFailureReason.USER_NOT_FOUND);
    });

  });

});
