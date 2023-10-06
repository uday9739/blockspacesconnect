import {useMemo} from "react"
import { LightningChartData } from "@blockspaces/shared/dtos/lightning";
import { LightningChartCategories } from "@blockspaces/shared/dtos/lightning/chart-data";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { useBitcoinPrice } from "@lightning/queries";
import numeral from "numeral"

export const formatChartData = (chartData: LightningChartData) => {
  const { data: user } = useGetCurrentUser()
  const { bitcoinPrice } = useBitcoinPrice("usd")

  const formatNumber = (val) => {
    if (user.appSettings.bip.displayFiat) {
      const value = (val / 100_000_000) * Number(bitcoinPrice?.data?.exchangeRate)
      return numeral(value).format("0.00");
    }
    return numeral(val).format("0.00");
  }

  const chart: LightningChartData = useMemo(() => {
    const moneyInData = chartData?.data?.find(x => x.category === LightningChartCategories.MONEY_IN);
    const moneyIn = moneyInData?.values.map(val => { return formatNumber(val) }) ?? [];
    const moneyOutData = chartData?.data?.find(x => x.category === LightningChartCategories.MONEY_OUT);
    const moneyOut = moneyOutData?.values.map(val => { return formatNumber(val) }) ?? [];
    const balanceData = chartData?.data?.find(x => x.category === LightningChartCategories.BALANCE);
    const balance = balanceData?.values.map(val => { return formatNumber(val) }) ?? [];
    const onchainBalanceData = chartData?.data?.find(x => x.category === LightningChartCategories.ONCHAIN_BALANCE);
    const onchainBalance = onchainBalanceData?.values.map(val => { return formatNumber(val) }) ?? [];
    const offchainBalanceData = chartData?.data?.find(x => x.category === LightningChartCategories.OFFCHAIN_BALANCE);
    const offchainBalance = offchainBalanceData?.values.map(val => { return formatNumber(val) }) ?? [];

    const totals = chartData?.totals.map(total => {
      if (!user.appSettings.bip.displayFiat) return total;
      const fiatValue = numeral(total.amount / 100_000_000 * Number(bitcoinPrice.data.exchangeRate)).format("0.00")
      return { label: total.label, amount: fiatValue };
    }) ?? [];

    return {
      ...chartData, data: [
        { category: "MONEY IN", values: moneyIn },
        { category: "MONEY OUT", values: moneyOut },
        { category: "BALANCE", values: balance, tooltipData: [
          { label: "ONCHAIN", values: onchainBalance },
          { label: "OFFCHAIN", values: offchainBalance }
        ] },
        { category: "ONCHAIN_BALANCE", values: onchainBalance },
        { category: "OFFCHAIN_BALANCE", values: offchainBalance },
      ],
      totals: totals
    };
  }, [chartData])

  return chart
}
