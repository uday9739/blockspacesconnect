// import { makeAutoObservable, runInAction } from "mobx";
// import { DataStore, IDataStore } from "../../../../platform/api";
// import { LightningTransport } from "../transport/lightning-transport";
// import { NodeInfo, NodeBalance, BitcoinTransaction, OutgoingPayments, IncomingPayments, NewAddress, DecodeInvoice, Channel } from '@blockspaces/shared/models/spaces/Lightning';
// import { BalanceReference, InvoiceReference, PaymentReference, QuoteReference } from '@blockspaces/shared/models/lightning/Invoice';
// import { ObservableLightningNetwork } from "./observable-ln";
// import config from "../../../../../config";
// import { NetworkId } from '@blockspaces/shared/models/networks/Network';
// import { Timestamp } from "@blockspaces/shared/types/date-time";
// import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
// import { LightningChartData } from "@blockspaces/shared/dtos/lightning";
// import { LightningNodeReference, LightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";
// import { DateTime } from "luxon";

// export class LightningStore implements IDataStore {
//   dataStore: DataStore;
//   network: ObservableLightningNetwork;
//   nodeHealth: LightningOnboardingStep;
//   onboardStep: LightningOnboardingStep;
//   nodeBalance: NodeBalance;
//   nodeDoc: LightningNodeReference;
//   bitcoinTransactions: BitcoinTransaction[];
//   outgoingPayments: OutgoingPayments;
//   paidHistory: InvoiceReference[];
//   activity: { invoices: InvoiceReference[]; payments: PaymentReference[]; balances: BalanceReference[] };
//   channels: Channel[];
//   chartData: LightningChartData;
//   nodeInfo: any;
//   currentTenantId: string;

//   constructor(dataStore: DataStore, private readonly transport: LightningTransport = LightningTransport.instance) {
//     makeAutoObservable(this);
//     this.dataStore = dataStore;
//     this.network = new ObservableLightningNetwork({
//       _id: NetworkId.LIGHTNING,
//       name: "Bitcoin Invoicing & Payments",
//       logo: `${config.HOST_URL}/images/light-lightningnetwork.png`,
//       description: "description"
//     });
//   }

//   reset() {
//     this.network = new ObservableLightningNetwork({
//       _id: NetworkId.LIGHTNING,
//       name: "Lightning Network",
//       logo: `${config.HOST_URL}/images/light-lightningnetwork.png`,
//       description: "description"
//     });
//   }


//   /**
//    * Checks the status of the node.
//    * 
//    * @returns `LightningOnboardingStep`
//    */
//   async heyhowareya(): Promise<LightningOnboardingStep> {
//     const result = await this.transport.heyhowareya()
//     this.network.setNodeHealth(result.data)
//     runInAction(() => (this.nodeHealth = result.data))
//     return result.data
//   }

//   /**
//    * Adds BENs as node peers.  
//    */
//   async addPeers(): Promise<any> {
//     const result = await this.transport.addPeers();
//     return result;
//   }
//   /**
//    * Requests inbound from BENs to client node. 
//    * @returns 
//    */
//   async requestInbound(sats: number = 20_000): Promise<any> {
//     const result = await this.transport.requestInbound(sats);
//     return result;
//   }

//   /**
//    * Gets user's Lightning Node document from mongo
//    *
//    * @param tenantId
//    * @returns Promise<LightningNodeReference>
//    */
//   async getNodeDoc(tenantId:string): Promise<LightningNodeReference> {
//     const result = await this.transport.getNodeDoc(tenantId);
//     if (!result) return null
//     this.network.setNodeDoc(result.data);
//     runInAction(() => (this.nodeDoc = result.data))
//     return result.data;
//   }

//   async fetchData(currentTenantId: string) {
//     this.currentTenantId = currentTenantId;
//     await this.heyhowareya();
//   }

//   /**
//    * Retrieves user Lightning Node information.
//    *
//    * @returns the node information
//    */
//   async getInfo(): Promise<NodeInfo> {
//     const result = await this.transport.getInfo();
//     this.network.setNodeInfo(result.data);
//     runInAction(() => (this.nodeInfo = result.data));
//     return result.data;
//   }

