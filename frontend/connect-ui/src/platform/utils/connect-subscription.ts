import { ConnectSubscriptionItemExpandedDto } from "@blockspaces/shared/dtos/connect-subscription/ConnectSubscriptionDto";
import { NetworkOfferingDTO } from "@blockspaces/shared/dtos/network-catalog";
import { ConnectSubscriptionRecurrence } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { NetworkId } from "@blockspaces/shared/models/networks";
import { BillingTierCode } from "@blockspaces/shared/models/network-catalog/Tier";

export const _getShortHandRecurrence = (recurrence: string) => {
  switch (recurrence) {
    case ConnectSubscriptionRecurrence.Monthly:
      return "mth";
    case ConnectSubscriptionRecurrence.Yearly:
      return "yr";
    case ConnectSubscriptionRecurrence.Weekly:
      return "wk";
    default:
      return recurrence;
  }
};

export const getBipSupportLevels = (Tier: BillingTierCode) => {
  switch (Tier) {
    case BillingTierCode.Basic:
      return 'Email, ~24hrs Response'
    case BillingTierCode.Professional:
      return 'Live Chat, ~8hrs Response'
    case BillingTierCode.Enterprise:
      return 'Live Chat, ~2hrs Response'
    default:
      return 'Email, ~24hrs Response'
  }

}
export const getBipVolumeAllotment = (Tier: BillingTierCode) => {
  switch (Tier) {
    case BillingTierCode.FreeWithCC:
      return `Up to $50 USD / ${_getShortHandRecurrence(ConnectSubscriptionRecurrence.Monthly)}`
    case BillingTierCode.Basic:
      return `Up to $5,000 USD / ${_getShortHandRecurrence(ConnectSubscriptionRecurrence.Monthly)}`
    case BillingTierCode.Professional:
      return `Up to $10,000 USD / ${_getShortHandRecurrence(ConnectSubscriptionRecurrence.Monthly)}`
    case BillingTierCode.Enterprise:
      return `More than $10,000 USD / ${_getShortHandRecurrence(ConnectSubscriptionRecurrence.Monthly)}`
    default:
      return ''
  }
}
export const getOfferPriceDetails = (offering: NetworkOfferingDTO, networkId: string): { baseFee: number, meteredCost: number, priceDetails: String } => {
  let baseFee = 0;
  let meteredCost = 0;
  const meteredCostPrefix = networkId === NetworkId.LIGHTNING ? "" : "$";
  const meteredCostDescription = networkId === NetworkId.LIGHTNING ? "% Transaction Fee" : "Per Transaction";
  offering?.items.forEach(item => {
    if (!item.isMetered) {
      baseFee += item.unitAmount;
      return
    } else {
      if (item.network === NetworkId.LIGHTNING) {
        meteredCost = meteredCost + (item.unitAmount);
      }
      else {
        meteredCost = meteredCost + item.unitAmount;
      }
    }
  })

  const priceDetails = `$${baseFee} / ${_getShortHandRecurrence(offering?.recurrence)} + ${meteredCostPrefix}${meteredCost} ${meteredCostDescription}`

  return {
    baseFee,
    meteredCost,
    priceDetails
  }
}

