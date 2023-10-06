import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { PlatformStatus } from "@blockspaces/shared/models/platform";
import { CyclrService } from "../../cyclr/services/CyclrService";

export async function checkCyclrStatus(cyclrService: CyclrService): Promise<PlatformStatus> {
  try {
    const response = await cyclrService.getStatus();
    return PlatformStatus.normal;
  } catch (err) {
    return PlatformStatus.down;
  }
}
