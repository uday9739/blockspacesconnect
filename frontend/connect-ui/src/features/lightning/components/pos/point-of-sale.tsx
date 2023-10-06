
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

import { DollarAmount, PointOfSalePage, PointOfSaleContainer, SalePrice, SatsAmount, KeyPad, Pin, ActionBar, Clear, Charge, KeyPadContainer, CompanyName, Footer } from "./point-of-sale.styles"

import { PaymentSource } from "@blockspaces/shared/models/lightning/Invoice"
import { useUIStore } from "@ui"
import { BoltPos, BackSpace, Clear as ClearIcon, Bitcoin } from "@icons"
import { useNodeBalance, useNodeDoc, useBitcoinPrice } from "@lightning/queries"
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node"
import { NodeBalance } from "@blockspaces/shared/models/spaces/Lightning"
import ApiResult from "@blockspaces/shared/models/ApiResult"
import { BitcoinPriceResultDto } from "@blockspaces/shared/dtos/networks/bitcoin/price"
import { Loading } from "@src/platform/components/common"

type PageData = {
  nodeDoc: ApiResult<LightningNodeReference>,
  nodeBalance: ApiResult<NodeBalance>,
  bitcoinPrice: ApiResult<BitcoinPriceResultDto>,
  loading: boolean,
  error: Error | unknown
}
const usePageData = (): PageData => {
  const { nodeDoc, nodeDocLoading, nodeDocError } = useNodeDoc()
  const { nodeBalance, balanceLoading, balanceError } = useNodeBalance()
  const { bitcoinPrice, bitcoinLoading, bitcoinError } = useBitcoinPrice("usd")
  return {
    nodeDoc,
    nodeBalance,
    bitcoinPrice,
    loading: nodeDocLoading || balanceLoading || bitcoinLoading,
    error: nodeDocError || balanceError || bitcoinError
  }
}

export const PointOfSale = () => {
  const router = useRouter()
  const UI = useUIStore()
  const { tenantId } = router.query

  const [fiatToBePaid, setFiatToBePaid] = useState<string>("0.00")
  const [satsToBePaid, setSatsToBePaid] = useState<number>(0)
  const [disablePos, setDisablePos] = useState<boolean>(false)

  const { nodeDoc, nodeBalance, bitcoinPrice, loading, error } = usePageData()

  useEffect(() => {
    if (!error) return
    setDisablePos(true)
    UI.showToast({
      message: `Node wallet is locked. Please unlock the node from the BlockSpaces dashboard.`,
      alertType: "error",
      position: {
        horizontal: "right",
        vertical: "top"
      },
      autoHideDuration: null
    })
  }, [error])

  const convertToSats = async () => {
    if (fiatToBePaid === "0.00" || isNaN(Number(fiatToBePaid))) return setSatsToBePaid(0);
    const conversion = (Number(fiatToBePaid) / Number(bitcoinPrice.data.exchangeRate)) * 100_000_000
    setSatsToBePaid(Math.round(conversion));
  };

  const addNumber = (num: string) => {
    if (fiatToBePaid === "0.00") return setFiatToBePaid(num);
    if (num === '.' && fiatToBePaid.includes('.')) return;
    const number = fiatToBePaid.concat(num);
    setFiatToBePaid(number);
  };

  const pins = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 12]
  const pinButton = (number: number) => {
    switch (number) {
      case 10:
        return <Pin id={number.toString()} disabled={loading || disablePos} key={`pin-${number}`} onClick={() => setFiatToBePaid(fiatToBePaid.substring(0, fiatToBePaid.length - 1) || "0.00")}><BackSpace /></Pin>
      case 12:
        return <Pin id={number.toString()} disabled={loading || disablePos} key={`pin-${number}`} onClick={() => addNumber(".")}>.</Pin>
      default:
        return <Pin id={number.toString()} disabled={loading || disablePos} key={`pin-${number}`} onClick={() => addNumber(`${number}`)}>{number}</Pin>
    }
  }

  const zeroAmountToast = () => {
    return UI.showToast({
      message: `Amount charged must be greater than $0`,
      alertType: "error",
      position: {
        horizontal: "right",
        vertical: "top"
      },
      autoHideDuration: 5000
    })
  }

  const lowReceivableBalanceToast = (receivableBalance) => {
    const fiatBalance = ((receivableBalance.remote_balance.sat / 100_000_000) * Number(bitcoinPrice.data.exchangeRate)).toFixed(2)
    return UI.showToast({
      message: `You do not have enough in your receivable balance to accept this transaction. Available liquidity: ${Number(receivableBalance.remote_balance.sat).toLocaleString()} sats ($${fiatBalance.toLocaleString()}).`,
      alertType: "error",
      position: {
        horizontal: "right",
        vertical: "top"
      },
      autoHideDuration: 5000,
      onClose: () => setFiatToBePaid("0.00")
    })
  }

  const nanToast = () => {
    return UI.showToast({
      message: `The amount to charge must be a number.`,
      alertType: "error",
      position: {
        horizontal: "right",
        vertical: "top"
      },
      autoHideDuration: 5000
    })
  }

  const openCheckoutScreen = async () => {
    if (isNaN(Number(fiatToBePaid))) return nanToast()
    if (Number(fiatToBePaid) <= 0 || fiatToBePaid === ".") return zeroAmountToast()
    let receivableBalance = nodeBalance.data
    if (satsToBePaid >= Number(receivableBalance.remote_balance.sat)) return lowReceivableBalanceToast(receivableBalance)
    return router.push({ pathname: `/multi-web-app/lightning/pos`, query: { tenantId: tenantId, modal: "checkout", amount: fiatToBePaid, source: "pos" as PaymentSource } })
  }

  useEffect(() => {
    if (fiatToBePaid === "0.00") setSatsToBePaid(0)
    convertToSats();
  }, [fiatToBePaid, router.query]);

  useEffect(() => {
    if (!router.query.amount) setFiatToBePaid("0.00")
  }, [router.query])

  if (loading) return <Loading when={loading} />

  return (
    <PointOfSalePage>
      <CompanyName id="lblCompanyName">{nodeDoc?.data.nodeLabel}</CompanyName>
      <PointOfSaleContainer>
        <SalePrice>
          <DollarAmount>${fiatToBePaid}</DollarAmount>
          <SatsAmount>{satsToBePaid.toLocaleString()} SATS</SatsAmount>
        </SalePrice>
        <KeyPadContainer>
          <KeyPad>
            {pins.map(num => { return pinButton(num) })}
          </KeyPad>
          <ActionBar>
            <Clear disabled={loading || disablePos} onClick={() => setFiatToBePaid("0.00")}><ClearIcon /></Clear>
            <Charge id="btnBoltPos" disabled={loading || disablePos} onClick={() => openCheckoutScreen()}><BoltPos /></Charge>
          </ActionBar>
        </KeyPadContainer>
      </PointOfSaleContainer>
      <Footer><Bitcoin width="1.5rem" height="1.5rem" /> &nbsp; powered by BlockSpaces</Footer>
    </PointOfSalePage>
  )
}