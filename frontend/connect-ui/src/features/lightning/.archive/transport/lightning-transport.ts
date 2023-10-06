import ApiResult, { IApiResult } from '@blockspaces/shared/models/ApiResult';
import { getApiUrl } from "../../../../platform/utils";
import { NodeInfo, NodeBalance, BitcoinTransaction, OutgoingPayments, DecodeInvoice, NewAddress } from '@blockspaces/shared/models/spaces/Lightning';
import { BaseHttpTransport } from "../../../../platform/api";
import { BalanceReference, InvoiceReference, PaymentReference, QuoteReference } from '@blockspaces/shared/models/lightning/Invoice';
import { BitcoinPriceDto, BitcoinPriceResultDto } from "@blockspaces/shared/dtos/networks/bitcoin/price"
import { LightningChartData } from "@blockspaces/shared/dtos/lightning";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { LightningNodeReference, LightningOnboardingStep } from '@blockspaces/shared/models/lightning/Node';
import { isErrorStatus } from '@blockspaces/shared/helpers/http';
export class LightningTransport extends BaseHttpTransport {
  static readonly instance: LightningTransport = new LightningTransport();

  /**
   * Checks the status of the node.
   * 
   * @returns `LightningOnboardingStep`
   */
  async heyhowareya(): Promise<ApiResult<LightningOnboardingStep>> {
    const response = await this.httpService.get<IApiResult<LightningOnboardingStep>>(getApiUrl("networks/lightning/onboard/heyhowareya"))

    return ApiResult.fromJson(response.data)
  }
  /**
   * Adds BENs as peers to lightning node 
   * @returns 
   */
  async addPeers(): Promise<ApiResult<any>> {
    const response = await this.httpService.post<IApiResult<any>>(getApiUrl("networks/lightning/onboard/add-peers"))
    console.log('added peer lightning transport');
    return ApiResult.fromJson(response.data)
  }

  /**
   * Requests inbound liquidity from random BEN to client node
   * @param sats size of channel in sats
   * @returns 
   */
  async requestInbound(sats: number): Promise<ApiResult<any>> {
    console.log('requesting inbound lightning transport');
    const body = {channelSize: sats, satsPerVbyte: 1, isPrivate: false};
    const response = await this.httpService.post<IApiResult<any>>(getApiUrl("networks/lightning/onboard/request-inbound"), body)
    console.log('request inbound res:', response);

    return ApiResult.fromJson(response.data)
  }

  /**
   * Retrieves user Lightning Node information.
   *
   * @returns the node information
   */
  async getInfo(): Promise<ApiResult<NodeInfo>> {
    const response = await this.httpService.get<IApiResult<NodeInfo>>(getApiUrl("networks/lightning/lnd/info"), { validErrorStatuses: [HttpStatus.NOT_FOUND] });

    return ApiResult.fromJson(response.data);
  }
  /**
   * 
   * Get LightningNode from mongo associated with active user 
   * @returns Promise<LightningNodeReference>
   * 
   */
  async getNodeDoc(tenantId:string): Promise<ApiResult<LightningNodeReference>> {
    const params = {tenantId}
    // Get node doc from mongo collection
    const result = await this.httpService.get<ApiResult<LightningNodeReference>>(getApiUrl("/networks/lightning/node"), {params: params, validErrorStatuses: [HttpStatus.NOT_FOUND]});
    // if (isErrorStatus(result.status)) return null
    return ApiResult.fromJson(result.data);
  }

  /**
   * Retrieves the total balance of the Lightning node over all channels.
   *
   * @returns Local and remote total balance on node
   */
  async getNodeBalance(tenantid): Promise<ApiResult<NodeBalance>> {
    const response = await this.httpService.get<IApiResult<NodeBalance>>(getApiUrl("networks/lightning/lnd/node-balance"), { params: {tenantid: tenantid}, validErrorStatuses: [HttpStatus.NOT_FOUND] });
    return ApiResult.fromJson(response.data);
  }

  /**
   * Retrieves the on-chain Bitcoin on the node (UTXO's)
   *
   * @param start_height The height from which to list transactions, inclusive. If this value is greater than end_height, transactions will be read in reverse.
   * @param end_height The height until which to list transactions, inclusive. To include unconfirmed transactions, this value should be set to -1
   * @param account An optional filter to only include transactions relevant to an account. If empty, account = "default"
   * @returns All on-chain Bitcoin UTXO's
   */
  async getBitcoinTransactions(start_height?, end_height?, account?): Promise<IApiResult<BitcoinTransaction[]>> {
    const requestParams = {
      start_height: start_height,
      end_height: end_height,
      account: account
    };
    const response = await this.httpService.get<ApiResult<BitcoinTransaction[]>>(getApiUrl("networks/lightning/lnd/bitcoin-transactions"), { params: requestParams });

    return ApiResult.fromJson(response.data);
  }