//   /**
//    * Retrieves the total balance of the Lightning node over all channels.
//    *
//    * @returns Local and remote total balance on node
//    */
//   async getNodeBalance(tenantid:string): Promise<NodeBalance> {
//     const result = await this.transport.getNodeBalance(tenantid);
//     this.network.setNodeBalance(result.data);
//     runInAction(() => (this.nodeBalance = result.data));
//     return result.data;
//   }

//   /**
//    * Retrieves the on-chain Bitcoin on the node (UTXO's)
//    *
//    * @param start_height The height from which to list transactions, inclusive. If this value is greater than end_height, transactions will be read in reverse.
//    * @param end_height The height until which to list transactions, inclusive. To include unconfirmed transactions, this value should be set to -1
//    * @param account An optional filter to only include transactions relevant to an account. If empty, account = "default"
//    * @returns All on-chain Bitcoin UTXO's
//    */
//   async getBitcoinTransactions(start_height?, end_height?, account?): Promise<BitcoinTransaction[]> {
//     const result = await this.transport.getBitcoinTransactions(start_height, end_height, account);
//     this.network.setBitcoinTransactions(result.data);
//     runInAction(() => (this.bitcoinTransactions = result.data));
//     return result.data;
//   }

//   /**
//    * Retrieves the Lightning payments that the node is paying to.
//    *
//    * @param include_incomplete If true, then return payments that have not yet fully completed. This means that pending payments, as well as failed payments will show up if this field is set to true.
//    * @param index_offset The index of a payment that will be used as either the start or end of a query to determine which payments should be returned in the response.
//    * @param max_payments The maximal number of payments returned in the response to this query.
//    * @param reversed If set, the payments returned will result from seeking backwards from the specified index offset.
//    * @returns Payments that have been sent by the node.
//    */
//   async getOutgoingPayments(include_incomplete?, index_offset?, max_payemnts?, reverse?): Promise<OutgoingPayments> {
//     const result = await this.transport.getOutgoingPayments(include_incomplete, index_offset, max_payemnts, reverse);
//     this.network.setOutgoingPayments(result.data);
//     runInAction(() => (this.outgoingPayments = result.data));
//     return result.data;
//   };

//   /**
//    * Fetches all paid Invoices
//    *
//    * @param tenantId String
//    * @returns Promise<InvoiceReference[]>
//    */
//   async getPaidHistory(tenantId: string): Promise<InvoiceReference[]> {
//     const result = await this.transport.getPaidHistory(tenantId);
//     this.network.setPaidHistory(result.data);
//     runInAction(() => (this.paidHistory = result.data));
//     return result.data;
//   }

//   /**
//    * Shows the list of channels open or closed on the node.
//    * @param channels Filters for the return object. Active, inactive, public, and private.
//    * @param rest The rest object containing the macaroon and cert.
//    * @returns The channel list of the node.
//    */
//   async getChannelsList(active_only?: boolean, inactive_only?: boolean, public_only?: boolean, private_only?: boolean, peer?: string): Promise<any> {
//     const result = await this.transport.getChannelsList(active_only, inactive_only, public_only, private_only, peer);
//     this.network.setOutgoingPayments(result.data);
//     runInAction(() => (this.channels = result.data));
//     return result.data;
//   }

//   /**
//    * Returns the local channel reserve of the incoming channel for the user.
//    * @param tenantId The users tenant id
//    * @returns 
//    */
//   async getChannelReserve(tenantId:string): Promise<number> {
//     const channelList = await this.transport.getChannelsList(true)
//     const nodeDoc = await this.getNodeDoc(tenantId)
//     const incomingChannel = channelList.data.channels.find(channel => channel.channel_point === nodeDoc.incomingChannelId)
//     if (!incomingChannel) return null
//     return Number(incomingChannel.local_chan_reserve_sat)
//   }

//   /**
//    * Gets invoice data for tenant in chart-friendly format
//    *
//    * @param tenantId - String
//    * @param interval NetworkDataInterval - time interval (daily)
//    * @param start Number - timestamp
//    * @param end Number - timestamp
//    * @returns Promise<LightningChartData>
//    */
//   getChartData = async (tenantId: string, interval: NetworkDataInterval, start?: number, end?: number, timezone: string = DateTime.local().zoneName) => {
//     const result = await this.transport.getChartData(tenantId, interval, timezone, start, end);
//     runInAction(() => (this.chartData = result.data));
//     return result.data;
//   };

