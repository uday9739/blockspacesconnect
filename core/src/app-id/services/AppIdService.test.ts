import AppIdServiceTestObjects from "./AppService.test.json";
import { AppIdService } from "./AppIdService";
import ApiResult, { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { TwoFactorSetupStatus } from "@blockspaces/shared/models/users";

import { EnvironmentVariables } from "../../env";
import { expect } from "@jest/globals";
import { createMock } from "ts-auto-mock";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { HttpService } from "@blockspaces/shared/services/http";
import { HttpStatus } from "@nestjs/common";
import { AccessAndIdTokenResponse } from "@blockspaces/shared/types/oauth";
import { AxiosResponse } from "axios";
import { AuthFailureReason } from "@blockspaces/shared/types/authentication";
import { AppIdError } from "../models";

describe(AppIdService, () => {
  let appIdService: AppIdService;

  let mocks: {
    httpService: HttpService,
    logger: ConnectLogger,
    env: EnvironmentVariables
  };

  beforeEach(() => {
    mocks = {
      httpService: createMock<HttpService>(),
      logger: createMock<ConnectLogger>(),
      env: createMock<EnvironmentVariables>()
    };

    appIdService = new AppIdService(mocks.httpService, mocks.env, mocks.logger);
  });

  // ###################
  // # getUserTokens()
  // ###################
  describe(AppIdService.prototype.getUserTokens, () => {

    it('should return token data if user credentials are valid', async () => {
      const tokenData: AccessAndIdTokenResponse = {
        access_token: "this.is.a.fake.access.token",
        id_token: "fake.id.token",
        expires_in: 3600,
        token_type: "Bearer"
      };

      mocks.httpService.request = async () => (<AxiosResponse>{
        status: HttpStatus.OK,
        data: tokenData
      });

      const result = await appIdService.getUserTokens("joe@shmo.com", "abc123");
      expect(result.success).toBeTruthy();
      expect(result.tokens).toBe(tokenData);
    });

    it('should return an error status if username or password are invalid', async () => {
      mocks.httpService.request = async () => (<AxiosResponse>{
        status: HttpStatus.BAD_REQUEST,
        data: <AppIdError>{}
      });

      const result = await appIdService.getUserTokens("foo@bar.com", "1233498");
      expect(result.success).toBeFalsy();
      expect(result.failureReason).toBe(AuthFailureReason.INVALID_CREDENTIALS);
    });

    it("should return an error status if the user's email address is not verified", async () => {
      mocks.httpService.request = async () => (<AxiosResponse>{
        status: HttpStatus.FORBIDDEN,
        data: <AppIdError>{}
      });

      const result = await appIdService.getUserTokens("foo@bar.com", "1233498");
      expect(result.success).toBeFalsy();
      expect(result.failureReason).toBe(AuthFailureReason.INVALID_CREDENTIALS);
    });
  });

  /*
   * All tests within this describe block are targeting legacy methods that may need to be refactored.
   * Eventually, each method should have its own describe block
   */
  describe("legacy tests", () => {

    it("the App ID service should implement getAdminToken()", async () => {
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken);
      const result = await appIdService["getAdminToken"](); // use array index to access private method
      expect(result.status).toEqual(ApiResultStatus.Success);
      expect(result.data).toHaveProperty("access_token");
    });

    it("the App ID service should implement addUser()", async () => {
      jest.spyOn(appIdService, "getUserProfileByEmail").mockResolvedValue(ApiResult.failure());

      mocks.httpService.request = jest.fn()
        .mockResolvedValue({ data: AppIdServiceTestObjects.addUserResponse });

      const result = await appIdService.addUser(`ramos.jeremy+test1@gmail.com`, `passw0rd`, true);
      expect(result.status).toEqual(ApiResultStatus.Success);
    });

    it("the App ID service should implement getAppIdStatus()", async () => {
      mocks.httpService.request = jest.fn().mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken); // same response signature for getAppIdStatus
      const result = await appIdService.getAppIdStatus();
      expect(result.status).toEqual(ApiResultStatus.Success);
    });

    it("the App ID service should implement getUserProfile()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.httpGetUserProfile);

      const response = await appIdService.getUserProfile(`0c59634d-9b8c-426d-925f-1c6bf18119fa`);
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(response.data.email).toBe(`ramos.jeremy@gmail.com`);
      expect(mockRequest.mock.calls.length).toBe(2);
    });

    it("the App ID service should implement getUserByEmail()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.httpGetUserByEmail);

      const response = await appIdService.getUserProfileByEmail(`ramos.jeremy@gmail.com`);
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(response.data.email).toBe(`ramos.jeremy@gmail.com`);
      expect(mockRequest.mock.calls.length).toBe(2);
    });

    it("the App ID service should implement sendEmail()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.sendEmailResponse);

      const response = await appIdService.sendEmail("templateName", "uuid= user profileId");
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(response.data).toEqual({ message: "Email is queued to be delivered." });
      expect(mockRequest.mock.calls.length).toBe(2);
    });

    it("the App ID service should implement forgotPassword()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.forgotPasswordResponse);
      const response = await appIdService.forgotPassword(`ramos.jeremy@blockspaces.com`);
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(response.data.displayName).toEqual(`ramos.jeremy@blockspaces.com`);
      expect(mockRequest.mock.calls.length).toBe(2);
    });

    it("the App ID service should implement forgotPasswordConfirmResult()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.forgotPasswordConfirmationResponse);

      const response = await appIdService.forgotPasswordConfirmResult(`context code ~ L0DkUpLLwzaFipn6nuC2wJFYDarjvSfq`);
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(response.data).toHaveProperty("uuid");
      expect(mockRequest.mock.calls.length).toBe(2);
    });

    it("the App ID service should implement forgotPasswordConfirmResult()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.changePasswordResponse);
      const response = await appIdService.changePassword("newpassword", "uuid= user profileId");
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(response.data).toHaveProperty("displayName");
      expect(mockRequest.mock.calls.length).toBe(2);
    });

    it("the App ID service should implement deleteUser()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce({ status: 204, statusText: "OK" });
      const response = await appIdService.deleteUser("user's profileId");
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(mockRequest.mock.calls.length).toBe(2);
    });

    it("the App ID service should implement requestEmailVerification()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.httpGetUserByEmail)
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.httpGetUserProfile)
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.sendEmailResponse);
      const response = await appIdService.requestEmailVerification("ramos.jeremy@gmail.com");
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(response.data).toEqual({ message: "Email is queued to be delivered." });
      expect(mockRequest.mock.calls.length).toBe(4);
    });

    it("the App ID service should implement updateUserProfile()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.updateUserProfileResponse);
      const response = await appIdService.updateUserProfile("user id in App ID", { twofastatus: TwoFactorSetupStatus.Confirmed });
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(response.data.name).toBeDefined();
      expect(response.data.identities).toBeDefined();
      expect(mockRequest.mock.calls.length).toBe(2);
    });

    it("the App ID service should implement update2FAStatus()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.httpGetUserProfile)
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.updateUserProfileResponse);
      const response = await appIdService.updateTwoFactorStatus("0c59634d-9b8c-426d-925f-1c6bf18119fa", TwoFactorSetupStatus.Pending);
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(mockRequest.mock.calls.length).toBe(4);
    });

    it("the App ID service should implement addUserIdOrg()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.httpGetUserProfile)
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.updateUserProfileResponse);
      const response = await appIdService.addOrgToUserProfile("0c59634d-9b8c-426d-925f-1c6bf18119fa", "orgX");
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(mockRequest.mock.calls.length).toBe(4);
      expect(response.data.attributes.orgs.length).toEqual(3);
    });

    it("the App ID service should implement removeUserIdOrg()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.updateOrgResposne1)
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.updateOrgResposne1);
      const response = await appIdService.removeOrgFromUserProfile("0c59634d-9b8c-426d-925f-1c6bf18119fa", "orgX");
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(mockRequest.mock.calls.length).toBe(2);
      expect(response.data.attributes.orgs.length).toEqual(2);
    });

    it("the App ID service should implement addUserOrg()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.httpGetUserByEmail)
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.updateOrgResposne1)
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.updateOrgResposne1);
      const response = await appIdService.addUserOrgToUserProfileByEmail("ramos.jeremy@gmail.com", "orgX");
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(mockRequest.mock.calls.length).toBe(6);
      expect(response.data.attributes.orgs.length).toEqual(3);
    });

    it("the App ID service should implement removeUserOrg()", async () => {
      const mockRequest = mocks.httpService.request = jest.fn()
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.httpGetUserByEmail)
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.updateOrgResposne1)
        .mockResolvedValueOnce(AppIdServiceTestObjects.getAdminToken) // simulate getting token
        .mockResolvedValueOnce(AppIdServiceTestObjects.updateOrgResposne1);
      const response = await appIdService.removeUserOrgFromProfileByEmail("ramos.jeremy@gmail.com", "orgX");
      expect(response.status).toEqual(ApiResultStatus.Success);
      expect(mockRequest.mock.calls.length).toBe(6);
      expect(response.data.attributes.orgs.length).toEqual(2);
    });

  });
});
