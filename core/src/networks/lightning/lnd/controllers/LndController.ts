import {Controller, Get, Post, Query, Body, HttpStatus, Inject} from "@nestjs/common";
import { BitcoinTransactionDto, ChannelsDto, CloseChannelDto, GenerateBolt11Dto, IncomingPaymentDto, NewAddressDto, OutgoingPaymentDto, CheckPermissionsDto } from "@blockspaces/shared/dtos/lightning";
import { LndService } from "../services/LndService";
import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { returnErrorStatus } from "../../../../exceptions/utils";
import {
  ChannelBalanceResponse,
  ChannelCloseSummary,
  GetInfoResponse,
  ListChannelsResponse,
  ListInvoiceResponse,
  ListPeersResponse,
  Transaction,
  AddInvoiceResponse,
  PayReq,
  ListPaymentsResponse,
  PendingChannelsResponse,
  ChannelCloseUpdate
} from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { User } from "../../../../users";
import { IUser } from "@blockspaces/shared/models/users";
import { AllowAnonymous } from "../../../../auth";
import { ValidRoute } from "../../../../validation";
import { CloseChannelParamsDto } from "@blockspaces/shared/dtos/lightning/close-channel";
import { LndVersion } from "@blockspaces/shared/models/lightning/Node";


@ValidRoute()
@Controller("/networks/lightning/lnd")
export class LndController {
  constructor(private readonly lightning: LndService
  ) {}

