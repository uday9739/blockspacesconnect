import { DateTime } from "luxon";
import { BitcoinService } from "../../networks/bitcoin/services/BitcoinService";
import { PlatformStatus } from "@blockspaces/shared/models/platform";

export async function checkCoinbaseStatus(bitcoinService: BitcoinService) {
  const timestampMillis = DateTime.now().toMillis();
  const timestamp = DateTime.fromMillis(timestampMillis)
    .startOf('minute')
    .set({ minute: Math.floor(DateTime.fromMillis(timestampMillis).minute / 5) * 5 })
    .toMillis();
  try {
    const response = await bitcoinService.getCoinbaseExchangeRate(timestamp);
    return response.success ? PlatformStatus.normal : PlatformStatus.down;
  } catch (err) {
    return PlatformStatus.down;
  }
}

export async function checkCryptoCompareStatus(bitcoinService: BitcoinService) {
  const timestampMillis = DateTime.now().toMillis();
  const timestamp = DateTime.fromMillis(timestampMillis)
    .startOf('minute')
    .set({ minute: Math.floor(DateTime.fromMillis(timestampMillis).minute / 5) * 5 })
    .toMillis();
  try {
    const response = await bitcoinService.getCryptoCompareExchangeRate(timestamp);
    return response.success ? PlatformStatus.normal : PlatformStatus.down;
  } catch (err) {
    return PlatformStatus.down;
  }
}