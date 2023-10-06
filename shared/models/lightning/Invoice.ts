import { IsNumber, IsString } from "class-validator";
import { ErpMetadata, IntegrationTransactionReference } from "./Integration";
import { RouteHopHints } from "./Channels";

export enum InvoiceStatus {
  // The invoice has been created but not paid.
  PENDING = "PENDING",
  // The invoice has been paid.
  PAID = "PAID",
  // The invoice has been canceled.
  CANCELED = "CANCELED",
  // The invoice has expired.
  EXPIRED = "EXPIRED"
}

export enum TxnStatus {
  // The transaction is in the mempool and is waiting to be mined
  SUBMITTED = "SUBMITTED",
  // The transaction has been included in a block and is awaiting block confirmations
  MINED = "MINED",
  // The transaction has been mined and has received X confirmations
  CONFIRMED = "CONFIRMED",
  // The transaction has been dropped from the mempool.
  CANCELED = "CANCELED"
}
export interface ObjectsResponseReference {
  invoices: InvoiceReference[];
  payments: PaymentReference[];
  channelEvents: ChannelActivityReference[];
  onchainTxns: BitcoinTxnReference[];
  balances: BalanceReference[];
  onchainInvoices: OnchainInvoice[];
}

export enum QuoteStatus {
  OPEN = "OPEN",
  PAID = "PAID",
  EXPIRED = "EXPIRED",
  CANCELED = "CANCELED"
}

export interface AmountReference {
    fiatValue: number;
    currency: string;
    btcValue: number;
    exchangeRate: number;
}
export interface BalanceReference {
  tenantId: string;
  timestamp: number;
  onchainAmount: AmountReference;
  offchainAmount: AmountReference;
}
export class PriceReference {
  timestamp: number;
  currency: string;
  exchangeRate: number;
}

export interface PayInvoiceBody {
    payment_request: string
    timeout_seconds: number
    fee_limit_sat: number
    no_inflight_updates: boolean
  }

export interface BitcoinTxnReference {
  txnHash: string;
  blockHash: string;
  tenantId: string; // Passed in the Params of the endpoint or in the body of the create and Update calls..
  description?: string;
  status: TxnStatus;
  erpMetadata?: ErpMetadata[];
  amount: AmountReference; // not including fees
  totalFees: AmountReference; // txn fees
  netBalanceChange: AmountReference; // amount including fees (for sends)
  isSender: boolean; // True reflects withdrawal (amountReceived), False reflects deposit (amountSent)
  receiver: string;
  submittedTimestamp?: number;
  blockTimestamp?: number;
}

export interface PaymentReference {
  tenantId: string;
  paymentHash: string;
  settleTimestamp?: number;
  status: PaymentStatus;
  amount: AmountReference;
  channelId: string;
  integrations?: IntegrationTransactionReference[];
  erpMetadata?: ErpMetadata[];
  feesPaid?: AmountReference;
  netBalanceChange?: AmountReference;
}
export interface OnchainQuote {
  quoteId: string;
  invoiceId: string;
  tenantId: string;
  expiration: number;
  status: QuoteStatus;
  amount: AmountReference;
  uri: string;
}

export interface QuoteReference {
  quoteId: string;
  invoiceId: string;
  tenantId: string;
  paymentRequest: string;
  expiration: number;
  status: QuoteStatus;
  channelId?: string; // ChannelId corresponding to the settled payment.
  amount: AmountReference;
}


export const PaymentSources = ["pos", "erpinvoice", "unknown", "legacy-qbo"] as const;
export type PaymentSource = typeof PaymentSources[number];
export interface InvoiceReference {
  invoiceId: string;
  tenantId: string; // Passed in the Params of the endpoint or in the body of the create and Update calls..
  description: string;
  status: InvoiceStatus;
  quote?: QuoteReference;
  integrations?: IntegrationTransactionReference[];
  erpMetadata?: ErpMetadata[];
  amount: {
    fiatValue: number;
    currency: string;
  };
  settleTimestamp?: number;
  settledPayreq?: string;
  source?: PaymentSource;
}
export interface OnchainInvoice {
  invoiceId: string;
  tenantId: string; // Passed in the Params of the endpoint or in the body of the create and Update calls..
  description: string;
  status: InvoiceStatus;
  erpMetadata?: ErpMetadata[];
  amount: {
    fiatValue: number;
    currency: string;
  };
  settleTimestamp?: number;
  source?: PaymentSource;
  onchainAddress: string;
  paidTransaction?: BitcoinTxnReference;
}
export interface ChannelActivityReference {
  tenantId: string; // Passed in the Params of the endpoint or in the body of the create and Update calls..
  action: ChannelActivity;
  channelId: string;
  amount: AmountReference;
  timestamp: number;
}


export class Quote implements QuoteReference {
  quoteId: string;
  invoiceId: string;
  tenantId: string;
  paymentRequest: string;
  expiration: number;
  channelId: string
  status: QuoteStatus;
  amount: AmountReference;

  constructor(quoteDef: QuoteReference) {
    Object.assign(this, quoteDef);
  }

  toJSON() {
    return {
      quoteId: this.quoteId,
      invoiceId: this.invoiceId,
      paymentRequest: this.paymentRequest,
      channelId: this.channelId,
      expiration: this.expiration,
      status: this.status,
      amount: this.amount
    };
  }
}

export class Invoice implements InvoiceReference {
  invoiceId: string;
  tenantId: string; // Passed in the Params of the endpoint or in the body of the create and Update calls..
  description: string;
  status: InvoiceStatus;
  quote?: QuoteReference;
  integrations?: IntegrationTransactionReference[];
  amount: {
    fiatValue: number;
    currency: string;
  };
  created: Date;

  constructor(quoteDef: QuoteReference) {
    Object.assign(this, quoteDef);
  }

  get toJSON() {
    return {
      invoiceId: this.invoiceId,
      tenantId: this.tenantId, // Passed in the Params of the endpoint or in the body of the create and Update calls..
      description: this.description,
      status: this.status,
      quote: this.quote,
      integrations: this.integrations,
      amount: this.amount,
      created: this.created,
    };
  }
}

export interface BtcFiatValue {
  btcValue: number;
  fiatValue: number;
}

export interface Bolt11PaymentDetails {
  status: PaymentStatus;
  message: string;
}
export interface CancelBolt11 {
  cancelled: boolean;
}

export enum InvoiceState {
  OPEN = 0,
  SETTLED = 1,
  CANCELED = 2,
  ACCEPTED = 3
}

export type TypeOfInvoice = "onchain" | "offchain"

export enum PaymentStatus {
  UNKNOWN = "UNKNOWN",
  IN_FLIGHT = "IN_FLIGHT",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED"
}

export enum ChannelActivity {
  OPEN = "OPEN",
  CLOSE = "CLOSE"
}

export enum PaymentType {
  Lightning = "lightning",
  Quickbooks = "quickbooks",
  Erp = "erp"
}