  /**
   * Gets info about a user's lightning node
   * @param user Authenticated {@link User}
   * @returns Promise {@link GetInfoResponse}
   */
  @Get("/info")
  async getNodeInfo(@User() user: IUser): AsyncApiResult<GetInfoResponse.AsObject> {
    const info = await this.lightning.getInfo(user.activeTenant?.tenantId);
    if (!info) {
      return returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`${info}`));
    }
    return ApiResult.success(info, "Node info.");
  }

  /**
   * Gets a list of on-chain bitcoin transactions from a user's lightning node
   * @param user Authenticated {@link User}
   * @param query {@link BitcoinTransactionDto}
   * @returns Promise {@link TransactionDetails}
   */
  @Get("/bitcoin-transactions")
  async readBitcoinTransactions(@User() user: IUser, @Query() query: BitcoinTransactionDto): AsyncApiResult<Transaction.AsObject[]> {
    const transactions = await this.lightning.getBitcoinTransactions(query, user.activeTenant?.tenantId);
    if (!transactions) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get bitcoin transactions: ${query}`));
    }
    return ApiResult.success(transactions);
  }

  /**
   * Gets balance of a lightning node associated with a tenantId.
   * Accessible by a non-authenticated user.
   * @param tenantid tenantId for customer
   * @returns Promise {@link ChannelBalanceResponse}
   */
  @AllowAnonymous()
  @Get("/node-balance")
  // TODO: fix casing on tenantId
  async readNodeBalance(@Query("tenantid") tenantId: string): AsyncApiResult<ChannelBalanceResponse.AsObject> {
    const balance = await this.lightning.getNodeBalance(tenantId);
    if (!balance) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get Node Balance: ${tenantId}`));
    }
    return ApiResult.success(balance);
  }

  /**
   * Gets list of incoming payments from a user's lightning node
   * @param user Authenticated {@link User}
   * @param query {@link IncomingPaymentDto}
   * @returns Promise {@link ListInvoiceResponse}
   */
  @Get("/incoming-payments")
  async getIncomingPayments(@User() user: IUser, @Query() query: IncomingPaymentDto): AsyncApiResult<ListInvoiceResponse.AsObject> {
    const payments = await this.lightning.getIncomingPayments(query, user.activeTenant?.tenantId);
    if (!payments) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get incoming payments: ${query}`));
    }
    return ApiResult.success(payments);
  }

  /**
   * Gets list of outgoing payments from a user's lightning node
   * @param user Authenticated {@link User}
   * @param query {@link OutgoingPaymentDto}
   * @returns Promise {@link ListPaymentsResponse}
   */
  @Get("/outgoing-payments")
  async getOutgoingPayments(@User() user: IUser, @Query() query: OutgoingPaymentDto): AsyncApiResult<ListPaymentsResponse.AsObject[]> {
    const payments = await this.lightning.getOutgoingPayments(query, user.activeTenant?.tenantId);
    if (!payments) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get outgoing payments: ${query}`));
    }
    return ApiResult.success(payments);
  }

  /**
   * Gets list of closed channels associated with a user's lightning node
   * @param user Authenticated {@link User}
   * @returns Promise {@link ChannelCloseSummary}
   */
  @Get("/channels/closed")
  async getClosedChannelsList(@User() user: IUser): AsyncApiResult<ChannelCloseSummary.AsObject[]> {
    const channels = await this.lightning.getClosedChannels(user.activeTenant?.tenantId);
    if (!channels) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get closed channels: ${user.activeTenant?.tenantId}`));
    }
    return ApiResult.success(channels);
  }

  /**
   * Gets list of open channels associated with a user's lightning node
   * @param user Authenticated {@link User}
   * @param query {@link ChannelsDto}
   * @returns Promise {@link ListChannelsResponse}
   */
  @Get("/channels")
  async getChannelsList(@User() user: IUser, @Query() query: ChannelsDto): AsyncApiResult<ListChannelsResponse.AsObject> {
    const channels = await this.lightning.getChannelsList(user.activeTenant?.tenantId, query);
    if (!channels) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get channels list: ${query}`));
    }
    return ApiResult.success(channels);
  }

  @Get("/channels/pending")
  async getPendingChannelsList(@User() user: IUser): Promise<ApiResult<PendingChannelsResponse.AsObject>> {
    const channels = await this.lightning.getPendingChannelsList(user.activeTenant?.tenantId);
    if (!channels) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get pending channels list`));
    }
    return ApiResult.success(channels);
  }

  @Post("/address")
  async getOnchainAddress(@User() user: IUser, @Body() body: NewAddressDto): Promise<ApiResult<ChannelCloseUpdate.AsObject>> {
    const address = await this.lightning.getOnchainAddress(user.activeTenant?.tenantId, body);
    if (!address) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get Address: ${body}`));
    }
    return ApiResult.success(address);
  }

  @Post("/channels/delete")
  async closeChannel(@User() user: IUser, @Query() queries: CloseChannelDto, @Body() body: CloseChannelParamsDto): Promise<ApiResult<ChannelCloseUpdate.AsObject>> {
    const channel = await this.lightning.closeChannel(user.activeTenant?.tenantId, body, queries);
    if (!channel) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to delete channel: ${queries}, ${body}`));
    }
    return ApiResult.success(channel);
  }

  /**
   * Gets list of peers associated with a user's lightning node
   * @param user Authenticated {@link User}
   * @returns Promise {@link ListPeersResponse}
   */
  @Get("/list-peers")
  async listPeers(@User() user: IUser): AsyncApiResult<ListPeersResponse.AsObject> {
    const peers = await this.lightning.listPeers(user.activeTenant?.tenantId);
    if (!peers) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get peers list: ${user.activeTenant?.tenantId}`));
    }
    return ApiResult.success(peers);
  }

  /**
   * Get list of utxos associated with channel opens for a node
   * @param user Authenticated {@link User}
   * @returns Promise {@link Transaction}
   */
  @Get("/utxos/channel-activity")
  async getChannelUtxos(@User() user: IUser): AsyncApiResult<Transaction.AsObject[]> {
    const utxos = await this.lightning.getChannelEventUtxos(user.activeTenant?.tenantId);
    if (!utxos) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get channel utxos: ${user.activeTenant?.tenantId}`));
    }
    return ApiResult.success(utxos);
  }

  /**
   * Get list of utxos associated with channel opens for a node
   * @param user Authenticated {@link User}
   * @returns Promise {@link Transaction}
   */
  @Get("/utxos")
  async getUtxos(@User() user: IUser): AsyncApiResult<Transaction.AsObject[]> {
    const utxos = await this.lightning.getUtxos(user.activeTenant?.tenantId);
    if (!utxos) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get utxos: ${user.activeTenant?.tenantId}`));
    }
    return ApiResult.success(utxos);
  }

  /**
   * Generates a BOLT 11 invoice from a user's lightning node
   * @param body {@link GenerateBolt11Dto}
   * @returns Promise {@link AddInvoiceResponse.AsObject}
   */
  @Post("bolt11")
  async generateBolt11(@User() user: IUser, @Body() body: GenerateBolt11Dto): AsyncApiResult<AddInvoiceResponse.AsObject> {
    const request = {
      tenantId: user.activeTenant?.tenantId,
      memo: body.memo,
      amount: body.amount,
      expiry: body.expiry
    };
    const invoice = await this.lightning.generateBolt11(request);
    if (!invoice) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to generate invoice: ${body}`));
    }
    return ApiResult.success(invoice);
  }

  /**
   * Decodes a BOLT 11 payreq with a user's lightning node
   * @param body {@link GenerateBolt11Dto}
   * @param payReq Bolt11 Payment request
   * @param tenantId User tenantId
   * @returns Promise {@link PayReq.AsObject}
   */
  @Get("bolt11")
  async readInvoice(@User() user: IUser, @Query("pay_req") payReq: string, @Query("tenantId") tenantId: string): AsyncApiResult<PayReq.AsObject> {
    const invoice = await this.lightning.readInvoice(payReq, user.activeTenant?.tenantId);
    if (!invoice) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to read invoice: ${payReq}`));
    }
    return ApiResult.success(invoice);
  }
  @Post("permissions")
  async checkMacaroonPermissions(@Body() body: any): AsyncApiResult<any> {
    const permissions = await this.lightning.checkMacaroonPermissions(body.macaroon, body.endpoint, body.certificate);
    return ApiResult.success(permissions);
  }

  @Get("version")
  async getLndVersion(@User() user: IUser): AsyncApiResult<LndVersion> {
    const version = await this.lightning.lndVersion(user.activeTenant?.tenantId);
    return ApiResult.success(version);
  }
}
