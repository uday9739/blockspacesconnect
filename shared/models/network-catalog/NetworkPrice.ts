import { VersionedMongoDbModel } from "../MongoDbModel";
import { Network } from "../networks";
import { NetworkOfferingRecurrence } from "./NetworkOffering";
import { NetworkPriceBillingCategory } from "./NetworkPriceBillingCatelog";


/**
 * this enum maps to a network price
 * this will be used in conjunction with isMetered,to know which 'line item' will use a particular workflow for billing calculation 
 */
export enum NetworkPriceBillingUsageCode {
  // Lighting 
  LNC_LIQUIDITY_RENTAL = 'LNC_LIQUIDITY_RENTAL',
  LNC_TRANSACTION = 'LNC_TRANSACTION',
  // Developer Endpoint
  DEV_ENDPOINT_TRANSACTION = 'DEV_ENDPOINT_TRANSACTION'
}

/**
 * This maintains the link of a stripe price for a given network price
 * Currently stripe is the source of truth for price , so will just be a pointer
 */
export interface NetworkPrice extends VersionedMongoDbModel {
  network: Network;
  active: boolean;
  stripeId: string;
  quickBooksItemId: string;
  isMetered: boolean;
  billingUsageCode?: NetworkPriceBillingUsageCode;
  recurrence?: NetworkOfferingRecurrence;
  billingCategory: NetworkPriceBillingCategory;
}