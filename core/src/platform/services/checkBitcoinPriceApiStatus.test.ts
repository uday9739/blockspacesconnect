import { createMock } from "ts-auto-mock";
import { BitcoinService } from "../../networks/bitcoin/services/BitcoinService";
import { HttpService } from "@blockspaces/shared/services/http";
import { EnvironmentVariables } from "../../env";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { checkCoinbaseStatus, checkCryptoCompareStatus } from "./checkBitcoinPriceApiStatus";
import { PlatformStatus } from "@blockspaces/shared/models/platform";

describe("checkBitcoinPriceApiStatus", () => {
  let mocks: {
    httpService: HttpService;
    logger: ConnectLogger;
    env: EnvironmentVariables;
    db: ConnectDbDataContext
  };

  mocks = {
    httpService: createMock<HttpService>(),
    env: createMock<EnvironmentVariables>(),
    logger: createMock<ConnectLogger>(),
    db: createMock<ConnectDbDataContext>()
  };
  const bitcoinService = new BitcoinService(mocks.httpService, mocks.env, mocks.logger, mocks.db);

  it("should return down if the coinbase price api service is down", async () => {
    bitcoinService.getCoinbaseExchangeRate = jest.fn().mockResolvedValue({ success: false, exchangeRate: null });
    const result = await checkCoinbaseStatus(bitcoinService)
    expect(result).toBe(PlatformStatus.down)
  });
  it("should return down if the coinbase price api service is up", async () => {
    bitcoinService.getCoinbaseExchangeRate = jest.fn().mockResolvedValue({ success: true, exchangeRate: 100_000 });
    const result = await checkCoinbaseStatus(bitcoinService)
    expect(result).toBe(PlatformStatus.normal)
  });
  it("should return down if the cryptocompare price api service is down", async () => {
    bitcoinService.getCryptoCompareExchangeRate = jest.fn().mockResolvedValue({ success: false, exchangeRate: null });
    const result = await checkCryptoCompareStatus(bitcoinService)
    expect(result).toBe(PlatformStatus.down)
  });
    it("should return down if the cryptocompare price api service is up", async () => {
    bitcoinService.getCryptoCompareExchangeRate = jest.fn().mockResolvedValue({ success: true, exchangeRate: 100_000 });
    const result = await checkCryptoCompareStatus(bitcoinService)
    expect(result).toBe(PlatformStatus.normal)
  });
});
