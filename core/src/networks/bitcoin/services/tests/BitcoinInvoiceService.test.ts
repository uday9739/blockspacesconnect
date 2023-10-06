import { BalanceReference, InvoiceState, InvoiceStatus, OnchainInvoice, OnchainQuote, PriceReference, QuoteStatus } from "@blockspaces/shared/models/lightning/Invoice";
import { HttpResponse, HttpService } from "@blockspaces/shared/services/http";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { EnvironmentVariables } from "../../../../env";
import { BitcoinService } from "../BitcoinService";
import { BitcoinInvoiceService } from "../BitcoinInvoiceService";
import { LndService } from "../../../lightning/lnd/services/LndService";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { EventEmitService } from "../../../../webhooks/services/EventEmitService";
import { User } from "@blockspaces/shared/models/users";

let mockServices: {
  httpService: HttpService;
  env: EnvironmentVariables;
  db: ConnectDbDataContext;
  logger: ConnectLogger;
  bitcoin: BitcoinService;
  lnd: LndService;
  eventEmit: EventEmitService;
};

describe(BitcoinService, () => {
  const start = 1658424252884;
  const end = 1659029052884;
  let bitcoinInvoiceService: BitcoinInvoiceService;

  const timestampMillis = 1658424252884;
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
      }),
      bitcoin: createMock<BitcoinService>(),
      lnd: createMock<LndService>(),
      eventEmit: createMock<EventEmitService>()
    };
    mockServices.env.lightning.btcPriceUrl = "https://api.coinbase.com/v2/prices/spot";
    mockServices.lnd.getPendingTransactions = jest.fn().mockResolvedValue([{address: 'string'}]);
    mockServices.lnd.getBitcoinTransactions = jest.fn().mockResolvedValue([{'dest_address': 'string'}]);
    mockServices.eventEmit.emitOnchainReceived = jest.fn().mockResolvedValue({});
    mockServices.db.users.findOne = jest.fn().mockResolvedValue(createMock<User>());
    bitcoinInvoiceService = new BitcoinInvoiceService(mockServices.httpService, mockServices.env, mockServices.logger, mockServices.lnd, mockServices.bitcoin, mockServices.db, mockServices.eventEmit);
  });
  describe(`BitcoinInvoiceService`, () => {
    describe(`createInvoice`, () => {
      it("should create a new Invoice in Mongo", async () => {
        mockServices.db.bitcoinInvoices.create = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
        const response = await bitcoinInvoiceService.createInvoice("usd", 1, "", "");
        expect(response).toBeDefined();
        expect(response).toStrictEqual(createMock<OnchainInvoice>());
        expect(response).toMatchObject(createMock<OnchainInvoice>());
      }, 10000);
      it("should return NULL when a new Invoice cannot be created in Mongo", async () => {
        const response = await bitcoinInvoiceService.createInvoice("usd", 1, "", "");
        expect(response).toBeNull();
      }, 10000);
      it("should ERROR when passing zero value for invoice amount", async () => {
        try {
          await bitcoinInvoiceService.createInvoice("usd", 0, "", "");
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      }, 10000);
      it("should ERROR when passing null value for invoice amount", async () => {
        try {
          await bitcoinInvoiceService.createInvoice("usd", null, "", "");
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      }, 10000);
    }); // END createInvoice

  });
  describe(`generateQuote`, () => {
    it("should generate lightning quote and save to Mongo", async () => {
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(createMock<OnchainInvoice>({
        status: InvoiceStatus.PENDING,
        amount: {
          fiatValue: 1,
          currency: "BTC"
        }
      }));
      mockServices.bitcoin.convertInvoiceToBtc = jest.fn().mockResolvedValue({
        exchangeRate: 1,
        invoice: [{
          amount: 1,
          currency: `BTC`,
        },
        {
          amount: 1,
          currency: 'USD'
        }]
      });
      mockServices.db.bitcoinQuotes.create = jest.fn().mockResolvedValue(createMock<OnchainQuote>());
      const response = await bitcoinInvoiceService.generateQuote('some-invoice-id', 0, 'some-tenant-id');
      expect(response).toMatchObject(createMock<OnchainQuote>());
    });
    it("should throw an HttpException 404, if the invoice is not found in Mongo.", async () => {
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(null);
      try {
        await bitcoinInvoiceService.generateQuote('some-invoice-id', 0, 'some-tenant-id');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
    it("should throw an HttpException 400, if the Invoice Status not pending.", async () => {
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(createMock<OnchainInvoice>({
        status: InvoiceStatus.PAID
      }));
      try {
        await bitcoinInvoiceService.generateQuote('some-invoice-id', 0, 'some-tenant-id');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
    it("should throw an HttpException 400 when creating Quote in Mongo fails.", async () => {
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(createMock<OnchainInvoice>({
        status: InvoiceStatus.PENDING,
        amount: {
          fiatValue: 1,
          currency: "BTC"
        }
      }));
      mockServices.bitcoin.convertInvoiceToBtc = jest.fn().mockResolvedValue({
        exchangeRate: 1,
        invoice: [{
          amount: 1,
          currency: `BTC`,
        },
        {
          amount: 1,
          currency: 'USD'
        }]
      });
      mockServices.db.bitcoinQuotes.create = async () => {
        throw new Error(`some-error`);
      };
      try {
        await bitcoinInvoiceService.generateQuote('some-invoice-id', 0, 'some-tenant-id');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  }); // END generateQuote
  describe(`getInvoiceStatus`, () => {
    it("should query, check, and updates the statuses of quotes and invoices with InvoiceState.CANCELED", async () => {
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
      mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
      mockServices.db.bitcoinQuotes.find = jest.fn().mockResolvedValue(createMock<OnchainQuote[]>([createMock<OnchainQuote>(), createMock<OnchainQuote>()]));
      mockServices.db.bitcoinQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
      mockServices.db.bitcoinInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
      mockServices.db.bitcoinQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
      const response: OnchainInvoice = await bitcoinInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
      expect(response).toMatchObject(createMock<OnchainInvoice>());
    }, 10000);
    it("should query, check, and updates the statuses of quotes and invoices with InvoiceState.ACCEPTED", async () => {
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
      mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
      mockServices.db.bitcoinQuotes.find = jest.fn().mockResolvedValue(createMock<OnchainQuote[]>([createMock<OnchainQuote>(), createMock<OnchainQuote>()]));
      mockServices.db.bitcoinQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
      mockServices.db.bitcoinInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
      mockServices.db.bitcoinQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
      const response: OnchainInvoice = await bitcoinInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
      expect(response).toMatchObject(createMock<OnchainInvoice>());
    }, 10000);
    it("should query, check, and updates the statuses of quotes and invoices with InvoiceState.OPEN", async () => {
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
      mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
      mockServices.db.bitcoinQuotes.find = jest.fn().mockResolvedValue(createMock<OnchainQuote[]>([createMock<OnchainQuote>(), createMock<OnchainQuote>()]));
      mockServices.db.bitcoinQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
      mockServices.db.bitcoinInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
      mockServices.db.bitcoinQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
      const response: OnchainInvoice = await bitcoinInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
      expect(response).toMatchObject(createMock<OnchainInvoice>());
    }, 10000);
    it("should query, check, and updates the statuses of quotes and invoices with InvoiceState.SETTLED", async () => {
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
      mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
      mockServices.db.bitcoinQuotes.find = jest.fn().mockResolvedValue(createMock<OnchainQuote[]>([
        {
          quoteId: 'quoteId',
          invoiceId: 'some-invoice-id',
          tenantId: 'tenantId',
          expiration: 0,
          status: QuoteStatus.OPEN,
          amount: {
            fiatValue: 100,
            currency: 'usd',
            btcValue: 100,
            exchangeRate: 100
          },
          uri: 'string'
        }
      ]));
      mockServices.db.bitcoinQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);

      mockServices.db.bitcoinInvoices.model.updateOne = jest.fn();
      mockServices.db.bitcoinQuotes.model.deleteMany = jest.fn();

      mockServices.db.bitcoinInvoices.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
      const response: OnchainInvoice = await bitcoinInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
      expect(response).toMatchObject(createMock<OnchainInvoice>());
    }, 10000);
    it("should throw HttpException when Invoice is not found in Mongo", async () => {
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(null);
      mockServices.db.bitcoinInvoices.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
      mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
      mockServices.db.bitcoinQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
      mockServices.db.bitcoinInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
      mockServices.db.bitcoinQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
      try {
        await bitcoinInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
      } catch (err) {
        // const error = err as HttpException;
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toStrictEqual('onchain invoiceId: some-invoice-id not found in MongoDB.');
        expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
    it("should throw HttpException when Lightning Node is not found in Mongo", async () => {
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
      mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      mockServices.db.bitcoinQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
      mockServices.db.bitcoinInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
      mockServices.db.bitcoinQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
      try {
        await bitcoinInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
      } catch (err) {
        // const error = err as HttpException;
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toStrictEqual('Node data for tenantId: some-tenant-id not found.');
        expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  }); // END getInvoiceStatus
});