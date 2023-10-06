import { PriceReference } from "@blockspaces/shared/models/lightning/Invoice";
import { HttpResponse, HttpService } from "@blockspaces/shared/services/http";
import { HttpStatus } from "@nestjs/common";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { EnvironmentVariables } from "../../../../env";
import { BitcoinService } from "../BitcoinService";

let mockServices: {
  httpService: HttpService;
  env: EnvironmentVariables;
  db: ConnectDbDataContext;
  logger: ConnectLogger;
};

describe(BitcoinService, () => {
  let bitcoinService: BitcoinService;

  const timestampMillis = 1658424252884;

  let mockData: {
    priceReference: PriceReference;
  }

  beforeEach(async () => {
    mockServices = {
      db: createMock<ConnectDbDataContext>(),
      env: createMock<EnvironmentVariables>(),
      httpService: createMock<HttpService>(),
      logger: createMock<ConnectLogger>({
        // info: jest.fn(),
        // debug: jest.fn(),
        // error: jest.fn(),
        // trace: jest.fn(),
        // log: jest.fn()
      })
    };
    mockServices.env.lightning.btcPriceUrl = "https://api.coinbase.com/v2/prices/spot";
    mockData = {
      priceReference: createMock<PriceReference>({exchangeRate: 1001.00})
    }
    bitcoinService = new BitcoinService(mockServices.httpService, mockServices.env, mockServices.logger, mockServices.db);
  });
  describe(`BitcoinService`, () => {
    describe(`getBitcoinPrice`, () => {
      it(`should return a BTC Price Reference from Mongo.`, async () => {
        mockServices.db.bitcoinPrices.findOne = jest.fn().mockResolvedValue(createMock<PriceReference>({exchangeRate: 16800.0}));
        const result = await bitcoinService.getBitcoinPrice(timestampMillis, "USD");
        expect(result.exchangeRate).toBe(16800.0);
      }, 10000);
      it(`should return the average of coinbase and cryptocompare.`, async () => {
        const findOne = jest.fn()
          .mockReturnValueOnce(null)
          .mockReturnValueOnce(createMock<PriceReference>({exchangeRate: 1001.00}))

        mockServices.db.bitcoinPrices.findOne = findOne
        bitcoinService.getCoinbaseExchangeRate = jest.fn().mockResolvedValue({success: true, exchangeRate: 1000.00});
        bitcoinService.getCryptoCompareExchangeRate = jest.fn().mockResolvedValue({success: true, exchangeRate: 1100.00});
        
        mockServices.db.bitcoinPrices.findOne = findOne
        
        mockServices.db.bitcoinPrices.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<PriceReference>());

        const result = await bitcoinService.getBitcoinPrice(timestampMillis, "USD");

        expect(result.exchangeRate).toBe(1050.00);
      }, 10000);
      it(`should return coinbase if cryptocompare fails.`, async () => {
        const findOne = jest.fn()
          .mockReturnValueOnce(null)
          .mockReturnValueOnce(createMock<PriceReference>({exchangeRate: 1001.00}))

        mockServices.db.bitcoinPrices.findOne = findOne
        bitcoinService.getCoinbaseExchangeRate = jest.fn().mockResolvedValue({success: true, exchangeRate: 1000.00});
        bitcoinService.getCryptoCompareExchangeRate = jest.fn().mockResolvedValue({success: false, exchangeRate: null});
        
        mockServices.db.bitcoinPrices.findOne = findOne
        
        mockServices.db.bitcoinPrices.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<PriceReference>());

        const result = await bitcoinService.getBitcoinPrice(timestampMillis, "USD");

        expect(result.exchangeRate).toBe(1000.00);
      }, 10000);

      it(`should return cryptocompare if coinbase fails.`, async () => {
        const findOne = jest.fn()
          .mockReturnValueOnce(null)
          .mockReturnValueOnce(createMock<PriceReference>({exchangeRate: 1001.00}))

        mockServices.db.bitcoinPrices.findOne = findOne
        bitcoinService.getCoinbaseExchangeRate = jest.fn().mockResolvedValue({success: false, exchangeRate: null});
        bitcoinService.getCryptoCompareExchangeRate = jest.fn().mockResolvedValue({success: true, exchangeRate: 1100.00});
        
        mockServices.db.bitcoinPrices.findOne = findOne
        
        mockServices.db.bitcoinPrices.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<PriceReference>());

        const result = await bitcoinService.getBitcoinPrice(timestampMillis, "USD");

        expect(result.exchangeRate).toBe(1100.00);
      }, 10000);
      it(`should return latest mongo entry if cryptocompare and coinbase fails.`, async () => {
        const findOne = jest.fn()
          .mockReturnValueOnce(null)
          .mockReturnValueOnce(createMock<PriceReference>({exchangeRate: 1001.00}))

        mockServices.db.bitcoinPrices.findOne = findOne
        bitcoinService.getCoinbaseExchangeRate = jest.fn().mockResolvedValue({success: false, exchangeRate: null});
        bitcoinService.getCryptoCompareExchangeRate = jest.fn().mockResolvedValue({success: false, exchangeRate: null});
        
        mockServices.db.bitcoinPrices.findOne = findOne
        
        mockServices.db.bitcoinPrices.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<PriceReference>());

        const result = await bitcoinService.getBitcoinPrice(timestampMillis, "USD");

        expect(result.exchangeRate).toBe(1001.00);
      }, 10000);
    }); // END getBitcoinPrice

    describe(`convertInvoiceToBtc`, () => {
      it(`should return a converting invoice amount.`, async () => {
        bitcoinService.getBitcoinPrice = jest.fn().mockResolvedValueOnce(createMock<PriceReference>({
          exchangeRate: 20000,
          currency: `USD`,
        }));

        const result = await bitcoinService.convertInvoiceToBtc(100, timestampMillis, "USD");
        expect(result).toBeDefined();
      });
      it(`should return NULL when BTC Price Reference from Mongo is not found.`, async () => {
        bitcoinService.getBitcoinPrice = jest.fn().mockResolvedValueOnce(null);

        const result = await bitcoinService.convertInvoiceToBtc(100, timestampMillis, "USD");
        expect(result).toBeNull();
      });
    }); // END convertInvoiceToBtc

    describe(`convertInvoice`, () => {
      it(`should return a converting invoice amount.`, async () => {
        bitcoinService.getBitcoinPrice = jest.fn().mockResolvedValueOnce(createMock<PriceReference>({
          exchangeRate: 1,
          currency: `btc`,
        })).mockResolvedValueOnce(createMock<PriceReference>({
          exchangeRate: 100000000,
          currency: `sats`,
        }));

        const result = bitcoinService.convertInvoice(1, 'btc', 'sats', timestampMillis);
        const expected = {
          exchangeRate: 100_000_000,
          invoice: [
            { amount: 1, currency: 'btc' },
            { amount: 100_000_000, currency: 'sats' }
          ]
        };
        expect(result).resolves.toMatchObject(expected);
      });
      it(`should return null when getPrice fails`, async () => {
        bitcoinService.getBitcoinPrice = jest.fn().mockResolvedValueOnce(null);

        const result = bitcoinService.convertInvoice(100, 'usd', 'usd', timestampMillis);
        expect(result).resolves.toBeNull();
      });
      it(`should return NULL when BTC Price Reference from Mongo is not found.`, async () => {
        bitcoinService.getBitcoinPrice = jest.fn().mockResolvedValueOnce({
          exchangeRate: 1000,
          currency: `USD`,
        });
        bitcoinService.getBitcoinPrice = jest.fn().mockResolvedValueOnce(null);

        const result = bitcoinService.convertInvoice(100, 'usd', 'usd', timestampMillis);
        expect(result).resolves.toBeNull();
      });
    });
  });
});