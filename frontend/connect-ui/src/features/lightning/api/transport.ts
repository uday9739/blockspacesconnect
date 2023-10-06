import ApiResult, { AsyncApiResult, IApiResult } from '@blockspaces/shared/models/ApiResult';
import { getApiUrl } from "src/platform/utils";
import { NodeInfo, NodeBalance, BitcoinTransaction, OutgoingPayments, DecodeInvoice, NewAddress } from '@blockspaces/shared/models/spaces/Lightning';
import { BalanceReference, InvoiceReference, PaymentReference, QuoteReference, ObjectsResponseReference, PaymentSource, OnchainInvoice, OnchainQuote } from '@blockspaces/shared/models/lightning/Invoice';
import { RecommendedFees } from '@blockspaces/shared/models/lightning/Channels';
import { BitcoinConvertResultDto } from "@blockspaces/shared/dtos/networks/bitcoin/convert"
import { BitcoinPriceDto, BitcoinPriceResultDto } from "@blockspaces/shared/dtos/networks/bitcoin/price"
import { LightningChartData, WalletBalanceResponse } from "@blockspaces/shared/dtos/lightning";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { LightningNodeReference, LightningOnboardingStep, LndVersion } from '@blockspaces/shared/models/lightning/Node';
import { isErrorStatus } from '@blockspaces/shared/helpers/http';
import axios from "axios"
import { ListChannelsResponse } from '@blockspaces/shared/proto/lnrpc/lightning_pb';
import { ErpMetadata } from '@blockspaces/shared/models/lightning/Integration';

/**
 * Checks the status of the node.
 * 
 * @returns `LightningOnboardingStep`
 */
export const heyhowareya = async (): Promise<ApiResult<LightningOnboardingStep>> => {
  const response = await axios.get<IApiResult<LightningOnboardingStep>>(getApiUrl("networks/lightning/onboard/heyhowareya"))

  return ApiResult.fromJson(response.data)
}

/**
 * Adds BENs as peers to lightning node 
 * @returns 
 */
export const addPeers = async (): Promise<ApiResult<any>> => {
  const response = await axios.post<IApiResult<any>>(getApiUrl("networks/lightning/onboard/add-peers"))

  return ApiResult.fromJson(response.data)
}

/**
 * Requests inbound liquidity from random BEN to client node
 * @param sats size of channel in sats
 * @returns 
 */
export const requestInbound = async (): Promise<ApiResult<any>> => {
  const feeRate = await getRecommendedFees()
  const body = { satsPerVbyte: feeRate.fastestFee, isPrivate: false };
  const response = await axios.post<IApiResult<any>>(getApiUrl("networks/lightning/onboard/request-inbound"), body)

  return ApiResult.fromJson(response.data)
}

/**
 * Retrieves user Lightning Node information.
 *
 * @returns the node information
 */
export const getInfo = async (): Promise<ApiResult<NodeInfo>> => {
  const response = await axios.get<IApiResult<NodeInfo>>(getApiUrl("networks/lightning/lnd/info"));

  return ApiResult.fromJson(response.data);
}
/**
 * 
 * Get LightningNode from mongo associated with active user 
 * @returns Promise<LightningNodeReference>
 * 
 */
export const getNodeDoc = async (tenantId: string): Promise<ApiResult<LightningNodeReference>> => {
  const params = { tenantId }
  // Get node doc from mongo collection
  const result = await axios.get<ApiResult<LightningNodeReference>>(getApiUrl("/networks/lightning/node"), { params: params });
  if (isErrorStatus(result.status)) return null
  return ApiResult.fromJson(result.data);
}

/**
 * Retrieves the total balance of the Lightning node over all channels.
 *
 * @returns Local and remote total balance on node
 */