  /**
   * Retrieves the Lightning payments that the node is paying to.
   *
   * @param include_incomplete If true, then return payments that have not yet fully completed. This means that pending payments, as well as failed payments will show up if this field is set to true.
   * @param index_offset The index of a payment that will be used as either the start or end of a query to determine which payments should be returned in the response.
   * @param max_payments The maximal number of payments returned in the response to this query.
   * @param reversed If set, the payments returned will result from seeking backwards from the specified index offset.
   * @returns Payments that have been sent by the node.
   */
  async getOutgoingPayments(include_incomplete, index_offset, max_payments, reversed): Promise<IApiResult<OutgoingPayments>> {
    const requestParams = {
      include_incomplete: include_incomplete,
      index_offset: index_offset,
      max_payments: max_payments,
      reversed: reversed
    };
    const response = await this.httpService.get<ApiResult<OutgoingPayments>>(getApiUrl("networks/lightning/lnd/outgoing-payments"), { params: requestParams });

    return ApiResult.fromJson(response.data);
  }

  /**
   * Retrieves the MongoDb invoices that have been paid.
   *
   * @param tenantId The tenantId of the user to retrieve information
   * @returns Invoices that have been created by the customer and paid.
   */
  async getPaidHistory(tenantId: string): Promise<IApiResult<InvoiceReference[]>> {
    const requestParams = {
      tenantId: tenantId
    };
    const response = await this.httpService.get<ApiResult<InvoiceReference[]>>(getApiUrl("networks/bitcoin/invoice/history"), { params: requestParams });

    return ApiResult.fromJson(response.data);
  }

  /**
   * Gets invoice data for tenant in chart-friendly format
   *
   * @param tenantId - String
   * @param interval NetworkDataInterval - time interval (daily)
   * @param start Number - timestamp
   * @param end Number - timestamp
   * @returns Promise<LightningChartData>
   */
  async getChartData(tenantId: string, interval: NetworkDataInterval, timezone: string, start?: number, end?: number): Promise<IApiResult<LightningChartData>> {
    const body = { tenantId, interval, start, end, timezone };
    const result = await this.httpService.post<ApiResult<LightningChartData>>(getApiUrl("/networks/bitcoin/invoice/history"), body, { validErrorStatuses: [HttpStatus.NOT_FOUND] });
    return result.data;
  }

  /**
   * Creates an "Invoice" entry in Mongo DB for a specified FIAT amount...
   * This would represent a "charge"/"invoice" in quickbooks.
   *
   * When an invoice is about to be paid (the payer navigates to the checkout page),
   * a "quote" is generated that reflects the current price of bitcoin.
   *
   * @param invoice
   * @param amount
   * @param memo
   * @param tenantId
   * @returns Promise<ApiResult>
   */
  async createInvoice(amount: number, memo: string, tenantId: string, currency?: string): Promise<IApiResult<InvoiceReference>> {
    const body = {
      currency: currency || "usd",
      amount: amount,
      memo: memo,
      tenantId: tenantId
    };
    const response = await this.httpService.post<ApiResult<InvoiceReference>>(getApiUrl("/networks/bitcoin/invoice/lightning"), body, { validErrorStatuses: [HttpStatus.NOT_FOUND] });

    return ApiResult.fromJson(response.data);
  }

  /**
   * Fetches the current price of bitcoin and creates a BOLT11 paymentRequest for
   * a given invoiceId.
   *
   * The expiration time should be low (default 300s) to reduce the receiver's exposure
   * to bitcoin's volatility.
   *
   * @param invoiceId
   * @param expirationsInSecs
   * @param tenantId
   * @returns Promise<ApiResult> QuoteReference
   */
  async generateQuote(invoiceId: string, expirationInSecs: number, tenantId: string): Promise<IApiResult<QuoteReference>> {
    const body = { invoiceId, expirationInSecs, tenantId };
    const response = await this.httpService.post(getApiUrl("/networks/bitcoin/invoice/quote/lightning"), body, { validErrorStatuses: [HttpStatus.NOT_FOUND, HttpStatus.REQUEST_TIMEOUT, HttpStatus.BAD_REQUEST]})
    // if (response.status === HttpStatus.REQUEST_TIMEOUT) return
    return ApiResult.fromJson(response.data);
  }

