import { LightningChartData, LightningChartCategories, LightningChartTotalLabels } from "@blockspaces/shared/dtos/lightning";
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { ErpMetadata, IntegrationTransactionReference } from "@blockspaces/shared/models/lightning/Integration";
import { AmountReference, BalanceReference, BitcoinTxnReference, CancelBolt11, ChannelActivity, ChannelActivityReference, InvoiceReference, InvoiceState, InvoiceStatus, OnchainInvoice, PaymentReference, PaymentStatus, QuoteReference, QuoteStatus } from "@blockspaces/shared/models/lightning/Invoice";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { AddInvoiceResponse, ChannelBalanceResponse, Invoice, InvoiceHTLC, ListPaymentsResponse, PayReq } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ConnectLogger } from "../../../../../logging/ConnectLogger";
import { createMock, createMockList } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../../connect-db/services/ConnectDbDataContext";
import { BitcoinService } from "../../../../bitcoin/services/BitcoinService";
import { LndService } from "../../../lnd/services/LndService";
import { LightningInvoiceService } from "../LightningInvoiceService";
import { EventEmitService } from "../../../../../webhooks/services/EventEmitService";
import { WebhookEventRecord } from "../../../../../../../shared/models/webhooks/WebhookTypes";
import { BitcoinInvoiceService } from "../../../../bitcoin/services/BitcoinInvoiceService";
import { User } from "@blockspaces/shared/models/users";


