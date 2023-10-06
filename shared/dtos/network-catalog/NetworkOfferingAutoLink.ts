import { NetworkOfferingRecurrence } from "../../models/network-catalog";


export interface NetworkOfferingAutoLinkDto {
  stripeProductId: string;
  offerTitle: string;
  description: string;
}

export interface NetworkOfferingWithIntegrationsPrice {
  price: number;
  isMetered: boolean;
  nickName: string;
  billingUsageCode?: string;
}
export interface NetworkOfferingWithIntegrationsDto {
  // connect 
  networkId: string;
  offerTitle: string;
  description: string;
  billingCategoryCode: string;
  billingTierCode: string;
  recommended?: boolean;
  recurrence: NetworkOfferingRecurrence;
  prices: NetworkOfferingWithIntegrationsPrice[]
}

export interface NetworkOfferingConfig {
  stripeProductName: string;
  stripeProductDescription: string;
  qboIncomeAccount: number;
  items: NetworkOfferingWithIntegrationsDto[]
}