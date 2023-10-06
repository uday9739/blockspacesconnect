import {PlatformStatus} from "@blockspaces/shared/models/platform";
import { HaproxyService } from "../../haproxy";

export async function checkHaproxyStatus(haproxyService: HaproxyService): Promise<PlatformStatus> {
  try {
    const response = await haproxyService.getStatus();
    return response === true ? PlatformStatus.normal : PlatformStatus.down;
  } catch (err) {
    return PlatformStatus.down;
  }
}
