export interface NodeInfo {
  version: string
  commit_hash: string
  identity_pubkey: string
  alias: string
  color: string
  num_pending_channels: number
  num_active_channels: number
  num_inactive_channels: number
  num_peers: number
  block_height: number
  block_hash: string
  best_header_timestamp: number
  synced_to_chain: boolean
  synced_to_graph: boolean
  testnet: boolean
  chains: Object
  uris: Array<string>
  features: Object
}

export interface SummaryData {

}

export interface NodeBalance {
  balance: number,
  pending_open_balance: number,
  local_balance: SatsAndMsat,
  remote_balance: SatsAndMsat,
  unsettled_local_balance: SatsAndMsat,
  unsettled_remote_balance: SatsAndMsat,
  pending_open_local_balance: SatsAndMsat,
  pending_open_remote_balance: SatsAndMsat
}

interface SatsAndMsat {
  sat: number,
  msat: number
}

export interface OutgoingPayments {
  payments: Array<LightningPayment>,
  first_index_offset: number,
  last_index_offset: number
}

export interface IncomingPayments {
  invoices: Array<LightningInvoice>,
  first_index_offset: number,
  last_index_last: number
}

export interface CreateInvoice {
  r_hash: Object,
  payment_request: string,
  add_index: number,
  payment_addr: Object
}


export interface BitcoinTransaction {
  tx_hash: string;
  amount: number;
  num_confirmations: number;
  block_hash: string;
  block_height: number;
  time_stamp: Date;
  total_fees: number;
  dest_addresses: Array<string>;
  raw_tx_hex: string;
  label: string;
}

export interface Channel {
  active: boolean,
  remote_pubkey: string,
  channel_point: string,
  chan_id: string,
  capacity: number,
  local_balance: number,
  remote_balance: number,
  commit_fee: number,
  commit_weight: number,
  fee_per_kw: number,
  unsettled_balance: number,
  total_satoshis_sent: number,
  num_updates: number,
  pending_htlcs: Array<Object>
  csv_delay: number,
  private: boolean,
  initiator: boolean,
  chan_status_flags: string,
  local_chan_reserve_sat: number,
  remote_chan_reserve_sat: number,
  static_remote_key: boolean,
  commitment_type: number,
  lifetime: number,
  uptime: number,
  close_address: string,
  push_amount_sat: number,
  thaw_height: number,
  local_constraints: Object,
  remote_constraints: Object
}

export interface DecodeInvoice {
  destination: string,
  payment_hash: string,
  num_satoshis: number,
  timestamp: number,
  expiry: number,
  description: string,
  description_hash: string,
  fallback_addr: string,
  cltv_expiry: number,
  route_hints: Array<Object>,
  payment_addr: Object,
  num_msats: number,
  features: Array<Object>
}

export interface NewAddress {
  address: string
  route_hints: Array<Object>,
  payment_addr: Object,
  num_msats: number,
  features: Array<Object>
}

export interface LightningPayment {
  payment_hash: string,
  value: number,
  creation_date: number,
  fee: number,
  payment_preimage: string,
  value_sat: number,
  value_msat: number,
  payment_request: string,
  status: string,
  fee_sat: number,
  fee_msat: number,
  creation_time_ns: number,
  htlcs: Array<Object>,
  payment_index: number
}

export interface LightningInvoice {
  memo: string,
  r_preimage: Object,
  r_hash: Object,
  value: number,
  value_msat: number,
  settled: boolean,
  creation_date: number,
  settle_date: number,
  payment_request: string,
  description_hash: Object,
  expiry: number,
  fallback_addr: string,
  cltv_expiry: number,
  route_hints: Array<Object>,
  private: boolean,
  add_index: number,
  settle_index: number,
  amt_paid: number,
  amt_paid_sat: number,
  amt_paid_msat: number,
  state: string,
  htlcs: Array<Object>,
  features: Array<Object>,
  is_keysend: boolean,
  payment_addr: Object,
  is_amp: boolean,
  amp_invoice_state: Array<Object>
}

export interface PayInvoice {
  status: string,
  message: string
}