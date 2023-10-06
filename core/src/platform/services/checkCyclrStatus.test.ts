import { checkCyclrStatus } from "./checkCyclrStatus";
import { AppIdService } from "../../app-id";
import { createMock } from "ts-auto-mock";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { PlatformStatus } from "@blockspaces/shared/models/platform";
import { BscStatusResponse } from "../../legacy/types/BscStatusResponse";
import { AppIdStatusResult } from "../../app-id/models";
import { CyclrService, CyclrAccount, CyclrApiToken } from "../../cyclr/services/CyclrService";
import { HttpService } from "@blockspaces/shared/services/http";
import { EnvironmentVariables } from "../../env";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { AxiosResponse } from "axios";
import { HttpStatus } from "@blockspaces/shared/types/http";

let mocks: {
  httpService: HttpService,
  logger: ConnectLogger,
  env: EnvironmentVariables,
  cyclrAccount: CyclrAccount,
  cyclrApiToken: CyclrApiToken
};

mocks = {
  httpService: createMock<HttpService>(),
  env: createMock<EnvironmentVariables>(),
  logger: createMock<ConnectLogger>(),
  cyclrAccount: createMock<CyclrAccount>(),
  cyclrApiToken: createMock<CyclrApiToken>()
}
const cyclrService = new CyclrService(mocks.httpService, mocks.env, mocks.logger);

describe("checkCyclrStatus", () => {

  it(".checkCyclrStatus() to return normal when the service is available", async () => {
    mocks.cyclrApiToken.access_token = '12345';
    mocks.httpService.request = jest.fn().mockResolvedValueOnce(<AxiosResponse>{
      status: HttpStatus.OK,
      data: mocks.cyclrApiToken
    }).mockResolvedValue(
      <AxiosResponse>{
        status: HttpStatus.OK,
        data: [mocks.cyclrAccount]
      }
    );
    expect(await checkCyclrStatus(cyclrService)).toEqual(PlatformStatus.normal);
  });
  it(".checkAppIdStatus() to return down when the service is not available", async () => {
    mocks.httpService.request = jest.fn().mockResolvedValueOnce(<AxiosResponse>{
      status: HttpStatus.BAD_REQUEST,
      data: {}
    });
    expect(await checkCyclrStatus(cyclrService)).toEqual(PlatformStatus.down);
  });
  it(".checkAppIdStatus() to return down when there are no accounts in the system", async () => {
    mocks.httpService.request = jest.fn().mockResolvedValueOnce(<AxiosResponse>{
      status: HttpStatus.OK,
      data: mocks.cyclrApiToken
    }).mockResolvedValue(
      <AxiosResponse>{
        status: HttpStatus.OK,
        data: []
      }
    );
    expect(await checkCyclrStatus(cyclrService)).toEqual(PlatformStatus.down);
  });
});
