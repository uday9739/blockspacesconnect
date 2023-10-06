import {PlatformStatus} from "@blockspaces/shared/models/platform";
import {ApiResultStatus} from "@blockspaces/shared/models/ApiResult";
import {AppIdService} from "../../app-id";

export async function checkAppIdStatus(appIdService: AppIdService): Promise<PlatformStatus> {
  try {
    const response = await appIdService.getAppIdStatus();
    return response.status === ApiResultStatus.Success ? PlatformStatus.normal : PlatformStatus.down;
  } catch (err) {
    return PlatformStatus.down;
  }
}
