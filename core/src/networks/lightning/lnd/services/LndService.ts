import { WalletBalanceResponse, AddInvoiceResponse, ChannelBalanceResponse, ChannelCloseSummary, ChannelOpenUpdate, ChannelCloseUpdate, GetInfoResponse, Invoice, ListChannelsResponse, ListInvoiceResponse, ListPaymentsResponse, ListPeersResponse, PayReq, PendingChannelsResponse, Transaction } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { forwardRef, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EnvironmentVariables, ENV_TOKEN } from "../../../../env";
import { BitcoinTransactionDto, IncomingPaymentDto, OutgoingPaymentDto, ChannelsDto, CancelInvoiceDto, GenerateBolt11Dto, TrackInvoiceDto, OpenChannelDto, CloseChannelDto, AddPeerDto, NewAddressDto } from "@blockspaces/shared/dtos/lightning";
import { LightningHttpService } from "./LightningHttpService";
import { LightningNodeReference, LndVersion } from "@blockspaces/shared/models/lightning/Node";
import { DEFAULT_LOGGER_TOKEN } from "../../../../logging/constants";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { CancelBolt11 } from "@blockspaces/shared/models/lightning/Invoice";
import { ChannelFees, FeeReport, RouteHopHints } from "@blockspaces/shared/models/lightning/Channels";
import { isErrorStatus } from "@blockspaces/shared/helpers/http";
import { returnErrorStatus } from "../../../../exceptions/utils";
import { CloseChannelParamsDto } from "@blockspaces/shared/dtos/lightning/close-channel";


