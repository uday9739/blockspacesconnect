import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series"
import ApiResult from "@blockspaces/shared/models/ApiResult"
import { OutgoingPayments } from "@blockspaces/shared/models/spaces/Lightning"
import { useGetCurrentUser } from "@src/platform/hooks/user/queries"
import { useQuery } from "@tanstack/react-query"
import { getBitcoinTransactions, getOutgoingPayments, getPaidHistory, getChartData, refreshAllInvoices } from "../../api"

export const useBitcoinTransactions = () => {
  const { data: bitcoinTxs, isLoading: bitcoinTxsLoading, error: bitcoinTxsError } = useQuery({ queryKey: ["btc-txs"], queryFn: getBitcoinTransactions })

  return { bitcoinTxs, bitcoinTxsLoading, bitcoinTxsError }
}

export const useOutgoingPayments = (): { outgoingPayments: ApiResult<OutgoingPayments>, outgoingLoading: boolean, outgoingError: any } => {
  const { data: outgoingPayments, isLoading: outgoingLoading, error: outgoingError } = useQuery(["outgoing-payments"], () => getOutgoingPayments(true, 0, 10000, false))

  return { outgoingPayments, outgoingLoading, outgoingError }
}

export const usePaidHistory = () => {
  const { data: user } = useGetCurrentUser()
  const { data: paidHistory, isLoading: paidLoading, error: paidError } = useQuery(["paid-history"], () => getPaidHistory(user?.activeTenant?.tenantId), { enabled: user?.activeTenant?.tenantId != null })

  return { paidHistory, paidLoading, paidError }
}

export const useRefreshAllInvoices = () => {
  const { data: user } = useGetCurrentUser()
  const { data: refreshedInvoices, isLoading: refreshInvoicesLoading, error: refreshInvoicesError } = useQuery(["refresh-invoices"], () => refreshAllInvoices(user?.activeTenant?.tenantId), { enabled: user?.activeTenant?.tenantId != null })

  return { refreshedInvoices, refreshInvoicesLoading, refreshInvoicesError }
}

export const useChartData = (interval: NetworkDataInterval, start?: number, end?: number) => {
  const { data: user } = useGetCurrentUser()
  const { data: chartData, isLoading: chartLoading, error: chartError } = useQuery(["chart-data", interval, start, end], () => getChartData(user?.activeTenant?.tenantId, interval, start, end), { enabled: user?.activeTenant?.tenantId != null })

  return { chartData, chartLoading, chartError }
}