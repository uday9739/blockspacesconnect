import PlatformException from "@blockspaces/shared/models/PlatformException";
import { PlatformApiResponse, PlatformStatus } from "@blockspaces/shared/models/platform";
import { Inject, Injectable } from "@nestjs/common";
import { AppIdService } from "../../app-id";
import { VaultService } from "../../vault";
import { checkAppIdStatus } from "./checkAppIdStatus";
import { checkVaultStatus } from "./checkVaultStatus";
import { checkCyclrStatus } from "./checkCyclrStatus";
import { checkCoinbaseStatus, checkCryptoCompareStatus } from "./checkBitcoinPriceApiStatus";
import { checkDatabaseStatus, checkMaintenanceStatus } from "./checkDatabaseStatus";
import { ConnectDbConnectionManager } from "../../connect-db/services/ConnectDbConnectionManager";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { FeatureFlagsService } from "../../feature-flags";
import { CyclrService } from "../../cyclr/services/CyclrService";
import { BitcoinService } from "../../networks/bitcoin/services/BitcoinService";

@Injectable()
export class PlatformStatusService {
  constructor(
    public readonly myAppId: AppIdService,
    public readonly myVault: VaultService,
    public readonly myDatabase: ConnectDbConnectionManager,
    public readonly db: ConnectDbDataContext,
    public readonly featureFlagService: FeatureFlagsService,
    public readonly cyclrService: CyclrService,
    public readonly bitcoinService: BitcoinService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables
  ) { }

  getStatus = async (): Promise<PlatformApiResponse> => {
    return { adminMessage: "Me OK!" };
  };

  getDetailedStatus = async (): Promise<PlatformApiResponse> => {
    try {
      const timeStamp = Date.now();
      const humanTimeStamp = Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "2-digit", year: "numeric", hour: "numeric", minute: "numeric" }).format(new Date(timeStamp));
      const statusResponse: PlatformApiResponse = {
        maintenanceMode: PlatformStatus.normal,
        timestamp: timeStamp,
        version: this.env.app.version,
        adminMessage: `All systems are operational as of ${humanTimeStamp}`,
        systemStatus: PlatformStatus.normal,
        appIdStatus: PlatformStatus.normal,
        vaultStatus: PlatformStatus.normal,
        databaseStatus: PlatformStatus.normal,
        coinbase: PlatformStatus.normal,
        cryptoCompare: PlatformStatus.normal,
        // cyclrStatus: PlatformStatus.normal,
      };
      const systemFeatureFlags = await this.featureFlagService.getSystemFeatureFlagList();

      const downAfterDelay = (ms): Promise<PlatformStatus> => new Promise((resolve, _) => {
        setTimeout(() => resolve(PlatformStatus.down), ms);
      });
      const awaitStatusCheck = async (name, status: Promise<PlatformStatus>): Promise<{ name: string, status: PlatformStatus }> => {
        const completedStatus = await Promise.race<PlatformStatus>([status, downAfterDelay(5000)]);
        return { name: name, status: completedStatus };
      };
      const promises: Promise<{ name: string, status: PlatformStatus }>[] = [];
      promises.push(awaitStatusCheck('appIdStatus', this.checkAppIdStatus()));
      promises.push(awaitStatusCheck('vaultStatus', this.checkVaultStatus()));
      promises.push(awaitStatusCheck('databaseStatus', this.checkDatabaseStatus()));
      promises.push(awaitStatusCheck('maintenanceMode', this.checkMaintenanceStatus()));
      promises.push(awaitStatusCheck("coinbase", this.checkCoinbasePriceApi()))
      promises.push(awaitStatusCheck("cryptoCompare", this.checkCryptoComparePriceApi()))
      // TODO: Remove once Cyclr has been live for a period
      if (systemFeatureFlags.some(flag => flag.cyclrSystem === true)) {
        statusResponse.cyclrStatus = PlatformStatus.normal;
        promises.push(awaitStatusCheck('cyclrStatus', this.checkCyclrStatus()))
      }
      const settled = await Promise.allSettled(promises);

      settled.forEach((res) => {
        const { status, name } = res.status === 'fulfilled' ? res.value : res.reason;

        if (status !== PlatformStatus.normal) {
          statusResponse.systemStatus = PlatformStatus.down;
          statusResponse.adminMessage = `The system is down as of ${humanTimeStamp}`;
          statusResponse[name] = status;
        }
      });
      return statusResponse;
    } catch (err) {
      throw new PlatformException(err.message || "Error occurred in assessSystemStatus.", undefined, true);
    }
  };
  checkAppIdStatus = async (): Promise<PlatformStatus> => {
    return await checkAppIdStatus(this.myAppId);
  };
  checkVaultStatus = async (): Promise<PlatformStatus> => {
    return await checkVaultStatus(this.myVault);
  };
  checkDatabaseStatus = async (): Promise<PlatformStatus> => {
    return await checkDatabaseStatus(this.myDatabase);
  };
  checkMaintenanceStatus = async (): Promise<PlatformStatus> => {
    return await checkMaintenanceStatus(this.db);
  }
  checkCyclrStatus = async (): Promise<PlatformStatus> => {
    return await checkCyclrStatus(this.cyclrService);
  }
  checkCoinbasePriceApi = async (): Promise<PlatformStatus> => {
    return await checkCoinbaseStatus(this.bitcoinService);
  }
  checkCryptoComparePriceApi = async (): Promise<PlatformStatus> => {
    return await checkCryptoCompareStatus(this.bitcoinService);
  }
}
