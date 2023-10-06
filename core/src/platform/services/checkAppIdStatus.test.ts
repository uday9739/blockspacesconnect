import {checkAppIdStatus} from "./checkAppIdStatus";
import {AppIdService} from "../../app-id";
import {createMock} from "ts-auto-mock";
import {ApiResultStatus} from "@blockspaces/shared/models/ApiResult";
import {PlatformStatus} from "@blockspaces/shared/models/platform";
import {BscStatusResponse} from "../../legacy/types/BscStatusResponse";
import { AppIdStatusResult } from "../../app-id/models";

const appIdClientMock = createMock<AppIdService>({
  getAppIdStatus(): Promise<AppIdStatusResult> {
    return Promise.resolve(AppIdStatusResult.success());
  },
});

describe("checkAppIdStatus", () => {
  it(".checkAppIdStatus() to return normal when the service is available", async () => {
    expect(await checkAppIdStatus(appIdClientMock)).toEqual(PlatformStatus.normal);
  });
  it(".checkAppIdStatus() to return down when the service is not available", async () => {
    appIdClientMock.getAppIdStatus = async (): Promise<AppIdStatusResult> => {
      return Promise.resolve(AppIdStatusResult.failure());
    };
    expect(await checkAppIdStatus(appIdClientMock)).toEqual(PlatformStatus.down);
  });
  it(".checkAppIdStatus() to catch error", async () => {
    appIdClientMock.getAppIdStatus = async (): Promise<AppIdStatusResult> => {
      throw new Error("an error in appId");
    };
    expect(await checkAppIdStatus(appIdClientMock)).toEqual(PlatformStatus.down);
  });
});
