import { NetworkOfferingRecurrence, NetworkPriceBillingCategory } from "../../models/network-catalog";
import { BillingTier } from "../../models/network-catalog/Tier";

export type NetworkPriceRecurringInterval =
  'month' |
  'year' |
  'week' |
  'day'

export type NetworkPriceType =
  'one_time' |
  'recurring '

export interface NetworkPriceDto {
  id: string
  displayName: string;
  offer: string;
  network?: string;
  recurring?: NetworkPriceRecurringInterval
  recurrence: NetworkOfferingRecurrence,
  type: NetworkPriceType
  unitAmount: number
  isMetered: boolean
  tiers?: PriceTier[]
  metadata?: { [key: string]: string }
}

export interface PriceTier {
  flatAmount: number | null;
  flatAmountDecimal: number | null;
  unitAmount: number | null;
  unitAmountDecimal: number | null;
  upTo: number | null;
}


export interface NetworkOfferingDTO {
  id: string;
  recommended?: boolean;
  network: string;
  title: string;
  description: string;
  tier: BillingTier,
  billingCategory: NetworkPriceBillingCategory;
  recurrence: NetworkOfferingRecurrence;
  items: Array<NetworkOfferingItemDTO>
}

export interface NetworkOfferingItemDTO extends NetworkPriceDto {
}