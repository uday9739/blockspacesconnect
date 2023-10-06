import { ErpMetadata, IntegrationTransactionReference } from "@blockspaces/shared/models/lightning/Integration";
import { AmountReference } from "@blockspaces/shared/models/lightning/Invoice";

export const getAmounts = (amount: AmountReference, negate: boolean = false): { btc: number, fiat: number } => {
  const bitcoin = Math.round(amount.btcValue * 100000000) * (negate ? -1 : 1)
  const fiat = (amount.fiatValue * (negate ? -1 : 1)).toFixed(2);
  return { btc: bitcoin, fiat: Number(fiat) };
};

export const buildIntegrationUrl = (integrations: IntegrationTransactionReference[], erpMetadata: ErpMetadata[], expense?: boolean) => {
  return integrations.length > 0 ?
    integrations[0].url :
    erpMetadata.length > 0 ?
      getCyclrIntegrationUrl(erpMetadata[0].domain, erpMetadata[0].value, expense) :
      null
}

const getCyclrIntegrationUrl = (domain: string, id: string, expense?: boolean) => {
  const isProd = process.env.HOST_URL === "https://app.blockspaces.com"
  switch (domain.toLowerCase()) {
    case "qbo":
      return isProd ? `https://app.qbo.intuit.com/app/${expense ? "expense" : "salesreceipt"}?txnId=${id}` : `https://app.sandbox.qbo.intuit.com/app/${expense ? "expense" : "salesreceipt"}?txnId=${id}`
    default:
      return null
  }
}