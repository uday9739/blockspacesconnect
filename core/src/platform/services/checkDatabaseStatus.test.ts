import {createMock} from "ts-auto-mock";
import {PlatformStatus} from "@blockspaces/shared/models/platform";
import {checkDatabaseStatus} from "./checkDatabaseStatus";
import {ConnectDbConnectionManager} from "../../connect-db/services/ConnectDbConnectionManager";
import {BscStatusResponse} from "../../legacy/types/BscStatusResponse";
import {ApiResultStatus} from "@blockspaces/shared/models/ApiResult";

const mockDbConnectionManager = createMock<ConnectDbConnectionManager>({
  getConnectionStatus(): Promise<BscStatusResponse>{
    return Promise.resolve({status: ApiResultStatus.Success, data: ""});
  },
});

describe(checkDatabaseStatus, () => {
  it(`.${checkDatabaseStatus}() to return normal when the service is available`, async () => {
    expect(await checkDatabaseStatus(mockDbConnectionManager)).toEqual(PlatformStatus.normal);
  });
  it(".checkDatabaseStatus() to return down when the service is not available", async () => {
    mockDbConnectionManager.getConnectionStatus = jest.fn().mockResolvedValue({status: ApiResultStatus.Failed, data: ""});
    expect(await checkDatabaseStatus(mockDbConnectionManager)).toEqual(PlatformStatus.down);
  });
  it(".checkDatabaseStatus() to return down when an error is thrown", async () => {
    mockDbConnectionManager.getConnectionStatus = jest.fn().mockRejectedValue(new Error());
    expect(await checkDatabaseStatus(mockDbConnectionManager)).toEqual(PlatformStatus.down);
  });
});