describe(LightningInvoiceService, () => {
  // For chart intervals
  const start = 1658424252884;
  const end = 1659029052884;
  const timestamps = [1658376000000, 1658462400000, 1658548800000, 1658635200000, 1658721600000, 1658808000000, 1658894400000, 1658980800000];
  const timezone = 'America/New_York';
  let lightningInvoiceService: LightningInvoiceService;
  let mockServices: {
    lndService: LndService,
    bitcoinService: BitcoinService,
    logger: ConnectLogger,
    db: ConnectDbDataContext,
    eventEmitter: EventEmitService,
    bitcoinInvoice: BitcoinInvoiceService
  };

  // Integration object
  const integrationObject = createMock<IntegrationTransactionReference>();
  const erpMetadata: ErpMetadata[] = [{ dataType: "erpInvoiceId", domain: "QBO", value: "1" }]
  beforeEach(() => {
    mockServices = {
      lndService: createMock<LndService>(),
      bitcoinService: createMock<BitcoinService>(),
      logger: createMock<ConnectLogger>({
        // Quite logger for testing.
        // info: jest.fn(),
        // debug: jest.fn(),
        // error: jest.fn(),
        // trace: jest.fn(),
        // log: jest.fn()
      }),
      db: createMock<ConnectDbDataContext>(),
      eventEmitter: createMock<EventEmitService>(),
      bitcoinInvoice: createMock<BitcoinInvoiceService>()
    };
    mockServices.bitcoinInvoice.refreshOnchainTxns = jest.fn().mockResolvedValue(createMock<BitcoinTxnReference>());
    mockServices.bitcoinInvoice.getInvoiceStatus = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
    mockServices.bitcoinInvoice.createInvoice = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
    mockServices.db.users.findOne = jest.fn().mockResolvedValue(createMock<User>());
    mockServices.db.bitcoinInvoices.find = jest.fn().mockResolvedValue(createMock<OnchainInvoice[]>());
    lightningInvoiceService = new LightningInvoiceService(mockServices.bitcoinService, mockServices.lndService, mockServices.logger, mockServices.db, mockServices.eventEmitter, mockServices.bitcoinInvoice);
  });

  describe(`PUBLIC METHODS`, () => {
    describe(`getLightningVolume`, () => {
      it("should calculate the total Fiat transaction volume for a tenant's lightning node. (return 0,0,0)", async () => {
        lightningInvoiceService.refreshAllObjects = jest.fn().mockResolvedValue({
          invoices: createMock<InvoiceReference[]>(),
          payments: createMock<PaymentReference[]>()
        });
        const response = await lightningInvoiceService.getLightningVolume(start, end, `some-tenant-id`);
        expect(response).toStrictEqual({ "totalIn": 0, "totalOut": 0, "totalVolume": 0 });
      }, 10000);
      it("should return total Fiat transaction volume by pay period for a tenant's lightning node. (return 200,0,200)", async () => {
        lightningInvoiceService.refreshAllObjects = jest.fn().mockResolvedValue({
          invoices: [{
            amount: { fiatValue: 100 },
            status: InvoiceStatus.PAID,
            settleTimestamp: start + 10000,
          },
          {
            amount: { fiatValue: 100 },
            status: InvoiceStatus.PAID,
            settleTimestamp: start + 10000,
          }],
          payments: createMock<PaymentReference[]>()
        });

        const response = await lightningInvoiceService.getLightningVolume(start, end, `some-tenant-id`);
        expect(response).toStrictEqual({ "totalIn": 200, "totalOut": 0, "totalVolume": 200 });
      }, 10000);
      it("should return TypeError when no invoices are refreshed.", async () => {
        lightningInvoiceService.refreshAllObjects = jest.fn().mockResolvedValue({
          invoices: null,
          payments: createMock<PaymentReference[]>()
        });
        try {
          await lightningInvoiceService.getLightningVolume(start, end, `some-tenant-id`);
        } catch (error) {
          expect(error).not.toBeNull();
          expect(error).toBeInstanceOf(TypeError);
          expect(error.message).toStrictEqual("Cannot read properties of null (reading 'filter')");
        }
      }, 10000);
      it("should return TypeError when no payments are refreshed.", async () => {
        lightningInvoiceService.refreshAllObjects = jest.fn().mockResolvedValue({
          invoices: createMock<InvoiceReference[]>(),
          payments: null
        });
        try {
          await lightningInvoiceService.getLightningVolume(start, end, `some-tenant-id`);
        } catch (error) {
          expect(error).not.toBeNull();
          expect(error).toBeInstanceOf(TypeError);
          expect(error.message).toStrictEqual("Cannot read properties of null (reading 'filter')");
        }
      }, 10000);
    }); // END getLightningVolume
    describe(`createCanonicalInvoice`, () => {
      it("both: should create a new Invoice in Mongo", async () => {
        mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(null)
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null)
        mockServices.db.lightningInvoices.create = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        const response = await lightningInvoiceService.createCanonicalInvoice("usd", 1, "", "", integrationObject, []);
        expect(response).toBeDefined();
        expect(response).toMatchObject({ offchain: createMock<InvoiceReference>(), onchain: createMock<OnchainInvoice>() });
      }, 10000);
      it("both: should return an existing erp invoice when erp metadata exists and has been created before", async () => {
        mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(createMock<OnchainInvoice>())
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>())
        mockServices.db.lightningInvoices.create = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        const response = await lightningInvoiceService.createCanonicalInvoice("usd", 1, "", "", integrationObject, erpMetadata);
        expect(response).toBeDefined();
        expect(response).toMatchObject({ offchain: createMock<InvoiceReference>(), onchain: createMock<OnchainInvoice>() });
      })
      it("both: should return NULL when a new Invoice cannot be created in Mongo", async () => {
        mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(null)
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null)
        const response = await lightningInvoiceService.createCanonicalInvoice("usd", 1, "", "", integrationObject, []);
        expect(response).toBeNull();
      }, 10000);
      it("both: should ERROR when passing zero value for invoice amount", async () => {
        mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(null)
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null)
        try {
          await lightningInvoiceService.createCanonicalInvoice("usd", 0, "", "", integrationObject, []);
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      }, 10000);
      it("both: should ERROR when passing null value for invoice amount", async () => {
        mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(null)
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null)
        try {
          await lightningInvoiceService.createCanonicalInvoice("usd", null, "", "", integrationObject, []);
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      }, 10000);
    }); // END createCanonicalInvoice
    describe(`createInvoice`, () => {
      it("should create a new Invoice in Mongo", async () => {
        mockServices.db.lightningInvoices.create = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        const response = await lightningInvoiceService.createInvoice("usd", 1, "", "", integrationObject);
        expect(response).toBeDefined();
        expect(response).toStrictEqual(createMock<InvoiceReference>());
        expect(response).toMatchObject(createMock<InvoiceReference>());
      }, 10000);
      it("should return NULL when a new Invoice cannot be created in Mongo", async () => {
        const response = await lightningInvoiceService.createInvoice("usd", 1, "", "", integrationObject);
        expect(response).toBeNull();
      }, 10000);
      it("should ERROR when passing zero value for invoice amount", async () => {
        try {
          await lightningInvoiceService.createInvoice("usd", 0, "", "", integrationObject);
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      }, 10000);
      it("should ERROR when passing null value for invoice amount", async () => {
        try {
          await lightningInvoiceService.createInvoice("usd", null, "", "", integrationObject);
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      }, 10000);
    }); // END createInvoice
    describe(`refreshAllObjects`, () => {
      it("should refresh all Invoices, Payments, and Balances for the given Tenant Id", async () => {
        jest.spyOn(lightningInvoiceService as any, 'refreshInvoices').mockResolvedValueOnce(createMock<InvoiceReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshPayments').mockResolvedValueOnce(createMock<PaymentReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshChannelActivity').mockResolvedValueOnce(createMock<ChannelActivityReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshBalances').mockResolvedValueOnce(createMock<BalanceReference[]>());

        const response = await lightningInvoiceService.refreshAllObjects(`some-tenant-id`);
        expect(response).toMatchObject({ "balances": [], "channelEvents": [], "invoices": [], "payments": [], "onchainInvoices": [] });
      }, 10000);
      it("should return Invoices = null when no PAID invoices by Tenant Id are found in Mongo", async () => {
        jest.spyOn(lightningInvoiceService as any, 'refreshInvoices').mockResolvedValueOnce(null);
        jest.spyOn(lightningInvoiceService as any, 'refreshPayments').mockResolvedValueOnce(createMock<PaymentReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshChannelActivity').mockResolvedValueOnce(createMock<ChannelActivityReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshBalances').mockResolvedValueOnce(createMock<BalanceReference[]>());

        const response = await lightningInvoiceService.refreshAllObjects(`some-tenant-id`);
        expect(response.invoices).toBeNull();
      }, 10000);
      it("should return Payments = null when no payments for a Tenant Id are found in Mongo", async () => {
        jest.spyOn(lightningInvoiceService as any, 'refreshInvoices').mockResolvedValueOnce(createMock<InvoiceReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshPayments').mockResolvedValueOnce(null);
        jest.spyOn(lightningInvoiceService as any, 'refreshChannelActivity').mockResolvedValueOnce(createMock<ChannelActivityReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshBalances').mockResolvedValueOnce(createMock<BalanceReference[]>());

        const response = await lightningInvoiceService.refreshAllObjects(`some-tenant-id`);
        expect(response.payments).toBeNull();
      }, 10000);
      it("should return ChannelEvent = null when no Channel Activity for a Tenant Id are found in Mongo", async () => {
        jest.spyOn(lightningInvoiceService as any, 'refreshInvoices').mockResolvedValueOnce(createMock<InvoiceReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshPayments').mockResolvedValueOnce(createMock<PaymentReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshChannelActivity').mockResolvedValueOnce(null);
        jest.spyOn(lightningInvoiceService as any, 'refreshBalances').mockResolvedValueOnce(createMock<BalanceReference[]>());

        const response = await lightningInvoiceService.refreshAllObjects(`some-tenant-id`);
        expect(response.channelEvents).toBeNull();
      }, 10000);
      it("should return refrehsOnchainTxns = null when no Onchain Transactions for a Tenant Id are found in Mongo", async () => {
        jest.spyOn(lightningInvoiceService as any, 'refreshInvoices').mockResolvedValueOnce(createMock<InvoiceReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshPayments').mockResolvedValueOnce(createMock<PaymentReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshChannelActivity').mockResolvedValueOnce(createMock<ChannelActivityReference[]>());
        jest.spyOn(lightningInvoiceService as any, 'refreshBalances').mockResolvedValueOnce(createMock<BalanceReference[]>());
        mockServices.bitcoinInvoice.refreshOnchainTxns = jest.fn().mockResolvedValue(null);

        const response = await lightningInvoiceService.refreshAllObjects(`some-tenant-id`);
        expect(response.onchainTxns).toBeNull();
      }, 10000);
    }); // END refreshAllObjects
    describe(`getCanonicalInvoiceStatus`, () => {
      it("both: should query, check, and updates the statuses of quotes and invoices with InvoiceState.CANCELED", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([createMock<QuoteReference>(), createMock<QuoteReference>()]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<Invoice.AsObject>({
          state: InvoiceState.CANCELED,
          settleDate: start,
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());
        mockServices.db.lightningInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        const response: { onchain: OnchainInvoice, offchain: InvoiceReference } = await lightningInvoiceService.getCanonicalInvoiceStatus(`some-invoice-id`, 'some-invoice-id', `some-tenant-id`);
        expect(response).toMatchObject({ onchain: createMock<OnchainInvoice>(), offchain: createMock<InvoiceReference>() });
      }, 10000);
      it("both: should query, check, and updates the statuses of quotes and invoices with InvoiceState.ACCEPTED", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([createMock<QuoteReference>(), createMock<QuoteReference>()]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<Invoice.AsObject>({
          state: InvoiceState.ACCEPTED,
          settleDate: start,
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());
        mockServices.db.lightningInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        const response: { onchain: OnchainInvoice, offchain: InvoiceReference } = await lightningInvoiceService.getCanonicalInvoiceStatus(`some-invoice-id`, 'some-invoice-id', `some-tenant-id`);
        expect(response).toMatchObject({ onchain: createMock<OnchainInvoice>(), offchain: createMock<InvoiceReference>() });
      }, 10000);
      it("both: should query, check, and updates the statuses of quotes and invoices with InvoiceState.OPEN", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([createMock<QuoteReference>(), createMock<QuoteReference>()]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<Invoice.AsObject>({
          state: InvoiceState.OPEN,
          settleDate: start,
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());
        mockServices.db.lightningInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        const response: { onchain: OnchainInvoice, offchain: InvoiceReference } = await lightningInvoiceService.getCanonicalInvoiceStatus(`some-invoice-id`, 'some-invoice-id', `some-tenant-id`);
        expect(response).toMatchObject({ onchain: createMock<OnchainInvoice>(), offchain: createMock<InvoiceReference>() });
      }, 10000);
      it("both: should query, check, and updates the statuses of quotes and invoices with InvoiceState.SETTLED", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([
          {
            quoteId: 'quoteId',
            invoiceId: 'some-invoice-id',
            tenantId: 'some-tenant-id',
            paymentRequest: 'paymentRequest',
            expiration: 0,
            status: QuoteStatus.OPEN,
            channelId: 'string',
            amount: {
              fiatValue: 100,
              currency: 'usd',
              btcValue: 100,
              exchangeRate: 100
            }
          }
        ]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<any>({
          state: QuoteStatus.PAID,
          settleDate: start,
          htlcs: createMock<InvoiceHTLC.AsObject[]>([{
            chanId: "test",
            htlcIndex: 1,
            amtMsat: 1,
            acceptHeight: 1,
            acceptTime: 1,
            resolveTime: 1,
            expiryHeight: 1,
            state: 1,
            customRecordsMap: [],
            mppTotalAmtMsat: 1
          }])
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());

        mockServices.db.lightningInvoices.model.updateOne = jest.fn();
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn();

        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        mockServices.eventEmitter.emitPaymentReceived = jest.fn().mockResolvedValue(createMock<WebhookEventRecord>());
        mockServices.db.lightningInvoices.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        const response: { onchain: OnchainInvoice, offchain: InvoiceReference } = await lightningInvoiceService.getCanonicalInvoiceStatus(`some-invoice-id`, 'some-invoice-id', `some-tenant-id`);
        expect(response).toMatchObject({ onchain: createMock<OnchainInvoice>(), offchain: createMock<InvoiceReference>() });
      }, 10000);
      it("both: should throw HttpException when Invoice is not found in Mongo", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null);
        mockServices.db.lightningInvoices.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([createMock<QuoteReference>(), createMock<QuoteReference>()]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<Invoice.AsObject>({
          state: InvoiceState.CANCELED,
          settleDate: start,
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());
        mockServices.db.lightningInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        try {
          await lightningInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
        } catch (err) {
          // const error = err as HttpException;
          expect(err).toBeInstanceOf(HttpException);
          expect(err.message).toStrictEqual('invoiceId: some-invoice-id not found in MongoDB.');
          expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
        }
      }, 10000);
      it("should throw HttpException when Lightning Node is not found in Mongo", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([createMock<QuoteReference>(), createMock<QuoteReference>()]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<Invoice.AsObject>({
          state: InvoiceState.CANCELED,
          settleDate: start,
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());
        mockServices.db.lightningInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        try {
          await lightningInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
        } catch (err) {
          // const error = err as HttpException;
          expect(err).toBeInstanceOf(HttpException);
          expect(err.message).toStrictEqual('Node data for tenantId: some-tenant-id not found.');
          expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
        }
      }, 10000);
    }); // END getInvoiceStatus
    describe(`getInvoiceStatus`, () => {
      it("should query, check, and updates the statuses of quotes and invoices with InvoiceState.CANCELED", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([createMock<QuoteReference>(), createMock<QuoteReference>()]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<Invoice.AsObject>({
          state: InvoiceState.CANCELED,
          settleDate: start,
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());
        mockServices.db.lightningInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        const response: InvoiceReference = await lightningInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
        expect(response).toMatchObject(createMock<InvoiceReference>());
      }, 10000);
      it("should query, check, and updates the statuses of quotes and invoices with InvoiceState.ACCEPTED", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([createMock<QuoteReference>(), createMock<QuoteReference>()]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<Invoice.AsObject>({
          state: InvoiceState.ACCEPTED,
          settleDate: start,
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());
        mockServices.db.lightningInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        const response: InvoiceReference = await lightningInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
        expect(response).toMatchObject(createMock<InvoiceReference>());
      }, 10000);
      it("should query, check, and updates the statuses of quotes and invoices with InvoiceState.OPEN", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([createMock<QuoteReference>(), createMock<QuoteReference>()]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<Invoice.AsObject>({
          state: InvoiceState.OPEN,
          settleDate: start,
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());
        mockServices.db.lightningInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        const response: InvoiceReference = await lightningInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
        expect(response).toMatchObject(createMock<InvoiceReference>());
      }, 10000);
      it("should query, check, and updates the statuses of quotes and invoices with InvoiceState.SETTLED", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([
          {
            quoteId: 'quoteId',
            invoiceId: 'some-invoice-id',
            tenantId: 'some-tenant-id',
            paymentRequest: 'paymentRequest',
            expiration: 0,
            status: QuoteStatus.OPEN,
            channelId: 'string',
            amount: {
              fiatValue: 100,
              currency: 'usd',
              btcValue: 100,
              exchangeRate: 100
            }
          }
        ]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<any>({
          state: QuoteStatus.PAID,
          settleDate: start,
          htlcs: createMock<InvoiceHTLC.AsObject[]>([{
            chanId: "test",
            htlcIndex: 1,
            amtMsat: 1,
            acceptHeight: 1,
            acceptTime: 1,
            resolveTime: 1,
            expiryHeight: 1,
            state: 1,
            customRecordsMap: [],
            mppTotalAmtMsat: 1
          }])
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());

        mockServices.db.lightningInvoices.model.updateOne = jest.fn();
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn();

        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        mockServices.eventEmitter.emitPaymentReceived = jest.fn().mockResolvedValue(createMock<WebhookEventRecord>());
        mockServices.db.lightningInvoices.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        const response: InvoiceReference = await lightningInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
        expect(response).toMatchObject(createMock<InvoiceReference>());
      }, 10000);
      it("should throw HttpException when Invoice is not found in Mongo", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null);
        mockServices.db.lightningInvoices.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([createMock<QuoteReference>(), createMock<QuoteReference>()]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<Invoice.AsObject>({
          state: InvoiceState.CANCELED,
          settleDate: start,
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());
        mockServices.db.lightningInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        try {
          await lightningInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
        } catch (err) {
          // const error = err as HttpException;
          expect(err).toBeInstanceOf(HttpException);
          expect(err.message).toStrictEqual('invoiceId: some-invoice-id not found in MongoDB.');
          expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
        }
      }, 10000);
      it("should throw HttpException when Lightning Node is not found in Mongo", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
        mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>([createMock<QuoteReference>(), createMock<QuoteReference>()]));
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue(createMock<PayReq.AsObject>());
        mockServices.lndService.trackBolt11 = jest.fn().mockResolvedValue(createMock<Invoice.AsObject>({
          state: InvoiceState.CANCELED,
          settleDate: start,
        }));
        mockServices.db.lightningQuotes.findOneAndDelete = jest.fn().mockResolvedValue(null);
        jest.spyOn(lightningInvoiceService as any, 'updateBalance').mockResolvedValueOnce(createMock<BalanceReference>());
        mockServices.db.lightningInvoices.model.updateOne = jest.fn().mockResolvedValue(true);
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);
        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        try {
          await lightningInvoiceService.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
        } catch (err) {
          // const error = err as HttpException;
          expect(err).toBeInstanceOf(HttpException);
          expect(err.message).toStrictEqual('Node data for tenantId: some-tenant-id not found.');
          expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
        }
      }, 10000);
    }); // END getInvoiceStatus
    describe(`getInvoiceChartData`, () => {
      it('should get invoice data for tenant in chart-friendly format return chart totals, zeros', async () => {
        const totals = { moneyIn: Array(7).fill(0), moneyOut: Array(7).fill(0), timestamps: timestamps, combinedBalances: Array(7).fill(0), offchainBalances: Array(7).fill(0), onchainBalances: Array(7).fill(0) };
        lightningInvoiceService.refreshAllObjects = jest.fn().mockResolvedValue({
          invoices: createMock<InvoiceReference[]>(),
          payments: createMock<PaymentReference[]>(),
          onchainTxns: createMock<BitcoinTxnReference[]>(),
          channelEvents: createMock<ChannelActivityReference[]>(),
        });
        lightningInvoiceService['aggregateTotals'] = jest.fn().mockResolvedValue(totals);
        const expectedResponse: LightningChartData = {
          interval: NetworkDataInterval.DAILY,
          start: start,
          end: end,
          categories: [LightningChartCategories.BALANCE, LightningChartCategories.OFFCHAIN_BALANCE, LightningChartCategories.ONCHAIN_BALANCE, LightningChartCategories.MONEY_IN, LightningChartCategories.MONEY_OUT],
          data: [
            { category: LightningChartCategories.MONEY_IN, values: totals.moneyIn },
            { category: LightningChartCategories.MONEY_OUT, values: totals.moneyOut },
            { category: LightningChartCategories.BALANCE, values: totals.combinedBalances },
            { category: LightningChartCategories.OFFCHAIN_BALANCE, values: totals.offchainBalances },
            { category: LightningChartCategories.ONCHAIN_BALANCE, values: totals.onchainBalances },
          ],
          dataTimestamps: timestamps,
          totals: [
            { label: LightningChartTotalLabels.STARTING_BALANCE, amount: 0 },
            { label: LightningChartTotalLabels.TOTAL_MONEY_IN, amount: 0 },
            { label: LightningChartTotalLabels.TOTAL_MONEY_OUT, amount: 0 },
            { label: LightningChartTotalLabels.ENDING_BALANCE, amount: 0 },
          ],
          timezone: timezone
        };
        const result = await lightningInvoiceService.getInvoiceChartData('tenant', NetworkDataInterval.DAILY, start, end);
        expect(result).toMatchObject(expectedResponse);
      });
      it('should get invoice data for tenant in chart-friendly format return chart totals, starting 1000', async () => {
        const totals = { moneyIn: Array(8).fill(0), moneyOut: Array(8).fill(0), timestamps: timestamps, combinedBalances: Array(8).fill(1000), offchainBalances: Array(8).fill(1000), onchainBalances: Array(8).fill(0) };
        lightningInvoiceService.refreshAllObjects = jest.fn().mockResolvedValue({
          invoices: createMock<InvoiceReference[]>(),
          payments: createMock<PaymentReference[]>(),
          onchainTxns: createMock<BitcoinTxnReference[]>(),
          channelEvents: createMock<ChannelActivityReference[]>(),
        });
        lightningInvoiceService['aggregateTotals'] = jest.fn().mockResolvedValue(totals);
        const expectedResponse: LightningChartData = {
          interval: NetworkDataInterval.DAILY,
          start: start,
          end: end,
          categories: [LightningChartCategories.BALANCE, LightningChartCategories.OFFCHAIN_BALANCE, LightningChartCategories.ONCHAIN_BALANCE, LightningChartCategories.MONEY_IN, LightningChartCategories.MONEY_OUT],
          data: [
            { category: LightningChartCategories.MONEY_IN, values: totals.moneyIn },
            { category: LightningChartCategories.MONEY_OUT, values: totals.moneyOut },
            { category: LightningChartCategories.BALANCE, values: totals.combinedBalances },
            { category: LightningChartCategories.OFFCHAIN_BALANCE, values: totals.offchainBalances },
            { category: LightningChartCategories.ONCHAIN_BALANCE, values: totals.onchainBalances },
          ],
          dataTimestamps: timestamps,
          totals: [
            { label: LightningChartTotalLabels.STARTING_BALANCE, amount: 1000 },
            { label: LightningChartTotalLabels.TOTAL_MONEY_IN, amount: 0 },
            { label: LightningChartTotalLabels.TOTAL_MONEY_OUT, amount: 0 },
            { label: LightningChartTotalLabels.ENDING_BALANCE, amount: 1000 },
          ],
          timezone: timezone
        };
        const result = await lightningInvoiceService.getInvoiceChartData('tenantId', NetworkDataInterval.DAILY, start, end);
        expect(result).toMatchObject(expectedResponse);
      });
      it('should get invoice data for tenant in chart-friendly format return chart totals, with money In', async () => {
        const totals = { moneyIn: Array(8).fill(0), moneyOut: Array(8).fill(0), timestamps: timestamps, combinedBalances: Array(8).fill(1000), offchainBalances: Array(8).fill(1000), onchainBalances: Array(8).fill(0) };
        totals.moneyIn[1] = 1000;
        totals.combinedBalances[0] = 0;
        totals.offchainBalances[0] = 0;
        lightningInvoiceService.refreshAllObjects = jest.fn().mockResolvedValue({
          invoices: createMock<InvoiceReference[]>(),
          payments: createMock<PaymentReference[]>(),
          onchainTxns: createMock<BitcoinTxnReference[]>(),
          channelEvents: createMock<ChannelActivityReference[]>(),
        });
        lightningInvoiceService['aggregateTotals'] = jest.fn().mockResolvedValue(totals);
        const expectedResponse: LightningChartData = {
          interval: NetworkDataInterval.DAILY,
          start: start,
          end: end,
          categories: [LightningChartCategories.BALANCE, LightningChartCategories.OFFCHAIN_BALANCE, LightningChartCategories.ONCHAIN_BALANCE, LightningChartCategories.MONEY_IN, LightningChartCategories.MONEY_OUT],
          data: [
            { category: LightningChartCategories.MONEY_IN, values: totals.moneyIn },
            { category: LightningChartCategories.MONEY_OUT, values: totals.moneyOut },
            { category: LightningChartCategories.BALANCE, values: totals.combinedBalances },
            { category: LightningChartCategories.OFFCHAIN_BALANCE, values: totals.offchainBalances },
            { category: LightningChartCategories.ONCHAIN_BALANCE, values: totals.onchainBalances },
          ],
          dataTimestamps: timestamps,
          totals: [
            { label: LightningChartTotalLabels.STARTING_BALANCE, amount: 0 },
            { label: LightningChartTotalLabels.TOTAL_MONEY_IN, amount: 1000 },
            { label: LightningChartTotalLabels.TOTAL_MONEY_OUT, amount: 0 },
            { label: LightningChartTotalLabels.ENDING_BALANCE, amount: 1000 },
          ],
          timezone: timezone
        };
        const result = await lightningInvoiceService.getInvoiceChartData('tenantId', NetworkDataInterval.DAILY, start, end);
        expect(result).toMatchObject(expectedResponse);
      });
      it('should return Null when refreshAllObjects encounters an ERROR.', async () => {
        const totals = { moneyIn: Array(7).fill(0), moneyOut: Array(7).fill(0), timestamps: timestamps, balances: Array(7).fill(0) };
        lightningInvoiceService['aggregateTotals'] = jest.fn().mockResolvedValue(totals);
        lightningInvoiceService.refreshAllObjects = async () => {
          throw new Error(`some-error`);
        };
        const result = await lightningInvoiceService.getInvoiceChartData('tenantId', NetworkDataInterval.DAILY, start, end);
        expect(result).toBeNull();
      });
      it('should return Null when aggregateTotals encounters an ERROR.', async () => {
        lightningInvoiceService['aggregateTotals'] = async () => {
          throw new Error(`some-error`);
        };
        lightningInvoiceService.refreshAllObjects = jest.fn().mockResolvedValue({
          invoices: createMock<InvoiceReference[]>(),
          payments: createMock<PaymentReference[]>()
        });
        const result = await lightningInvoiceService.getInvoiceChartData('tenantId', NetworkDataInterval.DAILY, start, end);
        expect(result).toBeNull();
      });
    }); // END getInvoiceChartData
    describe(`generateQuote`, () => {
      it("should generate lightning quote and save to Mongo", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>({
          status: InvoiceStatus.PENDING,
          amount: {
            fiatValue: 1,
            currency: "BTC"
          }
        }));
        mockServices.bitcoinService.convertInvoiceToBtc = jest.fn().mockResolvedValue({
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
        mockServices.lndService.generateBolt11 = jest.fn().mockResolvedValue(createMock<AddInvoiceResponse.AsObject>({
          paymentRequest: 'payreq',
        }));
        mockServices.db.lightningQuotes.create = jest.fn().mockResolvedValue(createMock<QuoteReference>());
        const response = await lightningInvoiceService.generateQuote('some-invoice-id', 0, 'some-tenant-id');
        expect(response).toMatchObject(createMock<QuoteReference>());
      });
      it("should throw an HttpException 404, if the invoice is not found in Mongo.", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null);
        try {
          await lightningInvoiceService.generateQuote('some-invoice-id', 0, 'some-tenant-id');
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
        }
      });
      it("should throw an HttpException 400, if the Invoice Status not pending.", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>({
          status: InvoiceStatus.PAID
        }));
        try {
          await lightningInvoiceService.generateQuote('some-invoice-id', 0, 'some-tenant-id');
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      });
      it("should throw an HttpException 400 when creating Quote in Mongo fails.", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>({
          status: InvoiceStatus.PENDING,
          amount: {
            fiatValue: 1,
            currency: "BTC"
          }
        }));
        mockServices.bitcoinService.convertInvoiceToBtc = jest.fn().mockResolvedValue({
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
        mockServices.lndService.generateBolt11 = jest.fn().mockResolvedValue(createMock<AddInvoiceResponse.AsObject>({
          paymentRequest: 'payreq',
        }));
        mockServices.db.lightningQuotes.create = async () => {
          throw new Error(`some-error`);
        };
        try {
          await lightningInvoiceService.generateQuote('some-invoice-id', 0, 'some-tenant-id');
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      });
    }); // END generateQuote
    describe(`generateAnonQuote`, () => {
      it("should generate lightning quote and save to Mongo", async () => {
        mockServices.bitcoinService.convertInvoiceToBtc = jest.fn().mockResolvedValue({
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
        mockServices.lndService.generateBolt11 = jest.fn().mockResolvedValue(createMock<AddInvoiceResponse.AsObject>({
          paymentRequest: 'payreq',
        }));
        mockServices.db.lightningQuotes.create = jest.fn().mockResolvedValue(createMock<QuoteReference>());

        const response = await lightningInvoiceService.generateAnonQuote('some-tenant-id', 300, 'usd', 100, 'some-memo-text');
        expect(response).toMatchObject(createMock<QuoteReference>());
      });
      it("should throw an HttpException 400 when creating Quote in Mongo fails.", async () => {
        mockServices.bitcoinService.convertInvoiceToBtc = jest.fn().mockResolvedValue({
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
        mockServices.lndService.generateBolt11 = jest.fn().mockResolvedValue(createMock<AddInvoiceResponse.AsObject>({
          paymentRequest: 'payreq',
        }));
        mockServices.db.lightningQuotes.create = async () => {
          throw new Error(`some-error`);
        };
        try {
          await lightningInvoiceService.generateAnonQuote('some-tenant-id', 300, 'usd', 100, 'some-memo-text');
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      });
    }); // END generateAnonQuote
    describe(`cancelInvoice`, () => {
      it("should cancel quote", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>({
          status: InvoiceStatus.PENDING
        }));
        mockServices.db.lightningInvoices.findOneAndUpdate = jest.fn().mockResolvedValue(true);
        mockServices.db.lightningQuotes.find = jest.fn().mockResolvedValue(createMock<QuoteReference[]>());
        mockServices.lndService.readInvoice = jest.fn().mockResolvedValue({ paymentHash: 'payHash' });
        mockServices.db.lightningInvoices.findOneAndUpdate = jest.fn().mockResolvedValue(true);
        mockServices.lndService.cancelBolt11 = jest.fn().mockResolvedValue(createMock<CancelBolt11>());
        mockServices.db.lightningQuotes.model.deleteMany = jest.fn().mockResolvedValue(true);

        const response = await lightningInvoiceService.cancelInvoice('some-invoice-id', 'some-tenant-id');
        expect(response).toMatchObject(createMock<InvoiceReference>());
      });
      it("should throw an HttpException 400 when cancelling a Quote in Mongo fails.", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null);
        try {
          await lightningInvoiceService.cancelInvoice('some-invoice-id', 'some-tenant-id');
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
        }
      });
      it("should throw an HttpException 400 when cancelling a Quote is not Status = PENDING.", async () => {
        mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(createMock<InvoiceReference>({
          status: InvoiceStatus.PAID
        }));
        try {
          await lightningInvoiceService.cancelInvoice('some-invoice-id', 'some-tenant-id');
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      });
    }); // END cancelInvoice
  }); // END PUBLIC METHODS

  describe(`PRIVATE METHODS & FUNCTIONS`, () => {
    it("btcToSats should convert BTC to SATS", () => {
      const response = lightningInvoiceService["btcToSats"](0.00000001);
      expect(response).toBe(1);
    });
    it("getSumOfDayChannels should get the sum of channels array in SATS", () => {
      const response = lightningInvoiceService["getSumOfDayChannels"](createMock<ChannelActivityReference[]>(
        [
          createMock<ChannelActivityReference>({
            action: ChannelActivity.OPEN,
            amount: {
              btcValue: 1
            }
          }),
          createMock<ChannelActivityReference>({
            action: ChannelActivity.CLOSE,
            amount: {
              btcValue: 1
            }
          })
        ]
      ));
      expect(response).toMatchObject({
        moneyInChannels: 100000000,
        moneyOutChannels: 100000000,
      });
    });
    it("getSumOfDayInvoice should get the sum of Invoices array in SATS", () => {
      const response = lightningInvoiceService["getSumOfDayInvoice"](createMock<InvoiceReference[]>(
        [
          createMock<InvoiceReference>({
            quote: {
              amount: {
                btcValue: 1
              }
            }
          }),
          createMock<InvoiceReference>({
            quote: {
              amount: {
                btcValue: 1
              }
            }
          })
        ]
      ));
      expect(response).toBe(200000000);
    });
    it("getSumOfDayPayment should get the sum of Payments array in SATS", () => {
      const response = lightningInvoiceService["getSumOfDayPayment"](createMock<PaymentReference[]>(
        [
          createMock<PaymentReference>({
            amount: {
              btcValue: 1
            }
          }),
          createMock<PaymentReference>({
            amount: {
              btcValue: 1
            }
          })
        ]
      ));
      expect(response).toBe(200000000);
    });
    it("btcConversion should convert SATS to BTC", async () => {
      const response = await lightningInvoiceService["getBtcConversion"](start, 100);
      expect(response).toMatchObject({
        fiatValue: 0,
        currency: "usd",
        btcValue: 0.000001,
        exchangeRate: 0,
      });
    });
    it("calculateNetChannel should calculate the in/out net total", async () => {
      const response = lightningInvoiceService["calculateNetChannel"](
        createMock<ChannelActivityReference>(),
        createMock<InvoiceReference[]>(),
        createMock<PaymentReference[]>());
      expect(response).toBe(0);
    });

    describe(`isWithinBounds`, () => {
      describe(`Invoice`, () => {
        it("should return TRUE when invoice is within Bounds", () => {
          const response: boolean = lightningInvoiceService["isWithinBounds"](start, end, createMock<InvoiceReference>({
            status: InvoiceStatus.PAID,
            settleTimestamp: start
          }));
          expect(response).toBeTruthy();
        });
        it("should return FALSE when invoice settleTimestamp is NOT FOUND", () => {
          const response: boolean = lightningInvoiceService["isWithinBounds"](start, end, createMock<InvoiceReference>({
            status: InvoiceStatus.PAID
          }));
          expect(response).toBeFalsy();
        });
        it("should return FALSE when invoice Status is NOT PAID", () => {
          const response: boolean = lightningInvoiceService["isWithinBounds"](start, end, createMock<InvoiceReference>());
          expect(response).toBeFalsy();
        });
      });
      describe(`Payments`, () => {
        it("should return TRUE when payment is within Bounds", () => {
          const response: boolean = lightningInvoiceService["isWithinBounds"](start, end, createMock<PaymentReference>({
            status: PaymentStatus.SUCCEEDED,
            settleTimestamp: start
          }));
          expect(response).toBeTruthy();
        });
        it("should return FALSE when payment settleTimestamp is NOT FOUND", () => {
          const response: boolean = lightningInvoiceService["isWithinBounds"](start, end, createMock<PaymentReference>({
            status: PaymentStatus.SUCCEEDED
          }));
          expect(response).toBeFalsy();
        });
        it("should return FALSE when payment Status is NOT SUCCEEDED", () => {
          const response: boolean = lightningInvoiceService["isWithinBounds"](start, end, createMock<PaymentReference>());
          expect(response).toBeFalsy();
        });
      });
    }); // END isWithinBounds
    describe(`updateBalance`, () => {
      it("should create new Node Balance for current day", async () => {
        mockServices.lndService.getNodeBalance = jest.fn().mockResolvedValue(createMock<ChannelBalanceResponse.AsObject>({
          balance: 1
        }));
        mockServices.lndService.getOnchainBalance = jest.fn().mockResolvedValue(createMock<{ confirmed_balance: number }>({
          confirmed_balance: 1
        }));
        jest.spyOn(lightningInvoiceService as any, 'getBtcConversion').mockResolvedValue(createMock<AmountReference>());
        mockServices.db.lightningBalances.findOneAndUpdate = jest.fn().mockResolvedValue(null);
        mockServices.db.lightningBalances.create = jest.fn().mockResolvedValue(true);
        const response = await lightningInvoiceService["updateBalance"](`some-tenant-id`, `America/New_York`);
        expect(response).toMatchObject({
          tenantId: "some-tenant-id",
          onchainAmount: {
            fiatValue: 0,
            currency: "",
            btcValue: 0,
            exchangeRate: 0,
          },
          offchainAmount: {
            fiatValue: 0,
            currency: "",
            btcValue: 0,
            exchangeRate: 0,
          },
        });
      });
      it("should update exisitng Node Balance for current day", async () => {
        mockServices.lndService.getNodeBalance = jest.fn().mockResolvedValue(createMock<ChannelBalanceResponse.AsObject>({
          balance: 1
        }));
        mockServices.lndService.getOnchainBalance = jest.fn().mockResolvedValue(createMock<{ confirmed_balance: number }>({
          confirmed_balance: 1
        }));
        jest.spyOn(lightningInvoiceService as any, 'getBtcConversion').mockResolvedValue(createMock<AmountReference>());
        mockServices.db.lightningBalances.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<BalanceReference>());
        const response = await lightningInvoiceService["updateBalance"](`some-tenant-id`, `America/New_York`);
        expect(response).toMatchObject({
          tenantId: "some-tenant-id",
          onchainAmount: {
            fiatValue: 0,
            currency: "",
            btcValue: 0,
            exchangeRate: 0,
          },
          offchainAmount: {
            fiatValue: 0,
            currency: "",
            btcValue: 0,
            exchangeRate: 0,
          },
        });
      });
      it("should return HttpException 400 when timezone incorrect", async () => {
        mockServices.lndService.getNodeBalance = jest.fn().mockResolvedValue(createMock<ChannelBalanceResponse.AsObject>({
          balance: 1
        }));
        jest.spyOn(lightningInvoiceService as any, 'getBtcConversion').mockResolvedValueOnce(createMock<AmountReference>());
        mockServices.db.lightningBalances.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<BalanceReference>());
        try {
          await lightningInvoiceService["updateBalance"](`some-tenant-id`, `xcv`);
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      });
    }); // END updateBalance
    describe(`refreshBalances`, () => {
      it("should create a new Mongo document and return balanceDocs", async () => {
        mockServices.lndService.getNodeBalance = jest.fn().mockResolvedValue(createMock<ChannelBalanceResponse.AsObject>({
          balance: 1
        }));
        mockServices.lndService.getOnchainBalance = jest.fn().mockResolvedValue(createMock<{ confirmed_balance: number }>({
          confirmed_balance: 1
        }));
        jest.spyOn(lightningInvoiceService as any, 'getBtcConversion').mockResolvedValueOnce(createMock<AmountReference>());
        mockServices.db.lightningBalances.findOneAndUpdate = jest.fn().mockResolvedValue(null);
        mockServices.db.lightningBalances.create = jest.fn().mockResolvedValue(createMockList<BalanceReference>(5, (i) => {
          const balance = createMock<BalanceReference>();
          balance.onchainAmount = createMock<AmountReference>();
          balance.offchainAmount = createMock<AmountReference>();
          balance.timestamp = start;
          return balance;
        }));
        const response = await lightningInvoiceService["refreshBalances"]("some-tenant-id", [] as PaymentReference[], [] as InvoiceReference[], [] as ChannelActivityReference[], [] as BitcoinTxnReference[]);
        expect(response).toBeDefined();
      });
      it("should update an existing Mongo document and return balanceDocs", async () => {
        mockServices.lndService.getNodeBalance = jest.fn().mockResolvedValue(createMock<ChannelBalanceResponse.AsObject>({
          balance: 1
        }));
        mockServices.lndService.getOnchainBalance = jest.fn().mockResolvedValue(createMock<{ confirmed_balance: number }>({
          confirmed_balance: 1
        }));
        jest.spyOn(lightningInvoiceService as any, 'getBtcConversion').mockResolvedValueOnce(createMock<AmountReference>());
        mockServices.db.lightningBalances.findOneAndUpdate = jest.fn().mockResolvedValue(createMock<BalanceReference>());
        const response = await lightningInvoiceService["refreshBalances"]("some-tenant-id", [] as PaymentReference[], [] as InvoiceReference[], [] as ChannelActivityReference[], [] as BitcoinTxnReference[]);
        expect(response).toBeDefined();
      });

    }); // END refreshBalances
    describe(`refreshPayments`, () => {
      it("should update an existing Payment in Mongo", async () => {
        mockServices.db.lightningPayments.find = jest.fn().mockResolvedValue(createMockList<PaymentReference>(5, (i) => {
          const payment = createMock<PaymentReference>();
          payment.amount = createMock<AmountReference>();
          payment.settleTimestamp = start;
          return payment;
        }));
        mockServices.db.lightningPayments.find = jest.fn().mockResolvedValue(createMock<PaymentReference[]>());
        mockServices.lndService.getOutgoingPayments = jest.fn().mockResolvedValue(createMock<ListPaymentsResponse.AsObject[]>());
        const response = await lightningInvoiceService["refreshPayments"]("tenantId");
        expect(response).toMatchObject([]);
      });
      it("should return TypeError when no Payment is found in Mongo", async () => {
        mockServices.db.lightningPayments.find = jest.fn().mockResolvedValue(null);
        mockServices.lndService.getOutgoingPayments = jest.fn().mockResolvedValue(createMock<ListPaymentsResponse.AsObject[]>());
        mockServices.db.lightningPayments.create = jest.fn().mockResolvedValue(createMock<PaymentReference>());
        try {
          await lightningInvoiceService["refreshPayments"]("tenantId");

        } catch (error) {
          expect(error).toBeInstanceOf(TypeError);
          expect(error.message).toBe('Cannot read properties of null (reading \'map\')');
        }
      });
      it("should return TypeError when no out going Payments are returned the LND service.", async () => {
        mockServices.db.lightningPayments.find = jest.fn().mockResolvedValue(createMockList<PaymentReference>(5, (i) => {
          const payment = createMock<PaymentReference>();
          payment.amount = createMock<AmountReference>();
          payment.settleTimestamp = start;
          return payment;
        }));
        mockServices.db.lightningPayments.find = jest.fn().mockResolvedValue(createMock<PaymentReference[]>());
        mockServices.lndService.getOutgoingPayments = jest.fn().mockResolvedValue(null);
        try {
          await lightningInvoiceService["refreshPayments"]("tenantId");
        } catch (error) {
          expect(error).toBeInstanceOf(TypeError);
          expect(error.message).toBe('Cannot read properties of null (reading \'filter\')');
        }
      });
    }); // END refreshPayments
  }); // END PRIVATE METHODS & FUNCTIONS
});