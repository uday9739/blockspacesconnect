import { BitcoinConvertResultDto } from "@blockspaces/shared/dtos/networks/bitcoin/convert"
import { BitcoinPriceResultDto } from "@blockspaces/shared/dtos/networks/bitcoin/price"
import ApiResult from "@blockspaces/shared/models/ApiResult"
import { decode } from "@blockspaces/shared/validation/decorators"
import { useQuery } from "@tanstack/react-query"
import { convertBtcPrice, getBitcoinPrice } from "../../api"

export const useBitcoinPrice = (currency: string): { bitcoinPrice: ApiResult<BitcoinPriceResultDto>, bitcoinLoading: boolean, bitcoinError: any } => {
  const { data: bitcoinPrice, isLoading: bitcoinLoading, error: bitcoinError } = useQuery(["bitcoin-price"], () => getBitcoinPrice(currency))

  return { bitcoinPrice, bitcoinLoading, bitcoinError }
}

export const useFetchConversion = (decodedInvoice: any, doFetch?: boolean) => {
  let decodeInvoice
  let sats
  let btc
  let paymentHash
  let doNotRun
  try {
    decodeInvoice = decode(decodedInvoice)
  } catch (e) {
    doNotRun = true
  }
  sats = decodeInvoice?.satoshis ? decodeInvoice?.satoshis : undefined;
  btc = sats ? (sats / 100_000_000).toFixed(8) : undefined;
  paymentHash = decodeInvoice?.tags?.find(x => x.tagName === 'payment_hash');

  const { data: priceRes, refetch, error, isFetching } = useQuery<BitcoinConvertResultDto>([`convert-btc-price-sats`, parseFloat(btc)],
    () => convertBtcPrice(parseFloat(btc), 'sats'),
    { enabled: btc !== undefined || !doNotRun })

  return {
    isFetching,
    price: priceRes?.data,
    sats,
    btc,
    paymentHash,
    refetch,
    error
  }
}