import { VersionedMongoDbModel } from "../MongoDbModel";
import { Network } from "../networks";
import { NetworkPrice } from "./NetworkPrice";
import { NetworkPriceBillingCategory } from "./NetworkPriceBillingCatelog";
import { BillingTier } from "./Tier";

export enum NetworkOfferingRecurrence {
  weekly = 'weekly',
  monthly = 'monthly',
  yearly = 'yearly'
}

/**
 Bundles a set of prices together as one single offering. 
 This is the "Offer" presented to the user available for purchase .
 */
export interface NetworkOffering extends VersionedMongoDbModel {
  network: Network;
  active: boolean;
  recommended?: boolean;
  title: string;
  description: string;
  recurrence: NetworkOfferingRecurrence;
  items: Array<NetworkOfferingItem>
  billingCategory: NetworkPriceBillingCategory | string;
  billingTier: BillingTier | string;
  longDescription?: string;
  isComingSoon?: boolean;
}

export interface NetworkOfferingItem {
  price: NetworkPrice;
}