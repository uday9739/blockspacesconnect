import { PlatformStatus } from "@blockspaces/shared/models/platform";
import { ConnectDbConnectionManager } from "../../connect-db/services/ConnectDbConnectionManager";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";

export async function checkDatabaseStatus(myDatabase: ConnectDbConnectionManager): Promise<PlatformStatus> {
  try {
    const response = await myDatabase.getConnectionStatus();
    if (response.status === ApiResultStatus.Success) {
      return PlatformStatus.normal;
    } else {
      return PlatformStatus.down;
    }
  } catch (err) {
    return PlatformStatus.down;
  }
}

export async function checkMaintenanceStatus(db: ConnectDbDataContext): Promise<PlatformStatus> {
  try {
    const response = await db.systemMaintenance.find({ maintenance: true }, {}, { lean: true });
    if (response.filter(x => x.maintenance === true).length > 0) {
      return PlatformStatus.maintenance;
    } else {
      return PlatformStatus.normal;
    }
  } catch (err) {
    return PlatformStatus.down;
  }
}
