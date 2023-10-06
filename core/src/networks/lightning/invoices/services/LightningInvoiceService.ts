import { CancelInvoiceDto, GenerateBolt11Dto, LightningChartData, LightningChartCategories, LightningChartTotalLabels } from "@blockspaces/shared/dtos/lightning";
import { InvoiceReference, QuoteReference, QuoteStatus, InvoiceState, PaymentStatus, PaymentReference, BalanceReference, AmountReference, ChannelActivityReference, ObjectsResponseReference, ChannelActivity, PaymentSource, BitcoinTxnReference, TxnStatus, PaymentSources, OnchainQuote, OnchainInvoice, Invoice } from "@blockspaces/shared/models/lightning/Invoice";
import { AddInvoiceResponse, Channel, ChannelBalanceResponse, ChannelCloseSummary, PayReq, WalletBalanceResponse } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { BitcoinService } from "../../../bitcoin/services/BitcoinService";
import { v4 as uuidv4 } from "uuid";
import { InvoiceStatus } from "@blockspaces/shared/models/lightning/Invoice";
import { DEFAULT_LOGGER_TOKEN } from "../../../../logging/constants";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { returnErrorStatus } from "../../../../exceptions/utils";
import { LndService } from "../../lnd/services/LndService";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { DateTime, Duration, IANAZone, Interval } from "luxon";
import { StatusCodes } from "http-status-codes";
import { ErpMetadata, ErpMetadataTypes, IntegrationTransactionReference } from "@blockspaces/shared/models/lightning/Integration";
import { IUser } from "@blockspaces/shared/models/users";
import { EventEmitService } from "../../../../webhooks/services/EventEmitService";
import { Amount, OnchainReceivedData, OnchainSentData, PaymentReceivedData, PaymentSentData } from "../../../../../../shared/models/webhooks/WebhookTypes";
import { Document } from "mongoose";
import { BitcoinInvoiceService } from "../../../bitcoin/services/BitcoinInvoiceService";

@Injectable()
export class LightningInvoiceService {

  constructor(
    private readonly bitcoinService: BitcoinService,
    private readonly lndService: LndService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly db: ConnectDbDataContext,
    private readonly eventEmitService: EventEmitService,
    private readonly bitcoinInvoiceService: BitcoinInvoiceService
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Calculates the total Fiat transaction volume for a tenant's lightning node.
   *
   *
   * @param start timestamp in millis
   * @param end timestamp in millis
   * @param tenantId string
   * @param user IUser = null
   * @returns {totalIn: number, totalOut: number, totalVolume: number}
   */
  getLightningVolume = async (start: number, end: number, tenantId: string, user: IUser = null): Promise<{ totalIn: number, totalOut: number, totalVolume: number }> => {

    let _invoices: InvoiceReference[] = [];
    let _payments: PaymentReference[] = [];

    // try to get data directly from LN node 1st
    try {
      const { invoices, payments } = await this.refreshAllObjects(tenantId, user);
      _invoices = invoices;
      _payments = payments;

    } catch (error) {
      this.logger.warn(`Unable to grab latest from LN Node :${tenantId}}`, error);

      // if we are here then fallback to querying mongo db
      _invoices = await this.db.lightningInvoices.find({
        tenantId: tenantId,
        settleTimestamp: {
          $exists: true,
          $ne: null,
          $gte: start,
          $lte: end
        }
      });
      _payments = await this.db.lightningPayments.find({
        tenantId: tenantId,
        settleTimestamp: {
          $exists: true,
          $ne: null,
          $gte: start,
          $lte: end
        }
      });
    }

    const totalIn = _invoices?.filter(x => this.isWithinBounds(start, end, x)).reduce((x, y) => x + y.amount.fiatValue, 0);
    const totalOut = _payments?.filter(x => this.isWithinBounds(start, end, x)).reduce((x, y) => x + y.amount.fiatValue, 0);

    return {
      totalIn,
      totalOut,
      totalVolume: totalIn + totalOut,
    };
  };

  /**
   * Creates both an onchain and offchain invoice.
   *
   * @param currency
   * @param amount
   * @param memo
   * @param tenantId
   * @param erpMetadata
   * @param source
   * @returns Promise<ApiResult>
   */
  createCanonicalInvoice = async (currency: string, amount: number, memo: string, tenantId: string, integration?: IntegrationTransactionReference, erpMetadata: ErpMetadata[] = null, source: PaymentSource = "unknown"):
    Promise<{ onchain: OnchainInvoice, offchain: InvoiceReference }> => {
    const checkExistingInvoice = await this.checkForExistingErpInvoice(erpMetadata, tenantId)
    if (checkExistingInvoice) return checkExistingInvoice
    const offchainInvoice = await this.createInvoice(currency, amount, memo, tenantId, integration, erpMetadata, source) ?? null;
    const onchainInvoice = await this.bitcoinInvoiceService.createInvoice(currency, amount, memo, tenantId, erpMetadata, source) ?? null;
    if (!offchainInvoice || !onchainInvoice) {
      this.logger.error(`Unable to create onchain or offchain Invoice for ${tenantId}`, null, { data: { currency: currency, amount: amount, memo: memo, tenantId: tenantId } });
      return null;
    }
    return { onchain: onchainInvoice, offchain: offchainInvoice };
  };

  /**
   * Runs get invoice status for an onchain and offchain invoice
   * If either onchain or offchain is paid, the remain (unpaid) invoice is canceled
   *
   * @param invoiceId String
   * @param tenantId String
   * @returns Promise<InvoiceReference>
   */
  getCanonicalInvoiceStatus = async (onchainInvoiceId: string, offchainInvoiceId: string, tenantId: string, user: IUser = null):
    Promise<{ onchain: OnchainInvoice, offchain: InvoiceReference }> => {
    const offchainStatus = await this.getInvoiceStatus(offchainInvoiceId, tenantId, user).catch(e => {
      this.logger.warn(`Failed to get offchainInvoiceStatus for ${offchainInvoiceId}`, e);
      return null;
    });
    const onchainStatus = await this.bitcoinInvoiceService.getInvoiceStatus(onchainInvoiceId, tenantId, user).catch(e => {
      this.logger.warn(`Failed to get onchainInvoiceStatus for ${onchainInvoiceId}`, e);
      return null;
    });

    // onchain is paid, need to cancel offchain
    if (onchainStatus?.status === InvoiceStatus.PAID && offchainStatus?.status !== InvoiceStatus.CANCELED) {
      this.logger.debug('Onchain invoice paid, canceling offchain invoice');
      const offchainInvoice = await this.cancelInvoice(offchainInvoiceId, tenantId).catch(_ => { return null; });
      return { offchain: offchainInvoice, onchain: onchainStatus };

      // offchain is paid, need to cancel onchain
    } else if (offchainStatus?.status === InvoiceStatus.PAID && onchainStatus?.status !== InvoiceStatus.CANCELED) {
      this.logger.debug('Offchain invoice paid, canceling onchain invoice');
      const onchainInvoice = await this.bitcoinInvoiceService.cancelInvoice(onchainInvoiceId, tenantId).catch(_ => { return null; });
      return { offchain: offchainStatus, onchain: onchainInvoice };
    } else {
      return { offchain: offchainStatus, onchain: onchainStatus };
    }
  };

  /**
   * Creates an "Invoice" entry in Mongo DB for a specified FIAT amount... This would represent a "charge"/"invoice" in quickbooks.
   *
   * When an invoice is about to be paid (the payer navigates to the checkout page), a "quote" is generated that reflects the current price of bitcoin.
   *
   * @param invoice
   * @param amount
   * @param memo
   * @param tenantId
   * @returns Promise<ApiResult>
   */
  createInvoice = async (currency: string, amount: number, memo: string, tenantId: string, integration?: IntegrationTransactionReference, erpMetadata: ErpMetadata[] = [], source: PaymentSource = "unknown"): Promise<InvoiceReference> => {
    if (!amount || amount <= 0) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, "Invoice amount must be specified or greater than zero.", { log: false });
    }
    const user = await this.db.users.findOne({ tenants: tenantId });

