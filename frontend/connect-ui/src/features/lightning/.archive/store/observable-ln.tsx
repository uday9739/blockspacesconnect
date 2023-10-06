// import { makeAutoObservable } from "mobx";
// import { BitcoinTransaction, Channel, NodeBalance, NodeInfo, OutgoingPayments } from '@blockspaces/shared/models/spaces/Lightning';
// import { LightningChartData } from "@blockspaces/shared/dtos/lightning";
// import { Network } from '@blockspaces/shared/models/networks/Network';
// import { InvoiceReference } from '@blockspaces/shared/models/lightning/Invoice';
// import { LightningNode, LightningNodeReference, LightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";

// export enum LightningStatus {
//   PENDING_CREDENTIALS = "Add Credentials (1 of 4)",
//   SYNCING = "Syncing Node (2 of 4)",
//   FUNDING_WALLET = "Funding Wallet (3 of 4)",
//   CREATING_CHANNEL = "Creating Channel (4 of 4)",
//   OFFLINE = "OFFLINE",
//   UNREACHABLE = "UNREACHABLE",
//   ONLINE = "ONLINE"
// }

// // TODO refactor to utilize some type of generic "User Network" data structure
// export class ObservableLightningNetwork implements Network {
//   _id: string;
//   name: string;
//   description: string;
//   nodeHealth: LightningOnboardingStep
//   logo?: string;
//   nodeInfo: NodeInfo;
//   nodeDoc: LightningNodeReference;
//   nodeBalance: NodeBalance;
//   channels: Channel[];
//   bitcoinTransactions: BitcoinTransaction[];
//   outgoingPayments: OutgoingPayments;
//   paidHistory: InvoiceReference[];
//   chartData: LightningChartData;
//   status: LightningStatus;

//   constructor(network?: Partial<Network>) {
//     Object.assign(this, network);

//     this.nodeHealth = null
//     this.nodeInfo = defaultInfo;
//     this.nodeBalance = defaultNodeBalance;
//     this.nodeDoc = null;
//     this.bitcoinTransactions = [];
//     this.outgoingPayments = defaultOutgoingPayments;
//     this.paidHistory = [];
//     this.channels = [];
//     this.status = LightningStatus.PENDING_CREDENTIALS;

//     makeAutoObservable(this);
//   }

//   setNodeHealth(health: LightningOnboardingStep) {
//     this.nodeHealth = health;
//   }
  
//   setNodeInfo(info: NodeInfo) {
//     this.nodeInfo = info;
//   }

//   setNodeDoc(doc: LightningNodeReference) {
//     this.nodeDoc = doc;
//   }

//   setNodeBalance(balance: NodeBalance) {
//     this.nodeBalance = balance;
//   }

//   setBitcoinTransactions(transactions: BitcoinTransaction[]) {
//     this.bitcoinTransactions = transactions;
//   }

//   setOutgoingPayments(payments: OutgoingPayments) {
//     this.outgoingPayments = payments;
//   }

//   setPaidHistory(invoices: InvoiceReference[]) {
//     this.paidHistory = invoices;
//   }

//   setStatus(status: LightningStatus) {
//     this.status = status;
//   }

//   setChannels(channels: Channel[]) {
//     this.channels = channels;
//   }

//   setchartData(data: LightningChartData) {
//     this.chartData = data;
//   }
// }

// const defaultInfo = {
//   version: "",
//   commit_hash: "",
//   identity_pubkey: "",
//   alias: "",
//   color: "",
//   num_pending_channels: 0,
//   num_active_channels: 0,
//   num_inactive_channels: 0,
//   num_peers: 0,
//   block_height: 0,
//   block_hash: "",
//   best_header_timestamp: 0,
//   synced_to_chain: false,
//   synced_to_graph: false,
//   testnet: false,
//   chains: {},
//   uris: [],
//   features: {}
// };

// const defaultNodeBalance = {
//   balance: 0,
//   pending_open_balance: 0,
//   local_balance:  {sat: 0, msat: 0},
//   remote_balance: {sat: 0, msat: 0},
//   unsettled_local_balance: {sat: 0, msat: 0},
//   unsettled_remote_balance: {sat: 0, msat: 0},
//   pending_open_local_balance: {sat: 0, msat: 0},
//   pending_open_remote_balance: {sat: 0, msat: 0}
// };

// const defaultOutgoingPayments = {
//   payments: [],
//   first_index_offset: 0,
//   last_index_offset: 0
// };