export const getNodeBalance = async (tenantid: string): Promise<ApiResult<NodeBalance>> => {
  const response = await axios.get<IApiResult<NodeBalance>>(getApiUrl("networks/lightning/lnd/node-balance"), { params: { tenantid: tenantid } });
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
export const getBitcoinTransactions = async (start_height?, end_height?, account?): Promise<IApiResult<BitcoinTransaction[]>> => {
  const requestParams = {
    start_height: start_height,
    end_height: end_height,
    account: account
  };
  const response = await axios.get<ApiResult<BitcoinTransaction[]>>(getApiUrl("networks/lightning/lnd/bitcoin-transactions"), { params: requestParams });

  return ApiResult.fromJson(response.data);
}

/**
 * Retrieves the node's internal wallet balance.
 * 
 * @returns Balance of the node's internal wallet
 */
export const getWalletBalance = async (): AsyncApiResult<WalletBalanceResponse> => {
  const response = await axios.get<ApiResult<WalletBalanceResponse>>(getApiUrl("networks/lightning/wallet/balance"))
  return ApiResult.fromJson(response.data)
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
export const getOutgoingPayments = async (include_incomplete, index_offset, max_payments, reversed): Promise<ApiResult<OutgoingPayments>> => {
  const requestParams = {
    include_incomplete: include_incomplete,
    index_offset: index_offset,
    max_payments: max_payments,
    reversed: reversed
  };
  const response = await axios.get<ApiResult<OutgoingPayments>>(getApiUrl("networks/lightning/lnd/outgoing-payments"), { params: requestParams });

  return ApiResult.fromJson(response.data);
}

/**
 * Retrieves the MongoDb invoices that have been paid.
 *
 * @param tenantId The tenantId of the user to retrieve information
 * @returns Invoices that have been created by the customer and paid.
 */
export const getPaidHistory = async (tenantId: string): Promise<IApiResult<InvoiceReference[]>> => {
  const requestParams = {
    tenantId: tenantId
  };
  const response = await axios.get<ApiResult<InvoiceReference[]>>(getApiUrl("networks/bitcoin/invoice/history"), { params: requestParams });

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
export const getChartData = async (tenantId: string, interval: NetworkDataInterval, start?: number, end?: number): Promise<ApiResult<LightningChartData>> => {
  const body = { tenantId, interval, start, end };
  const result = await axios.post<ApiResult<LightningChartData>>(getApiUrl("/networks/bitcoin/invoice/history"), body);
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
export const createInvoice = async (amount: number, memo: string, tenantId: string, currency?: string, erpId?: string, erpMetadata: ErpMetadata[] = [], source: PaymentSource = "unknown"): Promise<{onchain: OnchainInvoice, offchain: InvoiceReference}> => {
  
  const body = {
    currency: currency || "usd",
    amount,
    memo,
    tenantId,
    source,
    erpMetadata
  };
  const response = await axios.post<ApiResult<{onchain: OnchainInvoice, offchain: InvoiceReference}>>(getApiUrl("/networks/bitcoin/invoice"), body);

  return response.data.data;
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
export const generateLightningQuote = async (invoiceId: string, expirationInSecs: number, tenantId: string): Promise<QuoteReference> => {
  const body = { invoiceId, expirationInSecs, tenantId };
  const response = await axios.post<ApiResult<QuoteReference>>(getApiUrl("/networks/bitcoin/invoice/quote/lightning"), body)
  if (response.status === HttpStatus.REQUEST_TIMEOUT) return
  return response.data.data;
}

/**
 * Fetches the current price of bitcoin and creates an onchain address for
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
export const generateOnchainQuote = async (invoiceId: string, expirationInSecs: number, tenantId: string): Promise<OnchainQuote> => {
  const body = { invoiceId, expirationInSecs, tenantId };
  const response = await axios.post<ApiResult<OnchainQuote>>(getApiUrl("/networks/bitcoin/invoice/quote/onchain"), body)
  if (response.status === HttpStatus.REQUEST_TIMEOUT) return
  return response.data.data;
}

/**
 * Queries quotes corresponding to invoiceId, checks the status of each quote, and updates the statuses of quotes and invoices with new information.
 *
 * @param invoiceId String
 * @param tenantId String
 * @returns Promise<InvoiceReference>
 */
export const getInvoiceStatus = async (offchainInvoiceId: string, onchainInvoiceId: string, tenantId: string): Promise<ApiResult<{onchain: OnchainInvoice, offchain: InvoiceReference}>> => {
  const params = { offchainInvoiceId, onchainInvoiceId, tenantId };
  const response = await axios.get<ApiResult<{onchain: OnchainInvoice, offchain: InvoiceReference}>>(getApiUrl("/networks/bitcoin/invoice"), { params: params })
  if (response.status === HttpStatus.REQUEST_TIMEOUT) return

  return response.data;
}

/**
 * Fetches current data for all invoices, payments, balances
 *
 * @param tenantId String
 * @param auth?: LndRestDto
 * @returns Promise<InvoiceReference[]>
 */
export const refreshAllInvoices = async (tenantId: string): Promise<ApiResult<ObjectsResponseReference>> => {
  const body = { tenantId };
  const response = await axios.post<ApiResult<ObjectsResponseReference>>(
    getApiUrl("/networks/bitcoin/invoice/refresh"),
    body,
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
export const getNewBitcoinAddress = async (type?: string, account?: string): Promise<IApiResult<NewAddress>> => {
  const requestParams = { type, account };
  const result = await axios.get<ApiResult<NewAddress>>(getApiUrl("networks/lightning/wallet/new-address"), { params: requestParams });
  return ApiResult.fromJson(result.data);
}

/**
 * Decodes a BOLT11 invoice for the payment information.
 *
 * @param pay_req The payment request to decode.
 * @param tenantId
 * @returns The payment information encoded in the payment request.
 */
export const getDecodeInvoice = async (pay_req: string, tenantId: string): Promise<IApiResult<DecodeInvoice>> => {
  const requestParams = { pay_req, tenantId };
  const result = await axios.get<ApiResult<DecodeInvoice>>(getApiUrl("networks/lightning/lnd/bolt11"), { params: requestParams });
  return ApiResult.fromJson(result.data);
}

/**
 * Shows the list of peers connected to the node.
 *
 * @returns The list of peers.
 */
export const getPeers = async (): Promise<IApiResult> => {
  const result = await axios.get<ApiResult>(getApiUrl("networks/lightning/lnd/list-peers"));
  return result.data;
}

/**
 * Shows the list of channels open or closed on the node.
 * @param channels Filters for the return object. Active, inactive, public, and private.
 * @param rest The rest object containing the macaroon and cert.
 * @returns The channel list of the node.
 */
export const getChannelsList = async (active_only?: boolean, inactive_only?: boolean, public_only?: boolean, private_only?: boolean, peer?: string)
  : Promise<ListChannelsResponse.AsObject> => {
  const params = { active_only, inactive_only, public_only, private_only, peer };
  const result = await axios.get<ApiResult<ListChannelsResponse.AsObject>>(getApiUrl("/networks/lightning/lnd/channels"), { params: params });
  return result.data?.data;
}

/**
 * Fetches the current price of Bitcoin
 *
 * @param currency The fiat currency (ew) to convert to get the price of the world's best asset.
 * @returns The price of the orange coin.
 */
export const getBitcoinPrice = async (currency: string): Promise<ApiResult<BitcoinPriceResultDto>> => {
  const params: BitcoinPriceDto = { currency }
  const price = await axios.get<ApiResult<BitcoinPriceResultDto>>(getApiUrl("/networks/bitcoin/price"), { params: params })
  if (isErrorStatus(price.status)) return null
  return ApiResult.fromJson(price.data)
}

/**
 * Returns the amount of Bitcoin given a fiat price.
 *
 * @param amount The amount in fiat.
 * @param currency The fiat to use.
 * @returns Converted amount of Bitcoin from fiat.
 */
export const convertBtcPrice = async (amount: number, currency: string): Promise<any> => {
  const params = {
    amount: amount,
    currency: currency
  };
  const result = await axios.get<ApiResult<BitcoinConvertResultDto>>(getApiUrl("networks/bitcoin/convert"), { params: params });
  return result.data;
}

export const getRecommendedFees = async (): Promise<RecommendedFees> => {
  const fees = await axios.get("https://mempool.space/api/v1/fees/recommended")
  return fees.data
}

export const getLndVersion = async (): Promise<ApiResult<LndVersion>> => {
  const version = await axios.get(getApiUrl("/networks/lightning/lnd/version"))
  return version.data
}

export const resetNode = async (): Promise<ApiResult<string>> => {
  const reset = await axios.post(getApiUrl("/networks/lightning/onboard/reset-node"))
  return reset.data
}