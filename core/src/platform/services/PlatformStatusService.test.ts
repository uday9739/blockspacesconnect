import { PlatformStatusService } from "./PlatformStatusService";
import { PlatformApiResponse } from "@blockspaces/shared/models/platform";
import { AppIdService } from "../../app-id";
import { VaultService } from "../../vault";
import { createMock } from "ts-auto-mock";
import { BscStatusResponse } from "../../legacy/types/BscStatusResponse";
import ApiResult, { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { PlatformStatus } from "@blockspaces/shared/models/platform";
import { ConnectDbConnectionManager } from "../../connect-db/services/ConnectDbConnectionManager";
import { EnvironmentVariables } from "../../env";
import { AppIdStatusResult } from "../../app-id/models";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { CyclrService } from "../../cyclr/services/CyclrService";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { AxiosResponse } from "axios";
import { FeatureFlagsService } from "../../feature-flags";
import { BitcoinService } from "../../networks/bitcoin/services/BitcoinService";

let platformStatusService: PlatformStatusService;

let mocks: {
  appIdService: AppIdService,
  vaultService: VaultService,
  dbConnectionManager: ConnectDbConnectionManager,
  featureFlagService: FeatureFlagsService,
  cyclrService: CyclrService,
  db: ConnectDbDataContext,
  env: EnvironmentVariables,
  bitcoinService: BitcoinService
}

describe("PlatformStatusService", () => {

  beforeEach(() => {
    mocks = {
      env: createMock<EnvironmentVariables>(),

      appIdService: createMock<AppIdService>({
        getAppIdStatus: async () => AppIdStatusResult.success()
      }),

      vaultService: createMock<VaultService>({
        getVaultStatus: async () => ApiResult.success("")
      }),

      featureFlagService: createMock<FeatureFlagsService>(),

      cyclrService: createMock<CyclrService>(),

      db: createMock<ConnectDbDataContext>({
        systemMaintenance: {
          find: jest.fn().mockResolvedValue([{ maintenance: false }])
        }
      }),

      dbConnectionManager: createMock<ConnectDbConnectionManager>({
        getConnectionStatus: async () => ({ status: ApiResultStatus.Success, data: "" })
      }),

      bitcoinService: createMock<BitcoinService>({
        getCoinbaseExchangeRate: async () => { return { success: true, exchangeRate: 100_000 } },
        getCryptoCompareExchangeRate: async () => { return { success: true, exchangeRate: 100_000 } }
      })
    }

    mocks.featureFlagService.getSystemFeatureFlagList = jest.fn().mockResolvedValue(<Array<any>>
      [{
        cyclrSystem: true
      }]
    );

    mocks.cyclrService.getStatus = jest.fn().mockResolvedValue(<ApiResult<void>>{
      status: ApiResultStatus.Success
    });

    platformStatusService =
      new PlatformStatusService(mocks.appIdService, mocks.vaultService, mocks.dbConnectionManager, mocks.db, mocks.featureFlagService, mocks.cyclrService, mocks.bitcoinService, mocks.env);
  });

  it(".getStatus() should return Me OK regardless of the state of services", async () => {
    const response: PlatformApiResponse = await platformStatusService.getStatus();
    expect(response).toEqual({ adminMessage: "Me OK!" });
  });

  it(".getStatus() should return Me OK regardless of the state of services ", async () => {
    mocks.appIdService.getAppIdStatus = async () => AppIdStatusResult.failure();

    const response: PlatformApiResponse = await platformStatusService.getStatus();
    expect(response).toEqual({ adminMessage: "Me OK!" });
  });


  it(".getDetailedStatus() should return normal for all services ", async () => {
    mocks.appIdService.getAppIdStatus = async () => AppIdStatusResult.success();
    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    expect(response.adminMessage).toContain("All systems are operational as of");
    expect(response.systemStatus).toContain(PlatformStatus.normal);
    expect(response.appIdStatus).toContain(PlatformStatus.normal);
    expect(response.vaultStatus).toContain(PlatformStatus.normal);
    expect(response.databaseStatus).toContain(PlatformStatus.normal);
    expect(response.cyclrStatus).toContain(PlatformStatus.normal);
    expect(response.coinbase).toContain(PlatformStatus.normal);
    expect(response.cryptoCompare).toContain(PlatformStatus.normal);
  });

  it(".getDetailedStatus() should return down when appId Services is not available", async () => {
    mocks.appIdService.getAppIdStatus = async () => AppIdStatusResult.failure()
    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    expect(response.adminMessage).toContain("The system is down as of");
    expect(response.systemStatus).toContain(PlatformStatus.down);
    expect(response.appIdStatus).toContain(PlatformStatus.down);
    expect(response.vaultStatus).toContain(PlatformStatus.normal);
    expect(response.databaseStatus).toContain(PlatformStatus.normal);
    expect(response.cyclrStatus).toContain(PlatformStatus.normal);
    expect(response.coinbase).toContain(PlatformStatus.normal);
    expect(response.cryptoCompare).toContain(PlatformStatus.normal);
  });

  it(".getDetailedStatus() should return down when vault Services is not available", async () => {
    mocks.vaultService.getVaultStatus = async () => ApiResult.failure();
    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    expect(response.adminMessage).toContain("The system is down as of");
    expect(response.systemStatus).toContain(PlatformStatus.down);
    expect(response.appIdStatus).toContain(PlatformStatus.normal);
    expect(response.vaultStatus).toContain(PlatformStatus.down);
    expect(response.databaseStatus).toContain(PlatformStatus.normal);
    expect(response.cyclrStatus).toContain(PlatformStatus.normal);
    expect(response.coinbase).toContain(PlatformStatus.normal);
    expect(response.cryptoCompare).toContain(PlatformStatus.normal);
  });

  it(".getDetailedStatus() should return down when vault and appId Services are not available", async () => {
    mocks.vaultService.getVaultStatus = async () => ApiResult.failure();
    mocks.appIdService.getAppIdStatus = async () => AppIdStatusResult.failure();;

    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    expect(response.adminMessage).toContain("The system is down as of");
    expect(response.systemStatus).toContain(PlatformStatus.down);
    expect(response.appIdStatus).toContain(PlatformStatus.down);
    expect(response.vaultStatus).toContain(PlatformStatus.down);
    expect(response.databaseStatus).toContain(PlatformStatus.normal);
    expect(response.cyclrStatus).toContain(PlatformStatus.normal);
    expect(response.coinbase).toContain(PlatformStatus.normal);
    expect(response.cryptoCompare).toContain(PlatformStatus.normal);
  });

  it(".getDetailedStatus() should return down when vault Services throws an error", async () => {
    mocks.vaultService.getVaultStatus = async () => {
      throw new Error("vaultClient test error");
    };

    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    expect(response.adminMessage).toContain("The system is down as of");
    expect(response.systemStatus).toContain(PlatformStatus.down);
    expect(response.appIdStatus).toContain(PlatformStatus.normal);
    expect(response.vaultStatus).toContain(PlatformStatus.down);
    expect(response.databaseStatus).toContain(PlatformStatus.normal);
    expect(response.cyclrStatus).toContain(PlatformStatus.normal);
    expect(response.coinbase).toContain(PlatformStatus.normal);
    expect(response.cryptoCompare).toContain(PlatformStatus.normal);
  });

  it(".getDetailedStatus() should return down when appId Services is not available", async () => {
    mocks.appIdService.getAppIdStatus = async () => {
      throw new Error("appIdClient test error");
    };

    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    expect(response.adminMessage).toContain("The system is down as of");
    expect(response.systemStatus).toContain(PlatformStatus.down);
    expect(response.appIdStatus).toContain(PlatformStatus.down);
    expect(response.vaultStatus).toContain(PlatformStatus.normal);
    expect(response.databaseStatus).toContain(PlatformStatus.normal);
    expect(response.cyclrStatus).toContain(PlatformStatus.normal);
    expect(response.coinbase).toContain(PlatformStatus.normal);
    expect(response.cryptoCompare).toContain(PlatformStatus.normal);
  });

  it(".getDetailedStatus() should return down when database Services is not available", async () => {
    mocks.dbConnectionManager.getConnectionStatus = function (): Promise<BscStatusResponse> {
      return Promise.resolve({ status: ApiResultStatus.Failed, data: "" });
    };

    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    expect(response.adminMessage).toContain("The system is down as of");
    expect(response.systemStatus).toContain(PlatformStatus.down);
    expect(response.appIdStatus).toContain(PlatformStatus.normal);
    expect(response.vaultStatus).toContain(PlatformStatus.normal);
    expect(response.databaseStatus).toContain(PlatformStatus.down);
    expect(response.cyclrStatus).toContain(PlatformStatus.normal);
    expect(response.coinbase).toContain(PlatformStatus.normal);
    expect(response.cryptoCompare).toContain(PlatformStatus.normal);
  });

  it(".getDetailedStatus() should return down when coinbase price api is not available", async () => {
    mocks.bitcoinService.getCoinbaseExchangeRate = async () => { return { success: false, exchangeRate: null } }

    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    console.log(response)
    expect(response.adminMessage).toContain("The system is down as of");
    expect(response.systemStatus).toContain(PlatformStatus.down);
    expect(response.appIdStatus).toContain(PlatformStatus.normal);
    expect(response.vaultStatus).toContain(PlatformStatus.normal);
    expect(response.databaseStatus).toContain(PlatformStatus.normal);
    expect(response.cyclrStatus).toContain(PlatformStatus.normal);
    expect(response.coinbase).toContain(PlatformStatus.down);
    expect(response.cryptoCompare).toContain(PlatformStatus.normal);
  });

  it(".getDetailedStatus() should return down when crypto compare price api is not available", async () => {
    mocks.bitcoinService.getCryptoCompareExchangeRate = async () => { return { success: false, exchangeRate: null } }

    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    console.log(response)
    expect(response.adminMessage).toContain("The system is down as of");
    expect(response.systemStatus).toContain(PlatformStatus.down);
    expect(response.appIdStatus).toContain(PlatformStatus.normal);
    expect(response.vaultStatus).toContain(PlatformStatus.normal);
    expect(response.databaseStatus).toContain(PlatformStatus.normal);
    expect(response.cyclrStatus).toContain(PlatformStatus.normal);
    expect(response.coinbase).toContain(PlatformStatus.normal);
    expect(response.cryptoCompare).toContain(PlatformStatus.down);
  });

  it(".getDetailedStatus() should return down when cyclr Services is not available", async () => {
    mocks.cyclrService.getStatus = jest.fn().mockRejectedValueOnce(<AxiosResponse>{
      status: HttpStatus.BAD_REQUEST,
      statusText: "Error"
    });

    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    expect(response.adminMessage).toContain("The system is down as of");
    expect(response.systemStatus).toContain(PlatformStatus.down);
    expect(response.appIdStatus).toContain(PlatformStatus.normal);
    expect(response.vaultStatus).toContain(PlatformStatus.normal);
    expect(response.databaseStatus).toContain(PlatformStatus.normal);
    expect(response.cyclrStatus).toContain(PlatformStatus.down);
    expect(response.coinbase).toContain(PlatformStatus.normal);
    expect(response.cryptoCompare).toContain(PlatformStatus.normal);
  });

  it(".getDetailedStatus() should return normal and no cyclr status when cyclrSystem feature flag is disabled", async () => {
    mocks.featureFlagService.getSystemFeatureFlagList = jest.fn().mockResolvedValue(<Array<any>>
      [{
        cyclrSystem: false
      }]
    );

    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    expect(response.adminMessage).toContain("All systems are operational as of");
    expect(response.systemStatus).toContain(PlatformStatus.normal);
    expect(response.appIdStatus).toContain(PlatformStatus.normal);
    expect(response.vaultStatus).toContain(PlatformStatus.normal);
    expect(response.databaseStatus).toContain(PlatformStatus.normal);
    expect(response.coinbase).toContain(PlatformStatus.normal);
    expect(response.cryptoCompare).toContain(PlatformStatus.normal);
    expect(response.cyclrStatus).not.toBeTruthy();
  });

  it(".getDetailedStatus() should return down and maintenance mode status when maintenance mode is set to true", async () => {
    mocks.featureFlagService.getSystemFeatureFlagList = jest.fn().mockResolvedValue(<Array<any>>
      [{
        cyclrSystem: false
      }]
    );
    mocks.db.systemMaintenance.find = jest.fn().mockImplementation(() => [{ maintenance: true }])

    const response: PlatformApiResponse = await platformStatusService.getDetailedStatus();
    expect(response.adminMessage).toContain("The system is down as of");
    expect(response.maintenanceMode).toContain(PlatformStatus.maintenance);
    expect(response.systemStatus).toContain(PlatformStatus.down);
    expect(response.appIdStatus).toContain(PlatformStatus.normal);
    expect(response.vaultStatus).toContain(PlatformStatus.normal);
    expect(response.databaseStatus).toContain(PlatformStatus.normal);
    expect(response.coinbase).toContain(PlatformStatus.normal);
    expect(response.cryptoCompare).toContain(PlatformStatus.normal);
    expect(response.cyclrStatus).not.toBeTruthy();
  });



  // TODO implement test of error thrown by PlatformStatusService
});
