import { HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { HttpService, HttpRequestConfig } from "@blockspaces/shared/services/http";
import { EnvironmentVariables, ENV_TOKEN } from "../../../env";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { ConnectDbDataContext } from '../../../connect-db/services/ConnectDbDataContext';
import { DateTime } from 'luxon';
import { AmountReference, BitcoinTxnReference, InvoiceReference, InvoiceState, InvoiceStatus, OnchainInvoice, OnchainQuote, PaymentSource, PaymentSources, PriceReference, QuoteStatus, TxnStatus } from '@blockspaces/shared/models/lightning/Invoice';
import { returnErrorStatus } from "../../../exceptions/utils";
import { v4 as uuidv4 } from "uuid";
import { ErpMetadata } from "@blockspaces/shared/models/lightning/Integration";
import { LndService } from "../../lightning/lnd/services/LndService";
import { BitcoinService } from "./BitcoinService";
import { encode } from 'bip21';
import { IUser } from "@blockspaces/shared/models/users";
import { Amount, OnchainReceivedData, OnchainSentData } from "../../../../../shared/models/webhooks/WebhookTypes";
import { EventEmitService } from "../../../webhooks/services/EventEmitService";
import { Document } from "mongoose";

const defaultMetadata: ErpMetadata = {
  dataType: 'posted',
  value: ' ',
  domain: 'QBO'
};
@Injectable()
export class BitcoinInvoiceService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly lndService: LndService,
    private readonly bitcoinService: BitcoinService,
    private readonly db: ConnectDbDataContext,
    private readonly eventEmitService: EventEmitService
  ) {
    logger.setModule(this.constructor.name);
  }


  /**
   * Creates an "Invoice" entry in Mongo DB for a specified FIAT amount... This would represent a "charge"/"invoice" in quickbooks.
   *
   * When an invoice is about to be paid (the payer navigates to the checkout page), a "quote" is generated that reflects the current price of bitcoin.
   *
   * @param currency
   * @param amount
   * @param memo
   * @param tenantId
   * @param erpMetadata
   * @param source
   * @returns Promise<ApiResult>
   */
  createInvoice = async (currency: string, amount: number, memo: string, tenantId: string, erpMetadata: ErpMetadata[] = [], source: PaymentSource = "unknown"): Promise<OnchainInvoice> => {
    if (!amount || amount <= 0) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, "Invoice amount must be specified or greater than zero.", { log: false });
    }
    const user = await this.db.users.findOne({ tenants: tenantId });
    if (user?.featureFlags?.cyclrUserBIP && erpMetadata?.length === 0) {
      const defaultMetadata: ErpMetadata = {
        dataType: 'posted',
        value: ' ',
        domain: 'QBO'
      };
      erpMetadata.push(defaultMetadata);
    }

    const onchainAddress = await this.lndService.getOnchainAddress(tenantId);
    const invoice: OnchainInvoice = {
      invoiceId: uuidv4(),
      tenantId: tenantId,
      description: memo,
      status: InvoiceStatus.PENDING,
      erpMetadata,
      amount: {
        currency: currency,
        fiatValue: amount
      },
      source,
      onchainAddress
    };
    try {
      // Step 1: Add Invoice to Mongo
      const document = await this.db.bitcoinInvoices.create(invoice);
      return document;
    } catch (e) {
      this.logger.error(`Unable to create Invoice for ${tenantId}`, e, { data: { currency: currency, amount: amount, memo: memo, tenantId: tenantId } });
      return null;
    }
  };

  /**
   * Fetches the current price of bitcoin and creates a on-chain payment URI for a given invoiceId.
   *
   * The expiration time should be low (default 300s) to reduce the receiver's exposure to bitcoin's volatility.
   *
   * @param invoiceId
   * @param expirationsInSecs
   * @param tenantId
   * @returns Promise<ApiResult> OnchainQuote
   */
  generateQuote = async (invoiceId: string, expirationInSecs: number = 300, tenantId: string): Promise<OnchainQuote> => {
    // Step 1: Fetch Invoice from mongo
    const document: OnchainInvoice = await this.db.bitcoinInvoices.findOne({ tenantId: tenantId, invoiceId: invoiceId });

    if (document === null) {
      throw new NotFoundException(`onchain invoiceId: ${invoiceId} not found in MongoDB.`);
    }
    if (document.status !== InvoiceStatus.PENDING) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, `Quote generation failed. Invoice has status: ${document.status}`, { log: false });
    }


    const quote: OnchainQuote = {
      quoteId: uuidv4(),
      invoiceId: invoiceId,
      tenantId: tenantId,
      expiration: DateTime.now().toMillis() + expirationInSecs * 1000,
      status: QuoteStatus.OPEN,
      amount: {
        fiatValue: document.amount.fiatValue,
        currency: document.amount.currency,
        btcValue: null,
        exchangeRate: null
      },
      uri: null
    };

    // Step 2: Convert fiat to BTC
    const convertResult = await this.bitcoinService.convertInvoiceToBtc(document.amount.fiatValue, DateTime.now().toMillis(), document.amount.currency);
    quote.amount.exchangeRate = convertResult.exchangeRate;

    // Get the bitcoin value from the invoice array
    const btc = convertResult.invoice.filter((obj: { currency: string; }) => obj.currency === "BTC")[0];
    // Convert to sats
    quote.amount.btcValue = btc.amount;

    // TODO: ADD FEES
    const uri = encode(document.onchainAddress, {
      amount: btc.amount,
      label: document.description
    });
    quote.uri = uri;

    try {
      // Step 4: Add Quote to Mongo
      const quoteDoc = await this.db.bitcoinQuotes.create(quote);
      return quoteDoc;
    } catch (error) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, { error });
      return null;
    }
  };

  /**
   * Queries quotes corresponding to invoiceId, checks the status of each quote, and updates the statuses of quotes and invoices with new information.
   *
   * @param invoiceId String
   * @param tenantId String
   * @param user IUser
   * @returns Promise<OnchainInvoice>
   */
  getInvoiceStatus = async (invoiceId: string, tenantId: string, user: IUser = null): Promise<OnchainInvoice> => {
    // Step 1: Get Invoice from Mongo
    const invoiceDoc = await this.db.bitcoinInvoices.findOne({
      invoiceId: invoiceId,
      tenantId: tenantId
    });

    if (!invoiceDoc) {
      throw new NotFoundException(`onchain invoiceId: ${invoiceId} not found in MongoDB.`);
    }
    if (invoiceDoc.status === InvoiceStatus.PAID && invoiceDoc?.paidTransaction?.status === 'CONFIRMED') {
      return invoiceDoc;
    }


    // Step 2: Get the bsc_macaroon and cert from Mongo
    const nodeData = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: { $exists: false } });
    if (!nodeData) {
      returnErrorStatus(HttpStatus.NOT_FOUND, `Node data for tenantId: ${tenantId} not found.`, { log: false });
    }

    // Step 3: Get corresponding Quotes from Mongo
    const quotesDocs: OnchainQuote[] = await this.db.bitcoinQuotes.find({
      invoiceId: invoiceId
    });
    if (quotesDocs.length === 0) {
      return invoiceDoc;
    }

    // Step 4: Check if each quote has been paid or expired
    for (const quote of quotesDocs) {

      // Get transaction status from LnNode
      const onchainAddress = invoiceDoc.onchainAddress;
      const pendingUtxos = await this.lndService.getPendingTransactions(tenantId);
      const transactions = await this.lndService.getBitcoinTransactions({}, tenantId);
      const pendingUtxo = pendingUtxos?.find(x => x.address === onchainAddress);
      const pendingTxn = transactions?.find(x => x['dest_addresses']?.includes(onchainAddress));

      // Did not find bolt11 on node


      // If an onchain transaction has been detected...
      if (pendingTxn) {
        const blockHash = pendingTxn['block_hash'];
        const settleTimestamp = Number.parseInt(pendingTxn["time_stamp"]) * 1000;
        const txnHash = pendingTxn['tx_hash'];

        const netBalanceChangeSats = pendingTxn["amount"];
        const netBalanceChange: Amount = await this.getSatsConversion(settleTimestamp, netBalanceChangeSats);
        const isSender = netBalanceChangeSats < 0;

        const feesSats = Number.parseInt(pendingTxn['total_fees']);
        const totalFees: Amount = await this.getSatsConversion(settleTimestamp, feesSats);

        const numConfs = pendingTxn['num_confirmations'];
        const inputs = pendingTxn['previous_outpoints'];

        const ourInputs = inputs.filter(x => x['is_our_output']);
        const outputs: Array<any> = pendingTxn['output_details'];
        const ourOutputs = outputs.filter(x => x['is_our_address']);
        const otherOutputs = outputs.filter(x => !x['is_our_address']);

        let receiver = "unknown";

        try {
          receiver = !isSender ? ourOutputs[0]['address'] : otherOutputs[0]['address'];
        } catch (e) {
          this.logger.warn('Failed to identify receiver of onchain Txn');
        }

        const amountSats = isSender ? Math.abs(netBalanceChangeSats) - feesSats : netBalanceChangeSats;
        const amount = await this.getSatsConversion(settleTimestamp, amountSats);

        const status = blockHash === '' ? TxnStatus.SUBMITTED : numConfs > 4 ? TxnStatus.CONFIRMED : TxnStatus.MINED;
        const txn: BitcoinTxnReference = {
          blockHash, txnHash, tenantId, status,
          amount: this.amountToAmountRef(amount),
          totalFees: this.amountToAmountRef(totalFees),
          netBalanceChange: this.amountToAmountRef(netBalanceChange),
          isSender, blockTimestamp: settleTimestamp, receiver
        };

        quote.status = QuoteStatus.PAID;
        // Update the invoice Model with the paid quote
        await this.db.bitcoinInvoices.findOneAndUpdate(
          { invoiceId: invoiceId },
          { status: InvoiceStatus.PAID, settleTimestamp: settleTimestamp, paidTransaction: txn }
        ).catch(e => {
          this.logger.warn('Failed to update invoice with settled quote', e);
          return;
        });
        // Emit Payment Received Event
        if (user?.featureFlags?.cyclrUserBIP) {
          const paymentData: OnchainReceivedData = {
            __type: OnchainReceivedData.__type,
            source: invoiceDoc?.source ?? 'unknown',
            amount: {
              currency: quote.amount.currency,
              amountFiat: quote.amount.fiatValue,
              amountSats: this.btcToSats(quote.amount.btcValue),
              exchangeRate: quote.amount.exchangeRate
            },
            totalFees: totalFees,
            netBalanceChange: netBalanceChange,
            txnHash: txnHash,
            blockHash: blockHash,
            timestamp: DateTime.fromMillis(settleTimestamp).toISO(),
            erpMetadata: invoiceDoc?.erpMetadata ?? [defaultMetadata]
          };
          const eventRes = await this.eventEmitService.emitOnchainReceived(tenantId, paymentData);
          // this.logger.debug(`PaymentReceived Event Emit Result: ${eventRes.data.join(',')}`);
        }

        // Quote is expired
      } else if (this.invoiceStatus(quote.status) === InvoiceState.CANCELED) {
        // Await delete quote from LnNode, then delete from mongo
        await this.db.bitcoinQuotes.findOneAndDelete({ quoteId: quote.quoteId });
      }

      // quote is still pending, pass

    }
    const invoiceResult = await this.db.bitcoinInvoices.findOne({
      invoiceId: invoiceId
    });
    return invoiceResult;

  };

  /**
   * Update onchain invoice in mongo to 'CANCELLED', deletes corresponding quotes from mongo and Lightning node.
   *
   * @param invoiceId String
   * @returns Promise<ApiResult>
   */
  cancelInvoice = async (invoiceId: string, tenantId: string): Promise<OnchainInvoice> => {
    const invoice = await this.db.bitcoinInvoices.findOne({
      tenantId: tenantId, invoiceId: invoiceId
    });
    if (!invoice) {
      returnErrorStatus(HttpStatus.NOT_FOUND, `Invoice cancellation failed. Invoice not found.`, { log: false });
    }
    if (invoice.status !== InvoiceStatus.PENDING) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, `Invoice cancellation failed. Invoice status is ${invoice.status}`, { log: false });
    }
    // Update invoice status
    const updatedInvoice = await this.db.bitcoinInvoices.findOneAndUpdate(
      { invoiceId },
      { status: InvoiceStatus.CANCELED },
      { new: true }
    ).catch(_ => {
      this.logger.warn('Failed to update invoice doc status.');
      return null;
    });

    // Delete from Mongo
    await this.db.bitcoinQuotes.model.deleteMany({ invoiceId: invoiceId });

    return updatedInvoice;
  };

  refreshOnchainTxns = async (tenantId: string, user: IUser = null): Promise<BitcoinTxnReference[]> => {
    const txnsMongo: BitcoinTxnReference[] = await this.db.bitcoinTransactions.find({ tenantId: tenantId });
    const loggedTxns = new Set(txnsMongo.map((txn) => txn.txnHash));
    // TODO: Fix this type
    const txnsResponse: Object[] = await this.lndService.getUtxos(tenantId);
    const rawTxnObjects = txnsResponse.filter((txn) => !loggedTxns.has(txn["tx_hash"]));

    for (const rawTxn of rawTxnObjects) {
      const blockHash = rawTxn['block_hash'];
      const settleTimestamp = Number.parseInt(rawTxn["time_stamp"]) * 1000;
      const txnHash = rawTxn['tx_hash'];

      const netBalanceChangeSats = Number.parseInt(rawTxn["amount"]);
      const netBalanceChange: Amount = await this.getSatsConversion(settleTimestamp, netBalanceChangeSats);
      const isSender = netBalanceChangeSats < 0;

      const feesSats = Number.parseInt(rawTxn['total_fees']);
      const totalFees: Amount = await this.getSatsConversion(settleTimestamp, feesSats);

      const numConfs = rawTxn['num_confirmations'];
      const inputs = rawTxn['previous_outpoints'];

      const ourInputs = inputs.filter(x => x['is_our_output']);
      const outputs: Array<any> = rawTxn['output_details'];
      const ourOutputs = outputs.filter(x => x['is_our_address']);
      const otherOutputs = outputs.filter(x => !x['is_our_address']);

      let receiver = "unknown";

      try {
        receiver = !isSender ? ourOutputs[0]['address'] : otherOutputs[0]['address'];
      } catch (e) {
        this.logger.warn('Failed to identify receiver of onchain Txn');
      }

      const amountSats = isSender ? Math.abs(netBalanceChangeSats) - feesSats : netBalanceChangeSats;
      const amount = await this.getSatsConversion(settleTimestamp, amountSats);

      const status = blockHash === '' ? TxnStatus.SUBMITTED : numConfs > 4 ? TxnStatus.CONFIRMED : TxnStatus.MINED;
      const txn: BitcoinTxnReference = {
        blockHash, txnHash, tenantId, status,
        amount: this.amountToAmountRef(amount),
        totalFees: this.amountToAmountRef(totalFees),
        netBalanceChange: this.amountToAmountRef(netBalanceChange),
        isSender, blockTimestamp: settleTimestamp, receiver
      };

      if (status !== TxnStatus.CONFIRMED && status !== TxnStatus.MINED) {
        continue;
      }
      const existingDoc = await this.db.bitcoinTransactions.findOne({ tenantId, txnHash });
      if (existingDoc) {
        continue;
      }
      if (!isSender) {
        const invoiceUpdates: Partial<OnchainInvoice> = {
          status: InvoiceStatus.PAID,
          settleTimestamp,
          paidTransaction: txn
        };
        const invoiceDoc = await this.db.bitcoinInvoices.findOneAndUpdate(
          { onchainAddress: receiver, tenantId, 'paidTransaction.txnHash': txn.txnHash },
          invoiceUpdates,
          { upsert: true, new: true }
        ).catch(e => {
          this.logger.warn('Failed to update or create onchain invoice doc.', e);
          return false;
        });
        if (invoiceDoc instanceof Document && user?.featureFlags?.cyclrUserBIP) {
          if (invoiceDoc.erpMetadata?.length === 0) {
            await this.db.bitcoinInvoices.findOneAndUpdate(
              { 'paidTransaction.txnHash': txn.txnHash },
              { erpMetadata: [defaultMetadata] }
            );
          }
          const paymentData: OnchainReceivedData = {
            __type: OnchainReceivedData.__type,
            source: invoiceDoc?.source ?? 'unknown',
            amount, totalFees, netBalanceChange,
            txnHash, blockHash,
            timestamp: DateTime.fromMillis(settleTimestamp).toISO(),
            erpMetadata: invoiceDoc?.erpMetadata ?? [defaultMetadata]
          };
          const eventRes = await this.eventEmitService.emitOnchainReceived(tenantId, paymentData);
        }
      }
      await this.db.bitcoinTransactions.findOneAndUpdate(
        { txnHash: txn.txnHash, tenantId }, txn, { upsert: true }
      ).catch(e => {
        this.logger.warn('Failed to create btc txn document', e);
      });

      // Emit Payment Sent Event
      if (user?.featureFlags?.cyclrUserBIP) {
        this.emitOnchainEvent(tenantId, amount, netBalanceChange, totalFees, txnHash, blockHash, settleTimestamp, isSender, receiver);
      }
    }

    // Fetch the refreshed payments
    const result: BitcoinTxnReference[] = await this.db.bitcoinTransactions.find({
      tenantId
    });

    return result;
  };

  private btcToSats = (btc: number) => {
    return Math.round(btc * 10 ** 8);
  };

  private satsToBtc = (sats: number) => {
    const btcValue = Number.parseFloat((sats / 10 ** 8).toFixed(8));
    return btcValue;
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

}
