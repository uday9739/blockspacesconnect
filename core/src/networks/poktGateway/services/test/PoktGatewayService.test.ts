import PoktGatewayServiceMockData from "./PoktGatewayService.test.json";
import GatewayProxyService, { GatewayUserCredentials } from "../PoktGatewayService";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { HttpService, HttpResponse } from "@blockspaces/shared/services/http";
import { EnvironmentVariables } from "../../../../env";
import { createMock } from "ts-auto-mock";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { GatewaySettings } from "../../models";

describe(`${GatewayProxyService.name}`, () => {
  let service: GatewayProxyService;
  let credentials: GatewayUserCredentials;
  let mocks: {
    httpService: HttpService;
    logger: ConnectLogger;
    env: EnvironmentVariables;
  };

  beforeEach(() => {
    mocks = {
      httpService: createMock<HttpService>(),
      logger: createMock<ConnectLogger>(),
      env: createMock<EnvironmentVariables>()
    };
    credentials = new GatewayUserCredentials(PoktGatewayServiceMockData.username, PoktGatewayServiceMockData.username);
    service = new GatewayProxyService(mocks.httpService, mocks.env, mocks.logger);
  });

  describe(`${GatewayProxyService.prototype.CreateUserAccount.name}`, () => {
    it("Ensure can create account", async () => {
      // arrange
      mocks.httpService.request = async () =>
        <HttpResponse>{
          status: HttpStatus.NO_CONTENT
        };

      // act
      const createUserResult = await service.CreateUserAccount(credentials);

      // assert
      expect(createUserResult).toBeTruthy();
      expect(createUserResult.isSuccess).toBeTruthy();
    });
  });

  describe(`${GatewayProxyService.prototype.AuthenticateUserAccount.name}`, () => {
    it("Ensure user can Authenticate", async () => {
      // arrange
      mocks.httpService.request = async () =>
        <HttpResponse>{
          status: HttpStatus.OK,
          data: PoktGatewayServiceMockData.loginResponse
        };
      // act
      const result = await service.AuthenticateUserAccount(credentials);
      // assert
      expect(result.isSuccess).toBeTruthy();
      expect(result.data.status).toBe("success");
    });
  });

  describe(`${GatewayProxyService.prototype.CreateApplication.name}`, () => {
    it("Ensure can Create Application", async () => {
      // arrange
      mocks.httpService.request = async () =>
        <HttpResponse>{
          status: HttpStatus.OK,
          data: PoktGatewayServiceMockData.createAppResponse
        };

      service.AuthenticateUserAccount = jest.fn().mockResolvedValueOnce(PoktGatewayServiceMockData.AuthenticateUserAccountResponse);
      // act
      const result = await service.CreateApplication(credentials, PoktGatewayServiceMockData.createAppData.appName, PoktGatewayServiceMockData.createAppData.gatewaySettings as GatewaySettings);
      // assert
      expect(result.isSuccess).toBeTruthy();
      expect(result.data.name).toBe(PoktGatewayServiceMockData.createAppData.appName);
    });
  });

  describe(`${GatewayProxyService.prototype.UpdateApplication.name}`, () => {
    it("Ensure can Update Application", async () => {
      // arrange
      mocks.httpService.request = async () =>
        <HttpResponse>{
          status: HttpStatus.NO_CONTENT
        };
      service.AuthenticateUserAccount = jest.fn().mockResolvedValueOnce(PoktGatewayServiceMockData.AuthenticateUserAccountResponse);
      // act
      const result = await service.UpdateApplication(credentials, PoktGatewayServiceMockData.updateAppData.gatewaySettings as GatewaySettings);
      // assert
      expect(result).toBeTruthy();
      expect(result.isSuccess).toBeTruthy();
    });
  });
});