//   /**
//    * Creates an "Invoice" entry in Mongo DB for a specified FIAT amount...
//    * This would represent a "charge"/"invoice" in quickbooks.
//    *
//    * When an invoice is about to be paid (the payer navigates to the checkout page),
//    * a "quote" is generated that reflects the current price of bitcoin.
//    *
//    * @param invoice
//    * @param amount
//    * @param memo
//    * @param tenantId
//    * @returns The created invoice. Promise<InvoiceReference>
//    */
//   async createInvoice(amount: number, memo: string, tenantId: string, currency?: string): Promise<InvoiceReference> {
//     const result = await this.transport.createInvoice(amount, memo, tenantId, currency);
//     return result.data;
//   }

//   /**
//    * Fetches the current price of bitcoin and creates a BOLT11 paymentRequest for
//    * a given invoiceId.
//    *
//    * The expiration time should be low (default 300s) to reduce the receiver's exposure
//    * to bitcoin's volatility.
//    *
//    * @param invoiceId
//    * @param expirationsInSecs
//    * @param tenantId
//    * @returns Promise<ApiResult> QuoteReference
//    */
//   async generateQuote(invoiceId: string, expirationInSecs: number, tenantId: string): Promise<QuoteReference> {
//     const result = await this.transport.generateQuote(invoiceId, expirationInSecs, tenantId);
//     if (!result) return
//     return result.data;
//   }

//   /**
//    * Queries quotes corresponding to invoiceId, checks the status of each quote, and updates the statuses of quotes and invoices with new information.
//    *
//    * @param invoiceId String
//    * @param tenantId String
//    * @returns Promise<InvoiceReference>
//    */
//   async getInvoiceStatus(invoiceId: string, tenantId: string): Promise<InvoiceReference> {
//     const result = await this.transport.getInvoiceStatus(invoiceId, tenantId);
//     if (!result) return
//     return result.data;
//   }

//   /**
//    * Fetches current data for all invoices, payments, and balances
//    *
//    * @param tenantId String
//    * @param auth?: LndRestDto
//    * @returns Promise<InvoiceReference[]>
//    */
//   async refreshAllInvoices(tenantId: string): Promise<{ invoices: InvoiceReference[]; payments: PaymentReference[]; balances: BalanceReference[] }> {
//     const result = await this.transport.refreshAllInvoices(tenantId);
//     runInAction(() => (this.activity = result.data));

//     return result.data;
//   }

//   /**
//    * Generates a Bitcoin address for funding the node.
//    *
//    * @param type Address type. Default `WITNESS_PUBKEY_HASH`
//    * @param account The name of the account to generate a new address for. If empty, the default wallet account is used.
//    * @returns A new Bitcoin address to fund the node.
//    */
//   async getNewBitcoinAddress(type?: string, account?: string): Promise<NewAddress> {
//     const result = await this.transport.getNewBitcoinAddress(type, account);
//     return result.data;
//   }

//   /**
//    * Decodes a BOLT11 invoice for the payment information.
//    *
//    * @param pay_req The payment request to decode.
//    * @param tenantId
//    * @returns The payment information encoded in the payment request.
//    */
//   async getDecodeInvoice(pay_req: string, tenantId: string): Promise<DecodeInvoice> {
//     const result = await this.transport.getDecodeInvoice(pay_req, tenantId);
//     return result.data;
//   }

//   /**
//    * Returns the amount of Bitcoin given a fiat price.
//    *
//    * @param amount The amount in fiat.
//    * @param currency The fiat to use.
//    * @returns Converted amount of Bitcoin from fiat.
//    */
//   async convertBtcPrice(amount: number, currency: string) {
//     const result = await this.transport.convertBtcPrice(amount, currency);
//     return result.data;
//   }

//   async getBitcoinPrice(currency: string) {
//     const result = await this.transport.getBitcoinPrice(currency)
//     if (!result) return null
//     return result.data
//   }

//   /**
//    * Shows the list of peers connected to the node.
//    *
//    * @returns The list of peers.
//    */
//   async getPeers(): Promise<any> {
//     const result = await this.transport.getPeers();
//     return result.data;
//   }
// }
