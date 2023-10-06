import PlatformStatus from "./PlatformStatus"

type PlatformApiResponse = {
  adminMessage: string,
  timestamp?: number,
  version?: string,
  systemStatus?: PlatformStatus,
  appIdStatus?: PlatformStatus,
  vaultStatus?: PlatformStatus,
  haproxyStatus?: PlatformStatus,
  databaseStatus?: PlatformStatus,
  maintenanceMode?: PlatformStatus,
  coinbase?: PlatformStatus,
  cryptoCompare?: PlatformStatus,
  cyclrStatus?: PlatformStatus
}

export default PlatformApiResponse
