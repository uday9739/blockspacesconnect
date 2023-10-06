import {VaultService} from "../../vault";
import {createMock} from "ts-auto-mock";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import {PlatformStatus} from "@blockspaces/shared/models/platform";
import {checkVaultStatus} from "./checkVaultStatus";

const vaultClientMock = createMock<VaultService>({
  getVaultStatus(): Promise<ApiResult<string>> {
    return Promise.resolve(ApiResult.success(""));
  },
});

describe("checkVaultStatus", () => {
  it(".checkVaultStatus() to return normal when the service is available", async () => {
    expect(await checkVaultStatus(vaultClientMock)).toEqual(PlatformStatus.normal);
  });
  it(".checkVaultStatus() to return down when the service is not available", async () => {
    vaultClientMock.getVaultStatus = async () => ApiResult.failure();
    expect(await checkVaultStatus(vaultClientMock)).toEqual(PlatformStatus.down);
  });
  it(".checkVaultStatus() to catch error", async () => {
    vaultClientMock.getVaultStatus = async () => {
      throw new Error("an error in appId");
    };
    expect(await checkVaultStatus(vaultClientMock)).toEqual(PlatformStatus.down);
  });
});