@Injectable()
export class LndService {
  /**
   * Constructor for {@link LndService}
   * @param db {@link ConnectDbDataContext}
   * @param env {@link EnvironmentVariables}
   * @param http {@link LightningHttpService}
   */
  constructor(
    private readonly db: ConnectDbDataContext,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(forwardRef(() => LightningHttpService)) private readonly http: LightningHttpService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {
    logger.setModule(this.constructor.name);}

  /**
   * Returns the node lightning information.
   *
   * @param tenantId The tenantId of the user making the call.
   * @throws NotFoundException when there is no node data for the user's tenantId.
   * @returns ApiResult containing the GetInfo {@link GetInfoResponse}
   */
  getInfo = async (tenantId: string): Promise<GetInfoResponse.AsObject> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      let info;
      if (nodeData?.bscMacaroon) {
        info = await this.http.get(nodeData.apiEndpoint, "/v1/getinfo", nodeData.bscMacaroon, nodeData.cert, undefined);
      } else {
        info = await this.http.get(nodeData.apiEndpoint, "/v1/getinfo", undefined, nodeData.cert);
      }
      
      if (info.status === HttpStatus.SERVICE_UNAVAILABLE) {
        this.logger.error(`Customer data is unreachable. TenantId: ${tenantId}. Error: ${info.data}`);
        return null
      }

      return info.data;
    } catch (e) {
      // Catches if node is not unlocked
      if (e?.response?.data?.code === 2) return e.response.data;

      this.logger.error("Lnd getInfo failed.", e,{ data: { tenantId } });
      return null;
    }
  };

  /**
   *
   * @param transactions The index for transactions and account on the node. Defaults to "default" {@link BitcoinTransactionDto}
   * @param tenantId The tenantId of the user making the call.
   * @throws NotFoundException when there is no node data for the user's tenantId.
   * @returns The total balance in the bitcoin wallet. Confirmed and unconfirmed. {@link TransactionDetails}
   */
  getBitcoinTransactions = async (transactions: BitcoinTransactionDto, tenantId: string): Promise<Transaction.AsObject[]> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const params = {
        account: transactions.account || "default",
        start_height: transactions.start_height || 0,
        end_height: transactions.end_height || 0
      };
      const tx = await this.http.get(nodeData.apiEndpoint, "/v1/transactions", nodeData.bscMacaroon, nodeData.cert, params);
      return tx?.data?.transactions;
    } catch (e) {
      this.logger.error("getBitcoinTransaction Failed.",e, { data: { tenantId, transactions, status: e.status } });
      return null;
    }
  };

  /**
   * Gets the total amount of bitcoin in the node's onchain wallet.
   *
   * @param tenantId The tenantId of the user making the call.
   * @throws NotFoundException when there is no node data for the user's tenantId.
   * @returns The total amount of bitcoin in the node's onchain wallet. {@link WalletBalanceResponse}
   */
  getOnchainBalance = async (tenantId: string): Promise<WalletBalanceResponse.AsObject> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const balance = await this.http.get(nodeData.apiEndpoint, "/v1/balance/blockchain", nodeData.bscMacaroon, nodeData.cert);
      return balance.data;
    } catch (e) {
      this.logger.error("getOnchainBalance Failed.", e, { data: { tenantId, status: e.status } });
      return null;
    }
  };

  /**
   * Gets the total liquidity in channels open to the node.
   *
   * @param tenantId The tenantId of the user making the call.
   * @throws NotFoundException when there is no node data for the user's tenantId.
   * @returns The total balance in channels locally, remote, and pending channels. {@link ChannelBalanceResponse}
   */
  getNodeBalance = async (tenantId: string): Promise<ChannelBalanceResponse.AsObject> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const balance = await this.http.get(nodeData.apiEndpoint, "/v1/balance/channels", nodeData.bscMacaroon, nodeData.cert);
      if (isErrorStatus(balance.status)) {
        return null
      }
      return balance.data;
    } catch (e) {
      this.logger.error("getNodeBalance Failed.", e,{ data: { tenantId, status: e.status } });
      return null;
    }
  };

  /**
   * Generates a fresh bitcoin address for a tenant's lightning node.
   *
   * @param tenantId The tenantId of the user making the call.
   * @throws NotFoundException when there is no node data for the user's tenantId.
   * @returns 
   */
  getOnchainAddress = async (tenantId: string, _body?: NewAddressDto): Promise<any> => {
    const body = {
      account: _body?.account ?? "default",
      type: _body?.type ?? 4,
      change: false
    };
    try {
      const nodeData = await this.getNodeData(tenantId);
      const address = await this.http.post(nodeData.apiEndpoint, "/v2/wallet/address/next", nodeData.bscMacaroon, nodeData.cert, body);
      return address.data.addr;
    } catch (e) {
      this.logger.error("getOnchainAddress Failed.", e,{ data: { tenantId, status: e.status } });
      return null;
    }
  };

  /**
   * Shows the invoices created by the node. Each invoice has a status for paid, pending, or expired.
   *
   * @param payments The index and number of invoices to return. Allows reversed list. Can show only pending. {@link IncomingPaymentDto}
   * @param tenantId The tenantId of the user making the call.
   * @throws NotFoundException when there is no node data for the user's tenantId.
   * @returns The invoices created by the node. {@link ListInvoiceResponse}
   */
  getIncomingPayments = async (payments: IncomingPaymentDto, tenantId: string): Promise<ListInvoiceResponse.AsObject> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const params = {
        index_offset: payments.index_offset || 0,
        num_max_invoices: payments.num_max_invoices || 0,
        pending_only: payments.pending_only || false,
        reversed: payments.reversed || false
      };
      const incoming = await this.http.get(nodeData.apiEndpoint, "/v1/invoices", nodeData.bscMacaroon, nodeData.cert, params);
      return incoming.data;
    } catch (e) {
      this.logger.error("getIncomingPayments Failed.", e,{ data: { tenantId, payments, status: e.status } });
      return null;
    }
  };

  /**
   * Shows the invoices paid by the node.
   *
   * @param payments The index and number of payments to return. {@link OutgoingPaymentDto}
   * @param tenantId The tenantId of the user making the call.
   * @throws NotFoundException when there is no node data for the user's tenantId.
   * @returns The invoices paid by the node. {@link ListPaymentsResponse}
   */
  getOutgoingPayments = async (payments: OutgoingPaymentDto, tenantId: string): Promise<ListPaymentsResponse.AsObject[]> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const params = {
        include_incomplete: payments.include_incomplete || false,
        index_offset: payments.index_offset || 0,
        max_payments: payments.max_payments || 0,
        reversed: payments.reversed || false
      };
      const outgoing = await this.http.get(nodeData.apiEndpoint, "/v1/payments", nodeData.bscMacaroon, nodeData.cert, params);
      const res: ListPaymentsResponse.AsObject[] = outgoing.data.payments;
      return res;
    } catch (e) {
      this.logger.error("getOutgoingPayments Failed.", e,{ data: { tenantId, payments, status: e.status } });
      return null;
    }
  };

  /**
   * Shows the list of channels open or closed on the node.
   *
   * @param channels Filters for the return object. {@link ChannelsDto}
   * @param tenantId The tenantId of the user making the call.
   * @throws NotFoundException when there is no node data for the user's tenantId.
   * @returns The channel list of the node. {@link ListChannelsResponse}
   */
  getChannelsList = async (tenantId: string, channels?: ChannelsDto): Promise<ListChannelsResponse.AsObject> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const params = {
        active_only: channels?.active_only || true,
        inactive_only: channels?.inactive_only || false,
        public_only: channels?.public_only || false,
        private_only: channels?.private_only || false
      };

      const channelList = await this.http.get(nodeData.apiEndpoint, "/v1/channels", nodeData.bscMacaroon, nodeData.cert, params);
      return channelList.data;
    } catch (e) {
      this.logger.error("getChannelList Failed.",null, { data: { tenantId, channels, status: e.status } });
      return null;
    }
  };

  /**
   * Retrieves the fee report for all channels on the node.
   *
   * @param tenantId The node we are selecting.
   * @returns An array of fee reports for all channels.
   */
  getFeeReport = async (tenantId: string): Promise<FeeReport> => {
    const nodeData = await this.getNodeData(tenantId);
    const feeReport = await this.http.get(nodeData.apiEndpoint, "/v1/fees", nodeData.bscMacaroon, nodeData.cert);
    if (isErrorStatus(feeReport.status)) {
      return null;
    }
    return feeReport.data;
  };

  /**
   * Adds a gossip peer. Returns null if failed.
   *
   * @param apiEndpoint rest endpoint of the initiating node
   * @param macaroon macaroon of initiating node
   * @param body {@link AddPeerDto}
   * @returns Promise {@link ChannelOpenUpdate.AsObject} 
   */
  addPeer = async (apiEndpoint: string, macaroon: string, body: AddPeerDto): Promise<ChannelOpenUpdate.AsObject> => {
    const response = await this.http.post(apiEndpoint, "/v1/peers", macaroon, "", body);
    if (response?.data?.message?.startsWith("already connected")) return response.data;
    if (isErrorStatus(response.status)) {
      this.logger.warn('Add peers failed',null, { data: { apiEndpoint, body: body.addr }, error: response?.data});
      return null;
    }
    return response.data;
  };

  /**
   * Shows the list of peers connected to the node.
   *
   * @param tenantId The tenantId of the user making the call.
   * @throws NotFoundException when there is no node data for the user's tenantId.
   * @returns The list of peers.{@link ListPeersResponse}
   */
  listPeers = async (tenantId: string): Promise<ListPeersResponse.AsObject> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const peers = await this.http.get(nodeData.apiEndpoint, "/v1/peers", nodeData.cert, nodeData.bscMacaroon);
      return peers.data;
    } catch (e) {
      this.logger.warn("listPeers Failed.", e, { data: { tenantId, status: e.status } });
      return null;
    }
  };

  /**
   * Opens a channel to another lightning node.
   *
   * @param tenantId The tenant id of the user requesting node information.
   * @returns The list of utxos. {@link ChannelOpenUpdate.AsObject}
   */
  openChannel = async (apiEndpoint: string, macaroon: string, body: OpenChannelDto): Promise<ChannelOpenUpdate.AsObject> => {
    try {
      const response = await this.http.post(apiEndpoint, "/v1/channels", macaroon, "", body);
      if (response.data?.code === 2) {
        this.logger.warn('openChannel failed', null, {data: { response: response.data, apiEndpoint }});
        return response.data;
      }
      if (isErrorStatus(response.status)) {
        this.logger.error('openChannel failed', null,{data: { response: response.data, apiEndpoint }});
        return null;
      }
      return response.data;
    } catch (e) {
      // this.logger.error("openChannel Failed.", { data: { apiEndpoint, status: e.status } }, { error: e }, { stacktrace: e.stacktrace });
      return null;
    }
  };
  /**
   * Closes a channel to another lightning node.
   *
   * @param tenantId The tenant id of the user requesting node information.
   * @returns The list of utxos.
   */
  closeChannel = async (tenantId: string, params: CloseChannelParamsDto, queries: CloseChannelDto): Promise<ChannelCloseUpdate.AsObject> => {
    try {
      const nodeData = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: {$exists: false} });
      const response = await this.http.delete(nodeData.apiEndpoint, `/v1/channels/${params.fundingTxnStr}/${params.channelPoint}`, params.macaroon, "", queries);
      return response.data;
    } catch (e) {
      this.logger.error("closedChannel Failed.", e,{ data: { tenantId, params, queries, status: e.status } });
      return null;
    }
  };

  /**
   * Retrieves closed channels list from lnd node.
   *
   * @param tenantId The tenant id of the user requesting node information.
   * @returns The list of utxos. {@link ChannelCloseSummary}
   */
  getClosedChannels = async (tenantId: string): Promise<ChannelCloseSummary.AsObject[]> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const channels = await this.http.get(nodeData.apiEndpoint, "/v1/channels/closed", nodeData.bscMacaroon, nodeData.cert);
      return channels.data.channels;
    } catch (e) {
      this.logger.error("getClosedChannels Failed.", e, { data: { tenantId, status: e.status } });
      return null;
    }
  };

  /**
   * Shows the list of channels pending channels.
   *
   * @param channels Filters for the return object. Active, inactive, public, and private.
   * @param tenantId The tenantId of the user making the call.
   * @throws NotFoundException when there is no node data for the user's tenantId.
   * @returns The channel list of the node.
   */
  getPendingChannelsList = async (tenantId: string, channels?: ChannelsDto): Promise<PendingChannelsResponse.AsObject> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const channelList = await this.http.get(nodeData.apiEndpoint, "/v1/channels/pending", nodeData.bscMacaroon, nodeData.cert);
      return channelList.data;
    } catch (e) {
      this.logger.error("getPendingChannelsList Failed.",e, { data: { tenantId, status: e.status } });
      return null;
    }
  };

  /**
   * Retrieves utxos involving a tenant's lightning node.
   *
   * @param tenantId The tenant id of the user requesting node information.
   * @returns The list of utxos. {@link Transaction}
   */
  getUtxos = async (tenantId: string): Promise<Transaction.AsObject[]> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const utxos = await this.http.get(nodeData.apiEndpoint, "/v1/transactions", nodeData.bscMacaroon, nodeData.cert);
      return utxos.data.transactions;
    } catch (e) {
      this.logger.error("getUtxos Failed.",e, { data: { tenantId, status: e.status } });
      return null;
    }
  };

  /**
   * Retrieves pending/unconfirmed transactions involving a tenant's lightning node.
   *
   * @param tenantId The tenant id of the user requesting node information.
   * @returns The list of pending utxos. {@link Transaction}
   */
  getPendingTransactions = async (tenantId: string) => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const body = {
        min_confs: 0,
        max_confs: 1
      };
      const utxos = await this.http.post(nodeData.apiEndpoint, "/v2/wallet/utxos", nodeData.bscMacaroon, nodeData.cert, body);
      return utxos.data.utxos;
    } catch (e) {
      this.logger.error("getPendingTransactions Failed.", e, { data: { tenantId, status: e.status } });
      return null;
    }
  };

  /**
   * Retrieves channel open/close utxos involving a tenant's lightning node.
   *
   * @param tenantId The tenant id of the user requesting node information.
   * @returns The list of utxos (channel opens/closes). {@link Transaction}
   */
  getChannelEventUtxos = async (tenantId: string): Promise<Transaction.AsObject[]> => {
    try {
      const utxos: Transaction.AsObject[] = await this.getUtxos(tenantId);
      if (!utxos) throw new NotFoundException("getUtxos Failed.");
      const channelEvents: Transaction.AsObject[] = await utxos.filter((txn) => txn.label.startsWith("0:"));
      return channelEvents;
    } catch (e) {
      this.logger.error("getChannelEventUtxos Failed.", e,{ data: { tenantId, status: e.status } });
      return null;
    }
  };

  /**
   * Cancels an invoice. Does not remove the invoice from the invoice.db. Just sets the invoice state to cancelled.
   *
   * @param request { payment_hash: string } The invoice payment hash that we want to track.
   * @returns If success returns empty object `{}` returns {error: true} if there is an error.
   */
  cancelBolt11 = async (request: CancelInvoiceDto, tenantId: string): Promise<CancelBolt11> => {
    try {
      const nodeData = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: {$exists:false} });
      const body = {
        payment_hash: Buffer.from(request.payment_hash, "hex").toString("base64")
      };
      const invoice = await this.http.post(nodeData.apiEndpoint, "/v2/invoices/cancel", nodeData.bscMacaroon, nodeData.cert, body);
      if (isErrorStatus(invoice.status)) {
        this.logger.warn("Cancel Bolt 11 Failed.", null, { data: { request, tenantId } });
        return null;
      }
      return { cancelled: true };
    } catch (e) {
      this.logger.warn("Cancel Bolt 11 Failed.", null,{ data: { request, tenantId } });
      return null;
    }
  };

  /**
   * Creates bolt11 invoice
   * @param invoice {@link GenerateBolt11Dto}
   * @returns bolt 11 invoice Promise {@link AddInvoiceResponse.AsObject}
   */
  generateBolt11 = async (invoice: GenerateBolt11Dto): Promise<AddInvoiceResponse.AsObject> => {
    const nodeData = await this.getNodeData(invoice.tenantId);
    // TODO: We need to have incoming channel id in mongo collection. Ref: https://bitbucket.org/blockspacesio/blockspacesconnect/pull-requests/492
    // In this impl we are assuming one channel, hot fix for now. CHANGE ME!
    // Get channel information so we can get remote_pubkey, chan_id, and CLTV.
    const channelInformation = await this.getChannelsList(invoice.tenantId, {active_only: true, public_only: false, private_only: false, inactive_only: false, peer: null});
    // If we have no channels, do not create invoice. holy shit we need to fix our types.
    if (channelInformation["channels"]?.length === 0) return returnErrorStatus(HttpStatus.BAD_REQUEST, "No channels to create invoice.");
    // Select the first channel
    const selectedChannel = channelInformation["channels"][0];
    // Grab the fee report from the selected channel.
    const feeReport = await this.getFeeReport(invoice.tenantId);
    // Throw an error if we cannot get the fee report.
    if (!feeReport) return returnErrorStatus(HttpStatus.NOT_FOUND, "Could not get fee report for incoming channel.");
    // Match the fee report array to our selected channel.
    const selectedChannelFees: ChannelFees = feeReport.channel_fees.find((channel) => channel["chan_id"] === selectedChannel["chan_id"]);
    // Build the hop hints object.
    const routeHints: RouteHopHints = [
      {
        hop_hints: [
          {
            node_id: selectedChannel["remote_pubkey"],
            chan_id: selectedChannel["chan_id"],
            fee_base_msat: Number(selectedChannelFees["base_fee_msat"]),
            fee_proportional_millionths: Number(selectedChannelFees["fee_per_mil"]),
            cltv_expiry_delta: selectedChannel["csv_delay"]
          }
        ]
      }
    ];
    // END OF ROUTE HINTS. CHANGE ME! not flexible
    const body = {
      memo: invoice.memo,
      value: invoice.amount,
      route_hints: routeHints,
      expiry: invoice.expiry
    };

    const payreq = await this.http.post(nodeData.apiEndpoint, "/v1/invoices", nodeData.bscMacaroon, nodeData.cert, body);
    if (isErrorStatus(payreq.status)) {
      returnErrorStatus(payreq.status, payreq.data);
    }

    // lnrpc.AsObject types return camel case and rest interface returns snake case :/
    const responseData = {
      addIndex: payreq.data.add_index,
      rHash: payreq.data.r_hash,
      paymentRequest: payreq.data.payment_request,
      paymentAddr: payreq.data.payment_addr
    };

    return responseData;
  };

  /**
   * Decodes a payment string to extract encoded invoice information.
   *
   * @param invoice BOLT 11 invoice to decode.
   * @returns Deconstructed BOLT 11 invoice. {@link PayReq.AsObject}
   */
  readInvoice = async (payReq: string, tenantId: string): Promise<PayReq.AsObject> => {
    const nodeData = await this.getNodeData(tenantId);
    if (!nodeData) {
      this.logger.warn("Read Bolt 11 Failed. Node data not found", null, { data: { payReq, tenantId } });
      return null;
    }
    try {
      const nodeData = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: {$exists: false} });
      const invoice = await this.http.get(nodeData.apiEndpoint, `/v1/payreq/${payReq}`, nodeData.bscMacaroon, nodeData.cert);

      // lnrpc.AsObject types return camel case and rest interface returns snake case :/
      const responseData = {
        destination: invoice.data.destination,
        paymentHash: invoice.data.payment_hash,
        numSatoshis: invoice.data.num_satoshis,
        timestamp: invoice.data.timestamp,
        expiry: invoice.data.expiry,
        description: invoice.data.description,
        descriptionHash: invoice.data.description_hash,
        fallbackAddr: invoice.data.fallback_addr,
        cltvExpiry: invoice.data.cltv_expiry,
        routeHintsList: invoice.data.route_hints,
        paymentAddr: invoice.data.payment_addr,
        numMsat: invoice.data.num_msat,
        featuresMap: invoice.data.features
      };
      return responseData;
    } catch (e) {
      this.logger.warn("Lnd readInvoice failed.", e, `data: { payReq: ${payReq}, tenantId: ${tenantId} }`);
      return null;
    }
  };

  /**
   * Returns the state of an invoice given the payment hash.
   *
   * @param tenantId tenantId of the user.
   * @param request {@link TrackInvoiceDto} The payment hash to query for.
   * @returns Promise {@link Invoice.AsObject}
   */
  trackBolt11 = async (request: TrackInvoiceDto, tenantId: string): Promise<Invoice.AsObject> => {
    try {
      const nodeData = await this.getNodeData(tenantId);
      const invoice = await this.http.get(nodeData.apiEndpoint, `/v1/invoice/${request.payment_hash}`, nodeData.bscMacaroon, nodeData.cert);
      if (isErrorStatus(invoice.status)) {
        this.logger.warn("Track Bolt 11 Failed.", null, `data: { ${request}, ${tenantId} }` );
        return null;
      }
      // hotfix
      invoice.data.settleDate = invoice.data.settle_date;
      return invoice.data;
    } catch (e) {
      this.logger.warn("Lnd track invoice failed.", e, `data: { request: ${request}, tenantId: ${tenantId} }`);
      return null;
    }
  };

  /**
   * Retrieves the version of LND running on the node.
   * 
   * @param tenantId 
   * @returns 
   */
  lndVersion = async (tenantId:string): Promise<LndVersion> => {
    const nodeData = await this.getNodeData(tenantId)
    try {
      const version = await this.http.get(nodeData.apiEndpoint, "/v2/versioner/version", nodeData.bscMacaroon, nodeData.cert)
      if (isErrorStatus(version.status))
        throw new NotFoundException(`Could not get node version for ${tenantId}`)
      return version.data
    } catch (e) {
      throw new Error(`Could not get LND version ${tenantId}. Error: ${e}`)
    }
  }


  /**
   * Checks the macaroon permissions for a given tenantId's lightning node and macaroon 
   * @param tenantId 
   * @param macaroon 
   * @returns 
   */
  checkMacaroonPermissions = async (macaroon: string, endpoint?: string, certificate?: string): Promise<{valid: boolean}> => {

    const readonlyPermissions = [
      {entity: "onchain", action: "read"},
      {entity: "invoices", action: "read"},
      {entity: "offchain", action: "read"},
      {entity: "info", action: "read"},
      {entity: "macaroon", action: "read"},
    ];
    const body = {
      macaroon: Buffer.from(macaroon, "hex").toString("base64"), // base64 encoded macaroon
      permissions: readonlyPermissions
      // fullMethod?
    };
    
    try {
      const info = await this.http.post(endpoint, "/v1/macaroon/checkpermissions", macaroon, certificate ?? null, body);
      if (isErrorStatus(info.status)) {
        returnErrorStatus(info.status, {valid: false});
      }
      return info.data;
    } catch (e) {
      this.logger.warn("Lnd check macaroon permissions failed.", e);
      return {valid: false};
    }
  };

  /**
   * Retrieves the node data (api endpoint, bsc macaroon, etc.) for a given tenant id.
   *
   * @param tenantId The tenant id of the user requesting node information.
   * @throws NotFoundException when there is no node information.
   * @returns The MongoDB document of the user's node. {@link LightningNodeReference}
   */
  private getNodeData = async (tenantId: string): Promise<LightningNodeReference> => {
    const nodeData = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: {$exists: false} });
    if (!nodeData) {
      this.logger.warn(`No node data was found for user: tenantId: ${tenantId}.`);
      throw new NotFoundException("No node data for this user.");
    }
    return nodeData;
  };
}
