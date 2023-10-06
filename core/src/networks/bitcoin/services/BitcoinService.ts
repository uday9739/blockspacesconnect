import { Inject, Injectable } from "@nestjs/common";
import { HttpService } from "@blockspaces/shared/services/http";
import { EnvironmentVariables, ENV_TOKEN } from "../../../env";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { isErrorStatus } from '@blockspaces/shared/helpers/http';
import { ConnectDbDataContext } from '../../../connect-db/services/ConnectDbDataContext';
import { DateTime } from 'luxon';
import { AmountReference, PriceReference } from '@blockspaces/shared/models/lightning/Invoice';

@Injectable()
export class BitcoinService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly db: ConnectDbDataContext
  ) {
    logger.setModule(this.constructor.name); }


  getBitcoinPrice = async (timestampMillis: number, currency: string = 'usd'): Promise<PriceReference> => {
    // Round the timestamp to the nearest 5 minutes
    const timestamp = DateTime.fromMillis(timestampMillis)
      .startOf('minute')
      .set({ minute: Math.floor(DateTime.fromMillis(timestampMillis).minute / 5) * 5 })
      .toMillis();

    // If the currency is BTC or sats, we can just return a constant value
    const oneBitcoin: PriceReference = { timestamp: timestamp, currency: currency, exchangeRate: 1}
    const hundredMillionSats: PriceReference = { timestamp: timestamp, currency: currency, exchangeRate: 100_000_000 }
    if (currency.toLowerCase() === 'btc') return oneBitcoin
    if (currency.toLowerCase() === 'sats') return hundredMillionSats

    // Get the price from mongo in this 5 minute interval.
    const priceLookup: PriceReference = await this.db.bitcoinPrices.findOne({ timestamp: timestamp, currency: currency });
    if (priceLookup && priceLookup.exchangeRate !== 0) return priceLookup;
    
    this.logger.info("MONGO: getBitcoinPrice() not found, fetching from exchanges.", null, { timestamp: timestamp, currency: currency, priceLookup: priceLookup });
    
    // Get the price from Coinbase and CryptoCompare
    const coinbase = await this.getCoinbaseExchangeRate(timestamp, currency)
    const cryptoCompare = await this.getCryptoCompareExchangeRate(timestamp, currency)
    
    const lastKnownMongoPrice = await this.db.bitcoinPrices.findOne({}, { sort: { timestamp: -1 }})

    const exchangeRate = 
      // If both succeed, average the two
      coinbase.success && cryptoCompare.success ?
        (coinbase.exchangeRate + cryptoCompare.exchangeRate) / 2 :
      // If coinbase succeeds, use coinbase
      coinbase.success && !cryptoCompare.success ?
        coinbase.exchangeRate :
      // If coinbase fails, use cryptoCompare
      !coinbase.success && cryptoCompare.success ?
        cryptoCompare.exchangeRate :
      // If both fail, use the latest known price
      lastKnownMongoPrice.exchangeRate
    
    const result: PriceReference = { timestamp: timestamp, currency: currency, exchangeRate: exchangeRate };

    await this.db.bitcoinPrices.findOneAndUpdate({ timestamp: timestamp, currency: currency }, result, {upsert: true}).catch(_ => {});
    return result;
  };

  getCoinbaseExchangeRate = async (timestamp, currency: string = 'usd'): Promise<{success: boolean, exchangeRate: number}> => {
    const date = DateTime.fromMillis(timestamp).toISODate();

    const coinbase = await this.httpService.request({
      url: this.env.lightning.btcPriceUrl,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      params: {
        currency: currency,
        date: date,
      }
    })

    if (isErrorStatus(coinbase.status)) {
      this.logger.error("COINBASE: getBitcoinPrice() request failed!", null, { data: coinbase.data, statusText: coinbase.statusText, status: coinbase.status, timestamp: timestamp, currency: currency });
      return { success: false, exchangeRate: null }
    }

    const coinbaseExchangeRate = parseFloat(coinbase?.data?.data?.amount ?? "0.00");

    if (coinbaseExchangeRate === 0) {
      this.logger.error("COINBASE: getBitcoinPrice() request failed!", null, { data: coinbase.data, statusText: coinbase.statusText, status: coinbase.status, timestamp: timestamp, currency: currency });
      return {success: false, exchangeRate: null};
    }

    return { success: true, exchangeRate: coinbaseExchangeRate };
  }

  getCryptoCompareExchangeRate = async (timestamp, currency: string = 'usd'): Promise<{success: boolean, exchangeRate: number}> => {
    // Convert the local time to midnight GMT for crypto compare lookup
    const formatted = DateTime.fromMillis(timestamp).toSeconds()
    const time = DateTime.fromSeconds(formatted).setZone('Etc/GMT').set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toSeconds();

    const cryptoCompare = await this.httpService.request({
      url: this.env.lightning.fallbackPriceUrl,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Apikey ${this.env.lightning.cryptoCompareKey}`
      },
      params: {
        fsym: "BTC",
        tsym: "USD",
        limit: 20,
        toTs: time
      }
    })

    if (isErrorStatus(cryptoCompare.status)) {
      this.logger.error("CRYPTO COMPARE: getBitcoinPrice() request failed!", null, { data: cryptoCompare.data, statusText: cryptoCompare.statusText, status: cryptoCompare.status, timestamp: timestamp, currency: currency });
      return { success: false, exchangeRate: null}
    }
    // Find the timestamp we are looking for and average the high/low
    const found = cryptoCompare.data.Data.Data.find(res => res.time === time) ?? { low: 0, high: 0 }
    const average = ((found.low + found.high) / 2).toFixed(2) ?? "0.00"

    if (average === "0.00") {
      this.logger.error("CRYPTO COMPARE: getBitcoinPrice() request failed!", null, { data: cryptoCompare.data, statusText: cryptoCompare.statusText, status: cryptoCompare.status, timestamp: timestamp, currency: currency });
      return {success: false, exchangeRate: null};
    }

    const cryptoCompareExchangeRate = parseFloat(average)
    
    return { success: true, exchangeRate: cryptoCompareExchangeRate };
  }

  convertInvoiceToBtc = async (amount: number, timestampMillis: number, currency?: string): Promise<any> => {
    const priceRes = await this.getBitcoinPrice(timestampMillis, currency || 'USD');
    if (!priceRes) {
      this.logger.error("convertInvoiceToBtc() conversion failed", null,{ response: priceRes });
      return null;
    }
    const priceRef = priceRes;
    const result = {
      exchangeRate: priceRef.exchangeRate,
      invoice: [
        { amount: amount, currency: priceRef.currency },
        { amount: parseFloat((amount / parseFloat(priceRef.exchangeRate.toString())).toFixed(8)), currency: 'BTC' }
      ]
    };
    return result;
  };

  convertBtcToFiat = async (btc: number, timestampMillis: number, currency: string = 'USD'): Promise<any> => {
    const priceRes = await this.getBitcoinPrice(timestampMillis, currency);
    if (!priceRes) {
      this.logger.error("convertBtcToFiat() conversion failed", null, { response: priceRes });
      return null;
    }
    const priceRef = priceRes;
    const result = {
      exchangeRate: priceRef.exchangeRate,
      invoice: [
        { amount: btc, currency: 'BTC' },
        { amount: parseFloat((btc * parseFloat(priceRef.exchangeRate.toString())).toFixed(2)), currency: currency }
      ]
    };
    return result;
  };

  convertInvoice = async (amount: number, baseCurrency: string, targetCurrency: string, timestampMillis: number): Promise<any> => {
    const priceResBase = await this.getBitcoinPrice(timestampMillis, baseCurrency);
    if (!priceResBase) {
      this.logger.error("convertBtcToFiat() conversion failed", null, { response: priceResBase });
      return null;
    }
    const priceResTarget = await this.getBitcoinPrice(timestampMillis, targetCurrency);
    if (!priceResTarget) {
      this.logger.error("convertBtcToFiat() conversion failed", null, { response: priceResTarget });
      return null;
    }
    const exchangeRate = priceResTarget.exchangeRate / priceResBase.exchangeRate;
    const result = {
      exchangeRate: exchangeRate < 0.1
        ? parseFloat(exchangeRate.toPrecision(2))
        : parseFloat(exchangeRate.toFixed(2)),
      invoice: [
        { amount: amount, currency: baseCurrency },
        {
          amount: amount * exchangeRate < 0.1
            ? parseFloat((amount * exchangeRate).toPrecision(2))
            : parseFloat((amount * exchangeRate).toFixed(2)),
          currency: targetCurrency
        }
      ]
    };
    return result;
  };

  getBtcConversion = async (settleDateMillis: number, satsValue: number): Promise<AmountReference> => {
    // Get historic price of bitcoin and fiat value
    const exchangeRate = (await this.getBitcoinPrice(settleDateMillis, "usd")).exchangeRate;
    const btcValue = Number.parseFloat((satsValue / 100000000).toFixed(8));
    const fiatValue = Number.parseFloat((btcValue * exchangeRate).toFixed(2));
    const amount = { fiatValue: fiatValue, currency: "usd", btcValue: btcValue, exchangeRate: exchangeRate };
    return amount;
  };

}
