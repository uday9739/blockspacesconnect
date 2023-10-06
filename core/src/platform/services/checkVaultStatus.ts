import {PlatformStatus} from "@blockspaces/shared/models/platform";
import {ApiResultStatus} from "@blockspaces/shared/models/ApiResult";
import {VaultService} from "../../vault";

export async function checkVaultStatus(vaultService: VaultService): Promise<PlatformStatus> {
  try {
    const response = await vaultService.getVaultStatus();
    return response.status === ApiResultStatus.Success ? PlatformStatus.normal : PlatformStatus.down;
  } catch (err) {
    return PlatformStatus.down;
  }
}
