import { ConnectSubscriptionItem } from "../../models/connect-subscription/ConnectSubscription";
import { NetworkPrice, NetworkPriceBillingCodes } from "../../models/network-catalog";
import { UserNetwork } from "../../models/networks";



export interface ConnectSubscriptionItemExpandedDto {
  networkId: string;
  userNetwork?: UserNetwork;
  dateAdded?: number
  statusOverride?: string
  displayName: string;
  recurrence: string,
  unitAmount: number
  isMetered: boolean
  metadata?: { [key: string]: string }
  id: string
  offer: string;
  billingCategory: {
    name: string;
    description: string;
    code: NetworkPriceBillingCodes
  }
}

export interface ConnectSubscriptionExpandedDto {
  cancellationDate?: number;
  createdOn?: number;
  recurrence: string,
  paymentMethod: string,
  status: string,
  currentPeriod?: {
    billingStart: number,
    billingEnd: number,
    meteredUsageStart: number,
    meteredUsageEnd: number
  },
  networks?: Array<string>,
  items: Array<ConnectSubscriptionItemExpandedDto>,
  usageAuditTrail?: Array<{
    billingCode: string,
    unitQuantity: number,
    connectSubscriptionItemId: string,
    meteredUsageStart: number,
    meteredUsageEnd: number,
    timestamp: number
  }>
}