  /**
   * Queries quotes corresponding to invoiceId, checks the status of each quote, and updates the statuses of quotes and invoices with new information.
   *
   * @param invoiceId String
   * @param tenantId String
   * @returns Promise<InvoiceReference>
   */
  async getInvoiceStatus(invoiceId: string, tenantId: string): Promise<IApiResult<InvoiceReference>> {
    const params = { invoiceId, tenantId };
    const response = await this.httpService.get<ApiResult<InvoiceReference>>(getApiUrl("/networks/bitcoin/invoice/lightning"), { params: params, validErrorStatuses: [HttpStatus.NOT_FOUND, HttpStatus.REQUEST_TIMEOUT]})
    // if (response.status === HttpStatus.REQUEST_TIMEOUT) return

    return ApiResult.fromJson(response.data);
  }

  /**
   * Fetches current data for all invoices, payments, balances
   *
   * @param tenantId String
   * @param auth?: LndRestDto
   * @returns Promise<InvoiceReference[]>
   */
  async refreshAllInvoices(tenantId: string): Promise<IApiResult<{ invoices: InvoiceReference[]; payments: PaymentReference[]; balances: BalanceReference[] }>> {
    const body = { tenantId };
    const response = await this.httpService.post<ApiResult<{ invoices: InvoiceReference[]; payments: PaymentReference[]; balances: BalanceReference[] }>>(
      getApiUrl("/networks/bitcoin/invoice/refresh"),
      body,
      { validErrorStatuses: [HttpStatus.NOT_FOUND] },
    );
    return ApiResult.fromJson(response.data);
  }

  /**
   * Generates a Bitcoin address for funding the node.
   *
   * @param type Address type. Default `WITNESS_PUBKEY_HASH`
   * @param account The name of the account to generate a new address for. If empty, the default wallet account is used.
   * @returns A new Bitcoin address to fund the node.
   */
  async getNewBitcoinAddress(type?: string, account?: string): Promise<IApiResult<NewAddress>> {
    const requestParams = { type, account };
    const result = await this.httpService.get<ApiResult<NewAddress>>(getApiUrl("networks/lightning/wallet/new-address"), { params: requestParams, validErrorStatuses: [HttpStatus.NOT_FOUND] });
    return ApiResult.fromJson(result.data);
  }

  /**
   * Decodes a BOLT11 invoice for the payment information.
   *
   * @param pay_req The payment request to decode.
   * @param tenantId
   * @returns The payment information encoded in the payment request.
   */
  async getDecodeInvoice(pay_req: string, tenantId: string): Promise<IApiResult<DecodeInvoice>> {
    const requestParams = { pay_req, tenantId };
    const result = await this.httpService.get<ApiResult<DecodeInvoice>>(getApiUrl("networks/lightning/lnd/bolt11"), { params: requestParams, validErrorStatuses: [HttpStatus.NOT_FOUND] });
    return ApiResult.fromJson(result.data);
  }

  /**
   * Shows the list of peers connected to the node.
   *
   * @returns The list of peers.
   */
  async getPeers(): Promise<IApiResult> {
    const result = await this.httpService.get<ApiResult>(getApiUrl("networks/lightning/lnd/list-peers"), { validErrorStatuses: [HttpStatus.NOT_FOUND] });
    return result.data;
  }

  /**
   * Shows the list of channels open or closed on the node.
   * @param channels Filters for the return object. Active, inactive, public, and private.
   * @param rest The rest object containing the macaroon and cert.
   * @returns The channel list of the node.
   */
  async getChannelsList(active_only?: boolean, inactive_only?: boolean, public_only?: boolean, private_only?: boolean, peer?: string): Promise<IApiResult<any>> {
    const params = { active_only, inactive_only, public_only, private_only, peer };
    const result = await this.httpService.get<ApiResult>(getApiUrl("/networks/lightning/lnd/channels"), { params: params, validErrorStatuses: [HttpStatus.NOT_FOUND] });
    return result.data;
  }

  /**
   * Fetches the current price of Bitcoin
   *
   * @param currency The fiat currency (ew) to convert to get the price of the world's best asset.
   * @returns The price of the orange coin.
   */
  async getBitcoinPrice(currency: string) {
    const params: BitcoinPriceDto = { currency }
    const price = await this.httpService.get<ApiResult<BitcoinPriceResultDto>>(getApiUrl("/networks/bitcoin/price"), { params: params, validErrorStatuses: [HttpStatus.BAD_REQUEST] })
    if (isErrorStatus(price.status)) return null
    return price.data
  }

  /**
   * Returns the amount of Bitcoin given a fiat price.
   *
   * @param amount The amount in fiat.
   * @param currency The fiat to use.
   * @returns Converted amount of Bitcoin from fiat.
   */
  async convertBtcPrice(amount: number, currency: string) {
    const params = {
      amount: amount,
      currency: currency
    };
    const result = await this.httpService.get<ApiResult>(getApiUrl("networks/bitcoin/convert"), { params: params });
    return result.data;
  }
}