    if (user?.featureFlags?.cyclrUserBIP && erpMetadata?.length === 0) {
      const postedMetadata: ErpMetadata = {
        dataType: 'posted',
        value: ' ',
        domain: 'QBO'
      };
      erpMetadata.push(postedMetadata);
    }
    const _invoiceReference: InvoiceReference = {
      invoiceId: uuidv4(),
      tenantId: tenantId,
      description: memo,
      status: InvoiceStatus.PENDING,
      erpMetadata,
      amount: {
        currency: currency,
        fiatValue: amount
      },
      source: source
    };
    if (integration) {
      _invoiceReference.integrations = [integration];
    }
    try {
      // Step 1: Add Invoice to Mongo
      const document = await this.db.lightningInvoices.create(_invoiceReference);
      return document;
    } catch (e) {
      this.logger.error(`Unable to create Invoice for ${tenantId}`, e, { data: { currency: currency, amount: amount, memo: memo, tenantId: tenantId, quickbooksRef: integration } });
      return null;
    }
  };

  /**
   * Refreshes Invoices, Payments, and Balances
   * @param tenantId string
   * @param user IUser
   * @returns Promise<{ invoices: InvoiceReference[]; payments: PaymentReference[]; balances: BalanceReference[] }>
   */
  refreshAllObjects = async (tenantId: string, user: IUser = null): Promise<ObjectsResponseReference> => {
    try {
      const [_invoices, _payments, _onchainTxns] = await Promise.allSettled(
        [
          this.refreshInvoices(tenantId, user),
          this.refreshPayments(tenantId, user),
          this.bitcoinInvoiceService.refreshOnchainTxns(tenantId, user),
        ]);
      if (_invoices.status === 'rejected') {
        this.logger.warn(`Unable to refresh invoices for ${tenantId}`, null, { error: _invoices.reason });
        return null;
      }
      if (_payments.status === 'rejected') {
        this.logger.warn(`Unable to refresh payments for ${tenantId}`, null, { error: _payments.reason });
        return null;
      }
      if (_onchainTxns.status === 'rejected') {
        this.logger.warn(`Unable to refresh onchain transactions for ${tenantId}`, null, { error: _onchainTxns.reason });
        return null;
      }
      const onchainInvoices: OnchainInvoice[] = await this.db.bitcoinInvoices.find({ tenantId: tenantId, status: InvoiceStatus.PAID });
      const payments = _payments.value;
      const invoices = _invoices.value;
      const onchainTxns = _onchainTxns.value;
      const channelEvents = await this.refreshChannelActivity(tenantId);
      const balances: BalanceReference[] = await this.refreshBalances(tenantId, payments, invoices, channelEvents, onchainTxns);

      return { invoices: invoices, payments: payments, onchainTxns: onchainTxns, channelEvents: channelEvents, balances: balances, onchainInvoices: onchainInvoices };
    } catch (e) {
      this.logger.error(`Unable to refresh objects for ${tenantId}`, e);
      return null;
    }
  };

  /**
   * Queries quotes corresponding to invoiceId, checks the status of each quote, and updates the statuses of quotes and invoices with new information.
   *
   * @param invoiceId String
   * @param tenantId String
   * @returns Promise<InvoiceReference>
   */
  getInvoiceStatus = async (invoiceId: string, tenantId: string, user: IUser = null): Promise<InvoiceReference> => {
    // Step 1: Get Invoice from Mongo
    let invoiceDoc = await this.db.lightningInvoices.findOne({
      invoiceId: invoiceId,
      tenantId: tenantId
    });

    if (!invoiceDoc) {
      returnErrorStatus(HttpStatus.NOT_FOUND, `invoiceId: ${invoiceId} not found in MongoDB.`, { log: false });
    }

    // Step 2: Get the bsc_macaroon and cert from Mongo
    const nodeData = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: { $exists: false } });
    if (!nodeData) {
      returnErrorStatus(HttpStatus.NOT_FOUND, `Node data for tenantId: ${tenantId} not found.`, { log: false });
    }

    // Step 3: Get corresponding Quotes from Mongo
    const quotesDocs: QuoteReference[] = await this.db.lightningQuotes.find({
      invoiceId: invoiceId
    });
    if (quotesDocs.length === 0) {
      return invoiceDoc;
    }

    // Step 4: Check if each quote has been paid or expired
    for (const quote of quotesDocs) {
      const invoiceObj: PayReq.AsObject = await this.lndService.readInvoice(quote.paymentRequest, tenantId).catch(_ => { return null; });
      if (!invoiceObj) continue;

      // Get invoice status from LnNode
      const quoteStatus = await this.lndService.trackBolt11({ payment_hash: invoiceObj.paymentHash }, tenantId).catch(_ => { return null; });
      if (!quoteStatus) {
        await this.db.lightningQuotes.findOneAndDelete({ paymentRequest: quote.paymentRequest });
        continue;
      }
      // Did not find bolt11 on node

      // If an invoice has been paid...
      if (this.invoiceStatus(quoteStatus.state) === InvoiceState.SETTLED) {
        // Update balance
        await this.updateBalance(tenantId);

        const settleTimestamp = DateTime.fromMillis(Math.round(quoteStatus["settleDate"]) * 1000).toMillis();

        quote.status = QuoteStatus.PAID;
        quote.channelId = quoteStatus.htlcs[0]['chan_id'];
        // Update the invoice Model with the paid quote
        let invoiceDoc: InvoiceReference;
        try {
          invoiceDoc = await this.db.lightningInvoices.findOneAndUpdate(
            { invoiceId: invoiceId },
            { status: InvoiceStatus.PAID, quote: quote, settleTimestamp: settleTimestamp, settledPayreq: quote.paymentRequest }
          );
        } catch (e) {
          this.logger.warn('Failed to update invoice with settled quote', e);
        };

        // Emit Payment Received Event
        if (user?.featureFlags?.cyclrUserBIP) {
          const paymentData: PaymentReceivedData = {
            __type: PaymentReceivedData.__type,
            source: invoiceDoc?.source ?? 'unknown',
            amount: {
              currency: quote.amount.currency,
              amountFiat: quote.amount.fiatValue,
              amountSats: this.btcToSats(quote.amount.btcValue),
              exchangeRate: quote.amount.exchangeRate
            },
            timestamp: DateTime.fromMillis(settleTimestamp).toISO(),
            erpMetadata: invoiceDoc.erpMetadata
          };
          await this.eventEmitService.emitPaymentReceived(tenantId, paymentData);
          // this.logger.debug(`PaymentReceived Event Emit Result: ${eventRes.data.join(',')}`);
        }

        // Delete quote docs from Quotes collection
        await this.db.lightningQuotes.model.deleteMany({ invoiceId: invoiceId });

        // Cancel open Bolt11s on the lightning node
        await quotesDocs.forEach(async (quote) => {
          // Don't try to delete the paid bolt11
          if (quote.paymentRequest === quoteStatus["payment_request"]) return;
          // Decode the bolt 11
          const paymentObj: PayReq.AsObject = await this.lndService.readInvoice(quote.paymentRequest, tenantId);
          // Cancel the bolt11 with the node
          try {
            await this.lndService.cancelBolt11({ payment_hash: paymentObj["payment_hash"] } as CancelInvoiceDto, tenantId);
          } catch (e) {
            this.logger.warn("Could not cancel invoice.");
          }
        });

        // Quote is expired
      } else if (this.invoiceStatus(quoteStatus.state) === InvoiceState.CANCELED) {
        // Await delete quote from LnNode, then delete from mongo
        await this.lndService.cancelBolt11({ payment_hash: invoiceObj["payment_hash"] }, tenantId);
        await this.db.lightningQuotes.findOneAndDelete({ paymentRequest: quote.paymentRequest });
      }

      // quote is still pending, pass

    }
    invoiceDoc = await this.db.lightningInvoices.findOne({
      invoiceId: invoiceId
    });

    return invoiceDoc;
  };

  /**
   * Gets invoice data for tenant in chart-friendly format
   *
   * @param tenantId - String
   * @param interval NetworkDataInterval - time interval (daily)
   * @param start Number - timestamp
   * @param end Number - timestamp
   * @returns Promise<LightningChartData>
   */
  getInvoiceChartData = async (tenantId: string, interval: NetworkDataInterval, start: number, end: number, fiat?: boolean, timezone: string = 'America/New_York', user: IUser = null): Promise<LightningChartData> => {
    try {
      // TODO: Remove hardcoded categories... allow categories to be determined by parameters
      const response: LightningChartData = {
        interval: interval,
        start: start,
        end: end,
        categories: [LightningChartCategories.BALANCE, LightningChartCategories.OFFCHAIN_BALANCE, LightningChartCategories.ONCHAIN_BALANCE, LightningChartCategories.MONEY_IN, LightningChartCategories.MONEY_OUT],
        data: [],
        dataTimestamps: [],
        totals: [],
        timezone: timezone
      };
      const { invoices, payments, onchainTxns, channelEvents } = await this.refreshAllObjects(tenantId, user);
      const { moneyIn, moneyOut, timestamps, combinedBalances: balances, onchainBalances, offchainBalances } = await this.aggregateTotals(tenantId, invoices, payments, channelEvents, onchainTxns, start, end, interval, timezone);

      response.data.push({ category: LightningChartCategories.MONEY_IN, values: moneyIn });
      response.data.push({ category: LightningChartCategories.MONEY_OUT, values: moneyOut });
      response.dataTimestamps = timestamps;
      response.data.push({ category: LightningChartCategories.BALANCE, values: balances });
      response.data.push({ category: LightningChartCategories.OFFCHAIN_BALANCE, values: offchainBalances });
      response.data.push({ category: LightningChartCategories.ONCHAIN_BALANCE, values: onchainBalances });
      // Handle totals
      response.totals.push({ label: LightningChartTotalLabels.STARTING_BALANCE, amount: balances[0] - moneyIn[0] + moneyOut[0] });
      response.totals.push({ label: LightningChartTotalLabels.TOTAL_MONEY_IN, amount: moneyIn.reduce((a, b) => a + b) });
      response.totals.push({ label: LightningChartTotalLabels.TOTAL_MONEY_OUT, amount: moneyOut.reduce((a, b) => a + b) });
      response.totals.push({ label: LightningChartTotalLabels.ENDING_BALANCE, amount: balances[balances.length - 1] });

      return response;
    } catch (e) {
      this.logger.error(`Unable to retrieve Lightning chart data ${tenantId}`, e);
      return null;
    }
  };


  /**
   * Fetches the current price of bitcoin and creates a BOLT11 paymentRequest for a given invoiceId.
   *
   * The expiration time should be low (default 300s) to reduce the receiver's exposure to bitcoin's volatility.
   *
   * @param invoiceId
   * @param expirationsInSecs
   * @returns Promise<ApiResult> QuoteReference
   */
  generateQuote = async (invoiceId: string, expirationInSecs: number = 300, tenantId: string): Promise<QuoteReference> => {
    // Step 1: Fetch Invoice from mongo
    const document: InvoiceReference = await this.db.lightningInvoices.findOne({ tenantId: tenantId, invoiceId: invoiceId });

    if (document === null) {
      returnErrorStatus(HttpStatus.NOT_FOUND, `invoiceId: ${invoiceId} not found in MongoDB.`, { log: false });
    }
    if (document.status !== InvoiceStatus.PENDING) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, `Quote generation failed. Invoice has status: ${document.status}`, { log: false });
    }

    const quoteReference: QuoteReference = {
      quoteId: uuidv4(),
      invoiceId: invoiceId,
      tenantId: tenantId,
      paymentRequest: null,
      expiration: DateTime.now().toMillis() + expirationInSecs * 1000,
      status: QuoteStatus.OPEN,
      channelId: null,
      amount: {
        fiatValue: document.amount.fiatValue,
        currency: document.amount.currency,
        btcValue: null,
        exchangeRate: null
      },
    };

    // Step 2: Convert fiat to BTC
    const convertResult = await this.bitcoinService.convertInvoiceToBtc(document.amount.fiatValue, DateTime.now().toMillis(), document.amount.currency);
    quoteReference.amount.exchangeRate = convertResult.exchangeRate;

    // Get the bitcoin value from the invoice array
    const btc = convertResult.invoice.filter((obj: { currency: string; }) => obj.currency === "BTC")[0];
    // Convert to sats
    quoteReference.amount.btcValue = btc.amount;

    // Step 3: Generate Bolt11 from LN Node
    const generateBolt11Dto: GenerateBolt11Dto = {
      expiry: expirationInSecs,
      amount: this.btcToSats(btc.amount),
      memo: document.description,
      tenantId: tenantId
    };

    const invoice: AddInvoiceResponse.AsObject = await this.lndService.generateBolt11(generateBolt11Dto);

    quoteReference.paymentRequest = invoice.paymentRequest;

    try {
      // Step 4: Add Quote to Mongo
      const quoteDoc = await this.db.lightningQuotes.create(quoteReference);
      return quoteDoc;
    } catch (error) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, { error });
      return null;
    }
  };

  /**
   * Generates quote WITHOUT an invoice. Lists "ANON" as invoiceId in Mongo
   *
   * @param tenantId
   * @param expirationInSecs
   * @param currency
   * @param amount
   * @param memo
   * @returns
   */
  generateAnonQuote = async (tenantId: string, expirationInSecs: number = 300, currency: string, amount: number, memo: string): Promise<QuoteReference> => {
    const timestamp = DateTime.now().toMillis();
    const quoteReference: QuoteReference = {
      quoteId: uuidv4(),
      invoiceId: "ANON",
      tenantId: tenantId,
      paymentRequest: null,
      expiration: timestamp + expirationInSecs * 1000,
      status: QuoteStatus.OPEN,
      amount: {
        fiatValue: amount,
        currency: currency,
        btcValue: null,
        exchangeRate: null
      }
    };

    // Step 1: Convert fiat to BTC
    const convertResult = await this.bitcoinService.convertInvoiceToBtc(amount, timestamp, currency);
    quoteReference.amount.exchangeRate = convertResult.exchangeRate.amount;

    // Get the bitcoin value from the invoice array
    const btc = convertResult.invoice.filter((obj) => obj.currency === "BTC")[0];
    // Convert to sats
    quoteReference.amount.btcValue = btc.amount;

    // Step 2: Generate Bolt11 from LN Node
    const generateBolt11Dto: GenerateBolt11Dto = {
      expiry: expirationInSecs,
      amount: this.btcToSats(btc.amount),
      memo: memo,
      tenantId: tenantId
    };
    const invoice = await this.lndService.generateBolt11(generateBolt11Dto);

    quoteReference.paymentRequest = invoice.paymentRequest;

    try {
      // Step 3: Add Quote to Mongo
      const quoteDoc = await this.db.lightningQuotes.create(quoteReference);
      return quoteDoc;
    } catch (error) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, { error });
      return null;
    }
  };

  /**
   * Update invoice in mongo to 'CANCELLED', deletes corresponding quotes from mongo and Lightning node.
   *
   * @param invoiceId String
   * @returns Promise<ApiResult>
   */
  cancelInvoice = async (invoiceId: string, tenantId: string): Promise<InvoiceReference> => {
    const invoice = await this.db.lightningInvoices.findOne({
      tenantId: tenantId, invoiceId: invoiceId
    });
    if (!invoice) {
      returnErrorStatus(HttpStatus.NOT_FOUND, `Invoice cancellation failed. Invoice not found.`, { log: false });
    }
    if (invoice.status !== InvoiceStatus.PENDING) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, `Invoice cancellation failed. Invoice status is ${invoice.status}`, { log: false });
    }
    // Update invoice status
    await this.db.lightningInvoices.findOneAndUpdate({ invoiceId: invoiceId }, { status: InvoiceStatus.CANCELED }).catch(_ => {
      this.logger.warn('Failed to update invoice doc status.');
    });

    // Delete corresponding quotes
    const quotes = await this.db.lightningQuotes.find({ invoiceId: invoiceId });

    await quotes.forEach(async (quote) => {
      // do quote deletion from node

      // Decode bolt 11
      const invoiceObj = await this.lndService.readInvoice(quote.paymentRequest, tenantId);

      await this.lndService.cancelBolt11({ payment_hash: invoiceObj.paymentHash }, tenantId);
    });

    // Delete from Mongo
    await this.db.lightningQuotes.model.deleteMany({ invoiceId: invoiceId });

    // Grab document that is cancelled
    const document = await this.db.lightningInvoices.findOne({
      invoiceId: invoiceId
    });

    return document;
  };

  private checkForExistingErpInvoice = async (erpMetadata: ErpMetadata[], tenantId: string): Promise<{ onchain: OnchainInvoice, offchain: InvoiceReference }> => {
    if (erpMetadata.length === 0) return null

    const erpInvoice = erpMetadata.find(meta => meta.dataType === ErpMetadataTypes[2])
    const onchainInvoice = await this.db.bitcoinInvoices.findOne({ erpMetadata: erpInvoice, tenantId: tenantId })
    const offchainInvoice = await this.db.lightningInvoices.findOne({ erpMetadata: erpInvoice, tenantId: tenantId })
    if (offchainInvoice?.status === InvoiceStatus.PAID || onchainInvoice?.status === InvoiceStatus.PAID) {
      return {
        onchain: onchainInvoice,
        offchain: offchainInvoice
      }
    } else {
      return null
    }
  }


  // #region PRIVATE METHODS
  /**
   * Helper function to convert btc to stats
   *
   * @param btc Number -> eg. 0.00001231
   * @returns Same number * 100 million, rounded to the nearest int
   */
  private btcToSats = (btc: number) => {
    return Math.round(btc * 10 ** 8);
  };

  private satsToBtc = (sats: number) => {
    const btcValue = Number.parseFloat((sats / 10 ** 8).toFixed(8));
    return btcValue;
  };

  private getSumOfDayChannels = (channelEvents: ChannelActivityReference[]): { moneyInChannels: number, moneyOutChannels: number } => {
    // Sums channel opens, converts to sats
    const moneyIn = channelEvents
      .filter(x => x.action === ChannelActivity.OPEN)
      .map(x => this.btcToSats(x.amount.btcValue))
      .reduce((x, y) => x + y, 0);

    // Sums channel closes, converts to sats
    const moneyOut = channelEvents
      .filter(x => x.action === ChannelActivity.CLOSE)
      .map(x => this.btcToSats(x.amount.btcValue))
      .reduce((x, y) => x + y, 0);

    return { moneyInChannels: Math.round(moneyIn), moneyOutChannels: Math.round(moneyOut) };
  };

  private getSumOfDayOnchain = (txns: BitcoinTxnReference[]): { moneyInTxns: number, moneyOutTxns: number } => {
    // Sums txns in, converts to sats
    const moneyIn = txns
      .filter(x => !x.isSender)
      .map(x => this.btcToSats(x.netBalanceChange.btcValue))
      .reduce((x, y) => x + y, 0);

    // Sums channel closes, converts to sats
    const moneyOut = txns
      .filter(x => x.isSender)
      .map(x => this.btcToSats(x.netBalanceChange.btcValue))
      .reduce((x, y) => x + y, 0);

    return { moneyInTxns: Math.round(moneyIn), moneyOutTxns: Math.round(Math.abs(moneyOut)) };

  };

  private getSumOfDayInvoice = (invoices: InvoiceReference[]): number => {
    // Sums invoices, converts to sats
    const sum = invoices
      .map(x => this.btcToSats(x.quote.amount.btcValue))
      .reduce((x, y) => x + y, 0);
    return Math.round(sum);
  };

  private getSumOfDayPayment = (payments: PaymentReference[]): number => {
    // Sums payments, converts to sats
    const sum = payments
      .map(x => this.btcToSats(x.netBalanceChange?.btcValue ?? x.amount.btcValue))
      .reduce((x, y) => x + y, 0);
    return Math.round(sum);
  };

  private isWithinBounds = (start: number, end: number, invoice: InvoiceReference | PaymentReference): boolean => {
    if (invoice.status !== InvoiceStatus.PAID && invoice.status !== PaymentStatus.SUCCEEDED)
      return false;
    if (!invoice.settleTimestamp) return false;
    return invoice.settleTimestamp >= start && invoice.settleTimestamp <= end;
  };

  private updateBalance = async (tenantId: string, timezone: string = 'America/New_York'): Promise<BalanceReference> => {
    const todayDate: DateTime = DateTime.now().setZone(timezone).startOf(this.dateFloor(NetworkDataInterval.DAILY));
    if (!todayDate.isValid) returnErrorStatus(StatusCodes.BAD_REQUEST, `Invalid Timezone: ${timezone}`, { log: false });
    const today: number = todayDate.toMillis();

    const lnBalanceRes: ChannelBalanceResponse.AsObject = await this.lndService.getNodeBalance(tenantId);
    const lnBalance = await lnBalanceRes.balance;
    const chainBalanceRes: WalletBalanceResponse.AsObject = await this.lndService.getOnchainBalance(tenantId);
    const chainBalance = await chainBalanceRes['confirmed_balance'];

    const lnAmount = await this.getBtcConversion(today, lnBalance);
    const chainAmount = await this.getBtcConversion(today, chainBalance);

    const balanceRef: BalanceReference = {
      tenantId: tenantId,
      offchainAmount: lnAmount,
      onchainAmount: chainAmount,
      timestamp: today
    };

    await this.db.lightningBalances.findOneAndUpdate({ tenantId: tenantId, timestamp: today }, balanceRef, { upsert: true }).catch(_ => { }); return balanceRef;
  };

  /**
   * Reconstructs balance history from invoices and payments
   *
   * @param tenantId string
   * @param payments PaymentReference[]
   * @param invoices InvoiceReference[]
   * @returns Promise<BalanceReference[]>
   */
  private refreshBalances = async (tenantId: string, payments: PaymentReference[], invoices: InvoiceReference[], channelActivity: ChannelActivityReference[], onchainTxns?: BitcoinTxnReference[], timezone: string = 'America/New_York'): Promise<BalanceReference[]> => {
    const interval = NetworkDataInterval.DAILY;
    if (!IANAZone.isValidZone(timezone)) {
      this.logger.warn('Invalid timezone provided, defaulting to America/New_York');
      timezone = 'America/New_York';
    }

    const firstTimestamp = Math.min(
      ...invoices.filter((i) => !isNaN(i.settleTimestamp)).map((i) => i.settleTimestamp),
      ...payments.filter((p) => !isNaN(p.settleTimestamp)).map((p) => p.settleTimestamp),
      ...channelActivity.filter((a) => !isNaN(a.timestamp)).map((a) => a.timestamp),
      ...onchainTxns.filter((a) => !isNaN(a.submittedTimestamp)).map((a) => a.submittedTimestamp),
      DateTime.now().setZone(timezone).toMillis()
    );
    const lastTimestamp = DateTime.now().toMillis();

    const startDate: DateTime = DateTime.fromMillis(firstTimestamp).startOf(this.dateFloor(interval));
    const endDate: DateTime = DateTime.fromMillis(lastTimestamp).startOf(this.dateFloor(interval)).plus({ days: 1 });
    // if (!startDate.isValid || !endDate.isValid) returnErrorStatus(StatusCodes.BAD_REQUEST, `Invalid Timezone: ${timezone}`);
    const start: number = startDate.toMillis();
    const end: number = endDate.toMillis();

    const { timestamps, combinedBalances: balances, offchainBalances, onchainBalances } = await this.aggregateTotals(tenantId, invoices, payments, channelActivity, onchainTxns, start, end, interval, timezone);

    const balanceDocs = [];
    for (let i = 0; i < balances.length - 1; i++) {
      const amountOffchain = await this.getBtcConversion(timestamps[i], offchainBalances[i]);
      const amountOnchain = await this.getBtcConversion(timestamps[i], onchainBalances[i]);
      const doc = {
        tenantId: tenantId,
        timestamp: timestamps[i],
        offchainAmount: amountOffchain,
        onchainAmount: amountOnchain,
      };
      balanceDocs.push(doc);
      await this.db.lightningBalances.findOneAndUpdate({ tenantId: tenantId, timestamp: timestamps[i] }, doc, { upsert: true }).catch(_ => { });
    }

    // const dateQuery = { $gt: start, $lt: end };
    // get net money in money out per day

    return balanceDocs;
  };
  /**
   * Helper function to convert between Emitted Amount type and AmountReference
   * for Mongo
   * @param Amount
   * @returns AmountReference
   */
  private amountToAmountRef = (amount: Amount): AmountReference => {
    const amountRef: AmountReference = {
      currency: amount.currency,
      fiatValue: amount.amountFiat,
      btcValue: this.satsToBtc(amount.amountSats),
      exchangeRate: amount.exchangeRate
    };
    return amountRef;

  };

  // Helper function for generating the Amount field in emitted events
  private getSatsConversion = async (settleDateMillis: number, satsValue: number): Promise<Amount> => {
    const price = await this.bitcoinService.getBitcoinPrice(settleDateMillis, "usd");
    if (!price) {
      this.logger.warn('getSatsConversion - getBitcoinPrice failed');
      return null;
    }
    const exchangeRate = price.exchangeRate;
    const btcValue = Number.parseFloat((satsValue / 100000000).toFixed(8));
    const fiatValue = Number.parseFloat((btcValue * exchangeRate).toFixed(2));
    const amount: Amount = { amountFiat: fiatValue, currency: "usd", amountSats: satsValue, exchangeRate: exchangeRate };
    return amount;
  };

  public getBtcConversion = async (settleDateMillis: number, satsValue: number): Promise<AmountReference> => {
    // Get historic price of bitcoin and fiat value
    const price = await this.bitcoinService.getBitcoinPrice(settleDateMillis, "usd");
    if (!price) {
      this.logger.warn('getBtcConversion - getBitcoinPrice failed');
      return null;
    }
    const exchangeRate = price.exchangeRate;
    // msat precision
    const btcValue = Number.parseFloat((satsValue / 100000000).toFixed(11));
    const fiatValue = Number.parseFloat((btcValue * exchangeRate).toFixed(2));
    const amount: AmountReference = { fiatValue: fiatValue, currency: "usd", btcValue: btcValue, exchangeRate: exchangeRate };
    return amount;
  };
  /**
   * Helper function to emit on-chain events
   */
  private emitOnchainEvent = async (tenantId, amount: Amount, netBalanceChange: Amount, totalFees: Amount, txnHash, blockHash, settleTimestamp, isSender, receiver?, erpMetadata = [], source = PaymentSources[2]) => {
    if (isSender) {
      const txnData: OnchainSentData = {
        __type: OnchainSentData.__type, amount,
        timestamp: DateTime.fromMillis(settleTimestamp).toISO(),
        netBalanceChange, receiver, totalFees,
        txnHash, blockHash, erpMetadata
      };
      await this.eventEmitService.emitOnchainSent(tenantId, txnData);
    } else {
      const txnData: OnchainReceivedData = {
        __type: OnchainReceivedData.__type, amount,
        timestamp: DateTime.fromMillis(settleTimestamp).toISO(),
        netBalanceChange, totalFees, txnHash,
        blockHash, source, erpMetadata
      };
      await this.eventEmitService.emitOnchainReceived(tenantId, txnData);
    }
  };

  private msatsToSats = (msatString: string): number => {
    const msat = Number.parseInt(msatString);
    const sats = msat * 0.001;
    return sats;
  };

  private refreshPayments = async (tenantId: string, user: IUser = null, erpMetadata: ErpMetadata[] = []): Promise<PaymentReference[]> => {
    const paymentsMongo: PaymentReference[] = await this.db.lightningPayments.find({ tenantId: tenantId });
    const loggedPayments = new Set(paymentsMongo.map((payment) => payment.paymentHash));
    // TODO: Fix this type
    const paymentResponse: Object[] = await this.lndService.getOutgoingPayments({ index_offset: 0, reversed: false, max_payments: null, include_incomplete: false }, tenantId);
    const rawPayments = paymentResponse.filter((payment) => !loggedPayments.has(payment["payment_hash"]));

    for (const rawPayment of rawPayments) {
      const settledHtlc = rawPayment['htlcs'].find((htlc) => htlc['status'] === 'SUCCEEDED');
      if (!settledHtlc) continue;
      const settleTimestamp = Number.parseInt(rawPayment["creation_date"]) * 1000;
      const amount: AmountReference = await this.getBtcConversion(settleTimestamp, Number.parseInt(rawPayment["value"]));
      const fees: AmountReference = await this.getBtcConversion(settleTimestamp, this.msatsToSats(settledHtlc['route']['total_fees_msat']));
      const netBalanceChange: AmountReference = await this.getBtcConversion(settleTimestamp, this.msatsToSats(settledHtlc['route']['total_amt_msat']));

      // The outbound channelId is not readily available in the payment object form LND.
      // In order to extract the channelId, we must look at the first hop in the payment route
      // found via -->
      //  const routes = rawPayment['htlcs'];
      //  const route = routes[0];
      //  const routeHops = route.route.hops;
      //  const firstHop = routeHops[0];
      //  const channelId = firstHop['chan_id'];
      const channelId = rawPayment['htlcs'][0].route.hops[0]['chan_id'];

      const paymentRequest = rawPayment['payment_request'];

      const payment: PaymentReference = {
        tenantId: tenantId,
        paymentHash: rawPayment["payment_hash"],
        channelId: channelId,
        settleTimestamp: settleTimestamp,
        status: rawPayment["status"],
        amount: amount,
        feesPaid: fees,
        netBalanceChange: netBalanceChange,
        erpMetadata
      };

      if (!(await this.db.lightningPayments.findOne({ paymentHash: rawPayment['payment_hash'] }))) {
        await this.db.lightningPayments.create(payment).catch(_ => { });

        // Emit Payment Sent Event
        if (user?.featureFlags?.cyclrUserBIP) {
          const paymentData: PaymentSentData = {
            __type: PaymentSentData.__type,
            amount: {
              currency: amount.currency,
              amountFiat: amount.fiatValue,
              amountSats: this.btcToSats(amount.btcValue),
              exchangeRate: amount.exchangeRate
            },
            timestamp: DateTime.fromMillis(settleTimestamp).toISO(),
            paymentRequest: paymentRequest,
            erpMetadata
          };
          const eventRes = await this.eventEmitService.emitPaymentSent(tenantId, paymentData);
          // this.logger.debug(`PaymentSent Event Emit Result: ${eventRes.data.join(',')}`);
        }
      }
    }

    // Fetch the refreshed payments
    const result: PaymentReference[] = await this.db.lightningPayments.find({
      tenantId: tenantId
    });

    return result;
  };

  private calculateNetChannel = (endingState: ChannelActivityReference, invoices: InvoiceReference[], payments: PaymentReference[]) => {
    const endingBalance = endingState.amount.btcValue;
    const sumIn = invoices.reduce((x, y) => x += y.quote.amount.btcValue, 0);
    const sumOut = payments.reduce((x, y) => x += y.amount.btcValue, 0);
    // console.log('total Invoices: ', sumOut);
    // console.log('total Payments: ', Math.fround(sumIn));
    // console.log('ending bal: ', endingBalance);
    const startingBalance = Math.fround(endingBalance - sumIn + sumOut);
    return startingBalance;
  };

  private refreshChannelActivity = async (tenantId: string): Promise<ChannelActivityReference[]> => {
    // Grab all known channel events from Mongo
    const channelsActivitiesMongo: ChannelActivityReference[] = await this.db.lightningChannelActivity.find({ tenantId: tenantId });
    const channelIds = new Set(channelsActivitiesMongo.map((doc) => doc.channelId));
    const channelUtxos = await this.lndService.getChannelEventUtxos(tenantId);

    // Step 1: Handle OPEN Channels

    // Grab all open channels from lnd
    const allOpenChannels = await this.lndService.getChannelsList(tenantId);
    // Filter for untracked channels
    const untrackedOpenChannels: Channel.AsObject[] = allOpenChannels["channels"].filter((x) => !channelIds.has(x["chan_id"]));

    for (const openChannel of untrackedOpenChannels) {
      // calculate the initial balance via: 
      // initial local balance = current local balance + total sent - total received
      const initialBalance = parseInt(openChannel["local_balance"]) + parseInt(openChannel["total_satoshis_sent"]) - parseInt(openChannel["total_satoshis_received"]);

      // calculate the channel OPEN timestamp via..
      const timestamp = DateTime.now().toMillis() - openChannel["lifetime"] * 1000;
      const amount = await this.getBtcConversion(timestamp, initialBalance);

      const result: ChannelActivityReference = {
        tenantId: tenantId,
        action: ChannelActivity.OPEN,
        amount: amount,
        timestamp: timestamp,
        channelId: openChannel["chan_id"]
      };

      // Hotfix
      (await this.db.lightningChannelActivity.findOne(
        { tenantId: tenantId, action: result.action, channelId: result.channelId }
      )) || (await this.db.lightningChannelActivity.create(result).catch(_ => {
        this.logger.warn('Duplicate channel activity caught');
      }));
    }

    /*
      How to handle CLOSED channels 
        - get channel close data from lnd
        - create mongo doc for channel close if not already created
        - if channel open doc exists,
          - exit
        - else, 
          - find invoices/payments involving channel id
          - find channel OPEN utxo
          - use channel close settle value with payments to calculate initial channel state
          - create mongo doc for channel open with initial state
    */

    // Step 2: Handle CLOSE Channels 
    // Step 2a: create CLOSE events in mongo

    // Get closed channels from LND
    const allClosedChannels: ChannelCloseSummary.AsObject[] = await this.lndService.getClosedChannels(tenantId);
    // Get closed channel docs from mongo
    let closedChannelDocs = await channelsActivitiesMongo.filter((x) => x.action === ChannelActivity.CLOSE);
    // Create set of known channelIds for fast lookup
    const closedChannelIds = new Set(closedChannelDocs.map((x) => x.channelId));

    // Filter for untracked closed events
    const untrackedClosedChannels = allClosedChannels.filter((x) => !closedChannelIds.has(x["chan_id"]));

    // Handle channel close events first
    for (const closedChannel of untrackedClosedChannels) {
      // ending balance = settled_balance
      const amountSats = closedChannel["settled_balance"];
      // lookup the timestamp via the corresponding utxo
      const utxoLabel = `0:closechannel:shortchanid-${closedChannel["chan_id"]}`;
      const utxo = channelUtxos.find((x) => x["label"] === utxoLabel);
      if (!utxo) continue;
      const timestamp = parseInt(utxo["time_stamp"]) * 1000;
      const amount = await this.getBtcConversion(timestamp, amountSats);

      const result: ChannelActivityReference = {
        tenantId: tenantId,
        action: ChannelActivity.CLOSE,
        amount: amount,
        timestamp: timestamp,
        channelId: closedChannel["chan_id"]
      };
      // Hotfix
      (await this.db.lightningChannelActivity.findOne(
        { tenantId: tenantId, action: result.action, channelId: result.channelId }
      )) || (await this.db.lightningChannelActivity.create(result).catch(_ => {
        this.logger.warn('Duplicate channel activity caught');
      }));
    }

    // Step 2b: Create corresponding channel OPEN events for closed channels 

    // Check Mongo for corresponding open channel events
    const recordedOpenChannels = await this.db.lightningChannelActivity.find({ tenantId: tenantId, action: ChannelActivity.OPEN });
    const recordedOpenChannelIds = new Set(recordedOpenChannels.map((x) => x.channelId));

    // Get list of known closed channels WITHOUT a matching open channel
    const closedChannelsNoOpen = allClosedChannels.filter((x) => !recordedOpenChannelIds.has(x["chan_id"]));
    // Refresh query to include new entries
    closedChannelDocs = await this.db.lightningChannelActivity.find({ tenantId: tenantId, action: ChannelActivity.CLOSE });

    // For each closed channel without a recorded of the initial commitment, 
    // calculate the initial commitment and record the open event in Mongo
    for (const channel of closedChannelsNoOpen) {
      const channelId = channel["chan_id"];
      const endingState = closedChannelDocs.find((x) => x.channelId === channelId);
      // From the ending state, use all payments and invoices to calculate initial state.
      const invoices: InvoiceReference[] = await this.db.lightningInvoices.find({ tenantId: tenantId, "quote.channelId": channelId });
      const payments: PaymentReference[] = await this.db.lightningPayments.find({ tenantId: tenantId, channelId: channelId });
      const startingState = await this.calculateNetChannel(endingState, invoices, payments);

      // For the channel open, lookup the corresponding utxo for the timestamp
      const utxoLabel = `0:openchannel:shortchanid-${channelId}`;
      const utxo = channelUtxos.find((x) => x["label"] === utxoLabel);

      const timestamp = parseInt(utxo["time_stamp"]) * 1000;
      const amount = await this.getBtcConversion(timestamp, this.btcToSats(startingState));

      const result: ChannelActivityReference = {
        tenantId: tenantId,
        action: ChannelActivity.OPEN,
        amount: amount,
        timestamp: timestamp,
        channelId: channelId
      };
      // Hotfix
      (await this.db.lightningChannelActivity.findOne(
        { tenantId: tenantId, action: result.action, channelId: result.channelId }
      )) || (await this.db.lightningChannelActivity.create(result).catch(_ => {
        this.logger.warn('Duplicate channel activity caught');
      }));
    }

    // Return updated set of docs
    const res = await this.db.lightningChannelActivity.find({ tenantId: tenantId });
    return res;
  };

  private refreshInvoices = async (tenantId: string, user: IUser = null): Promise<InvoiceReference[]> => {
    const invoicesMongo: InvoiceReference[] = await this.db.lightningInvoices.find({ tenantId: tenantId, status: InvoiceStatus.PAID });
    const paymentRequests = new Set(invoicesMongo.map((request) => { return request.settledPayreq; }));

    const invoiceResponse = await this.lndService.getIncomingPayments({ index_offset: 0, pending_only: false, num_max_invoices: 99999, reversed: false }, tenantId);
    const invoicesToCreate = invoiceResponse["invoices"].filter((invoice) => invoice.settled).filter((invoice) => !paymentRequests.has(invoice['payment_request']));

    const payreqQuotesDocs = await this.db.lightningQuotes.find({ tenantId: tenantId });
    const payreqQuotes = new Set(payreqQuotesDocs.map(x => x.paymentRequest));

    // create new invoices from incoming payments that have no matching Connect Mongo invoice
    for (const rawInvoice of invoicesToCreate) {
      // get the most recent quote with invoice ID and matching payment Request (if any)

      // checks against set of payreqs first to avoid unnecessary calls to DB.
      const invoicesQuote: QuoteReference = payreqQuotes.has(rawInvoice.payment_request)
        ? await this.db.lightningQuotes.findOne({ paymentRequest: rawInvoice.payment_request })
        : null;

      const settleTimestamp = DateTime.fromMillis(Math.round(rawInvoice.settle_date) * 1000).toMillis();
      // Get historic price of bitcoin and fiat value
      const amount = await this.getBtcConversion(settleTimestamp, Number.parseInt(rawInvoice.value));
      const invoiceId = invoicesQuote ? invoicesQuote.invoiceId : uuidv4(); // if we have a matching quote, use that invoice ID, if not create a UUID
      const invoiceData: InvoiceReference = {
        invoiceId: invoiceId,
        tenantId: tenantId,
        description: rawInvoice.memo || `Received ${tenantId}`,
        status: InvoiceStatus.PAID,
        amount: {
          currency: amount.currency,
          fiatValue: amount.fiatValue
        },
        quote: {
          invoiceId: invoiceId,
          tenantId: tenantId,
          quoteId: invoicesQuote ? invoicesQuote.quoteId : uuidv4(), // generate or use existing
          paymentRequest: rawInvoice.payment_request,
          channelId: rawInvoice.htlcs[0]['chan_id'],
          expiration: Number.parseInt(rawInvoice.expiry) * 1000 + Number.parseInt(rawInvoice.creation_date) * 1000,
          status: QuoteStatus.PAID,
          amount: amount
        },
        settleTimestamp: settleTimestamp,
        settledPayreq: rawInvoice.payment_request,
      };
      const foundDoc = await this.db.lightningInvoices.findOneAndUpdate(
        { invoiceId, tenantId },
        invoiceData,
        { upsert: true, new: true }
      ).catch(_ => {
        this.logger.warn('Failed to update or create invoice doc.');
        return false;
      });

      // If we failed to create or update the invoice doc, skip to next invoice. 
      // Because the payreq must be unique, if this fails it means we have seen this invoice before.
      if (!foundDoc) continue

      // Delete quote docs from Quotes collection
      await this.db.lightningQuotes.model.deleteMany({ invoiceId: invoiceId });

      // Emit Payment Received Event
      if (user?.featureFlags?.cyclrUserBIP) {
        const paymentData: PaymentReceivedData = {
          __type: PaymentReceivedData.__type,
          source: foundDoc instanceof Document ? foundDoc?.source : 'unknown',
          amount: {
            currency: invoiceData.quote.amount.currency,
            amountFiat: invoiceData.quote.amount.fiatValue,
            amountSats: this.btcToSats(invoiceData.quote.amount.btcValue),
            exchangeRate: invoiceData.quote.amount.exchangeRate
          },
          paymentRequest: invoiceData.settledPayreq,
          timestamp: DateTime.fromMillis(settleTimestamp).toISO(),
          erpMetadata: foundDoc instanceof Document ? foundDoc?.erpMetadata : []
        };
        await this.eventEmitService.emitPaymentReceived(tenantId, paymentData);
      }
    }

    const updatedInvoices = await this.db.lightningInvoices.find({ tenantId: tenantId, status: InvoiceStatus.PAID });

    return updatedInvoices;
  };


  private aggregateTotals = async (
    tenantId: string,
    invoices: InvoiceReference[],
    payments: PaymentReference[],
    channelEvents: ChannelActivityReference[],
    onchainTxns: BitcoinTxnReference[],
    start: number,
    end: number,
    interval: NetworkDataInterval,
    timezone: string = 'America/New_York'
  ): Promise<{ moneyIn: number[]; moneyOut: number[]; timestamps: number[]; onchainBalances: number[], offchainBalances: number[], combinedBalances: number[] }> => {
    // Convert start and end date to `DateTime` object.
    const startDate: DateTime = DateTime.fromMillis(start).setZone(timezone).startOf(this.dateFloor(interval));
    const endDate: DateTime = DateTime.fromMillis(end).setZone(timezone).plus({ day: 1 }).startOf(this.dateFloor(interval));

    // Validate Timezone
    if (!startDate.isValid || !endDate.isValid) returnErrorStatus(StatusCodes.BAD_REQUEST, `Invalid Start or End Date: ${timezone}`, { log: false });

    // Gets the desired length of array for interval and divide a time series evenly with length
    // NOTE: Interval is inclusive of start but NOT end, so if our intention is to chart the end date, we need to plus 1 day

    const totalInterval = Interval.fromDateTimes(startDate, endDate);
    const intervals = totalInterval.splitBy(Duration.fromObject({ day: 1 }));

    // Interval start and end should be EXACTLY 1 day apart.
    // ex. 2022-11-02T00:00:00.000-04:00/2022-11-03T00:00:00.000-04:00
    //
    // intervals.forEach(x => console.log(x.toISO()));

    // Time stamp object
    const timeSeriesInvoices = {};
    const timeSeriesPayments = {};
    const timeSeriesChannels = {};
    const timeSeriesOnchain = {};
    const timeSeriesBalances = {};

    // Set object with time intervals with an empty array
    intervals.forEach((inter) => {
      timeSeriesInvoices[inter.start.toMillis()] = [];
      timeSeriesPayments[inter.start.toMillis()] = [];
      timeSeriesChannels[inter.start.toMillis()] = [];
      timeSeriesOnchain[inter.start.toMillis()] = [];
      timeSeriesBalances[inter.start.toMillis()] = [];
    });

    // Get invoices by each day (unix millis)
    for (const invoice of invoices) {
      const beginningUnix = DateTime.fromMillis(invoice.settleTimestamp).setZone(timezone).startOf(this.dateFloor(interval)).toMillis();
      if (timeSeriesInvoices[beginningUnix]) timeSeriesInvoices[beginningUnix].push(invoice);
    }

    // Get payments by each day (unix millis)
    for (const payment of payments) {
      const beginningUnix = DateTime.fromMillis(payment.settleTimestamp).setZone(timezone).startOf(this.dateFloor(interval)).toMillis();
      if (timeSeriesPayments[beginningUnix]) timeSeriesPayments[beginningUnix].push(payment);
    }

    // Get channelEvents by each day (unix millis)
    for (const channelEvent of channelEvents) {
      const beginningUnix = DateTime.fromMillis(channelEvent.timestamp).setZone(timezone).startOf(this.dateFloor(interval)).toMillis();
      if (timeSeriesChannels[beginningUnix]) timeSeriesChannels[beginningUnix].push(channelEvent);
    }

    // Get onchainTxns by each day (unix millis)
    for (const txn of onchainTxns) {
      const beginningUnix = DateTime.fromMillis(txn.blockTimestamp).setZone(timezone).startOf(this.dateFloor(interval)).toMillis();
      if (timeSeriesOnchain[beginningUnix]) timeSeriesOnchain[beginningUnix].push(txn);
    }

    const response = {
      timestamps: [],
      moneyIn: [],
      moneyOut: [],
      onchainBalances: [],
      offchainBalances: [],
      combinedBalances: []
    };

    // Get timestamps for chart (x axis)
    const timestamps = await intervals.map((i) => i.start.toMillis());
    const channelSums = await Object.values(timeSeriesChannels).map(this.getSumOfDayChannels);
    // Calculate net money in/out from channel opens/closes per day
    const moneyInChannels = channelSums.map(x => x.moneyInChannels);
    const moneyOutChannels = channelSums.map(x => x.moneyOutChannels);
    const onchainSums = await Object.values(timeSeriesOnchain).map(this.getSumOfDayOnchain);
    // Calculate net money in/out from onchain transactions per day
    const moneyInOnchain = onchainSums.map(x => x.moneyInTxns);
    const moneyOutOnchain = onchainSums.map(x => x.moneyOutTxns);
    // Calculate net money in/out from payments per day
    const moneyInInvoices = await Object.values(timeSeriesInvoices).map(this.getSumOfDayInvoice);
    const moneyOutInvoices = await Object.values(timeSeriesPayments).map(this.getSumOfDayPayment);


    // Combine money in/out from channels and payments for chart
    // const moneyIn = this.sumArrays(moneyInChannels, moneyInInvoices);
    // const moneyOut = this.sumArrays(moneyOutChannels, moneyOutInvoices);
    const moneyInOffchain = this.sumArrays(moneyInChannels, moneyInInvoices);
    const moneyOutOffchain = this.sumArrays(moneyOutChannels, moneyOutInvoices);

    const moneyIn = this.sumArrays(moneyInInvoices, moneyInOnchain);
    const moneyOut = this.sumArrays(moneyOutInvoices, moneyOutOnchain);

    const balance = await this.updateBalance(tenantId);
    const onchainBalances = [];
    const offchainBalances = [];
    const len = timestamps.length;
    // balances.push(this.btcToSats(offchainBalance.amount.btcValue + onchainBalance.amount.btcValue));
    onchainBalances.push(this.btcToSats(balance.onchainAmount.btcValue));
    offchainBalances.push(this.btcToSats(balance.offchainAmount.btcValue));

    for (let i = 1; i < len; i++) {
      // Get the previous day's balance
      // balances[n-1] = balance[n] - moneyIn[n] + moneyOut[n]
      // balances.push(Math.round(balances[i - 1] - moneyIn[len - i] + moneyOut[len - i]));
      onchainBalances.push(Math.round(onchainBalances[i - 1] - moneyInOnchain[len - i] + moneyOutOnchain[len - i]));
      offchainBalances.push(Math.round(offchainBalances[i - 1] - moneyInInvoices[len - i] + moneyOutInvoices[len - i]));
    }
    // balances.reverse();
    onchainBalances.reverse();
    offchainBalances.reverse();
    const combinedBalances = this.sumArrays(onchainBalances, offchainBalances);

    response.timestamps = timestamps;
    response.moneyIn = moneyIn;
    response.moneyOut = moneyOut;
    response.onchainBalances = onchainBalances;
    response.offchainBalances = offchainBalances;
    response.combinedBalances = combinedBalances;

    return response;
  };
  private generateOnchainUri = (address: string, amount: number, label: string) => {
    return new URL(`bitcoin:${address}?amount=${amount}&label=${label}`);
  };

  private sumArrays = (arr1: number[], arr2: number[]) => {
    const out = arr1.map((_, i) => arr1[i] + arr2[i]);
    return out;
  };

  private dateFloor = (interval: NetworkDataInterval) => {
    switch (interval) {
      case NetworkDataInterval.HOURLY:
        return "hour";
      case NetworkDataInterval.DAILY:
        return "day";
      case NetworkDataInterval.MONTHLY:
        return "month";
      default:
        return "day";
    }
  };

  private invoiceStatus = (status: number | string) => {
    switch (status) {
      case 0:
      case "OPEN":
        return InvoiceState.OPEN;
      case 1:
      case "SETTLED":
        return InvoiceState.SETTLED;
      case 2:
      case "CANCELED":
        return InvoiceState.CANCELED;
      case 3:
      case "ACCEPTED":
        return InvoiceState.ACCEPTED;
      default:
        return InvoiceState.OPEN;
    }
  };
  // #endregion PRIVATE METHODS
}
