import { VersionedMongoDbModel } from "../MongoDbModel";
import { NetworkOffering, NetworkPriceBillingCategory } from "../network-catalog";
import { NetworkPrice } from "../network-catalog/NetworkPrice";
import { BillingTier } from "../network-catalog/Tier";
import { BillingAddress } from "./BillingAddress";


export enum CartStatus {
  EMPTY = "EMPTY",
  PENDING_NEW_ADDITION_CONFIRMATION = "PENDING_NEW_ADDITION_CONFIRMATION", // used to bypass cc payment when user has existing subscription
  PENDING_BILLING_INFO = "PENDING_BILLING_INFO",
  PENDING_CC_INFO = "PENDING_CC_INFO",
  PENDING_PROCESSING_PAYMENT = "PENDING_PROCESSING_PAYMENT",
  CHECKOUT_COMPLETE = "CHECKOUT_COMPLETE",
  ERROR_GATEWAY_ERROR = "ERROR_GATEWAY_ERROR",
  EXPIRED = "EXPIRED",
  // FREE_OFFER with CC
  PENDING_BILLING_FOR_FREE_OFFER = "PENDING_BILLING_FOR_FREE_OFFER",
  PENDING_CC_FOR_FREE_OFFER = "PENDING_CC_FOR_FREE_OFFER",

}

export interface CartItem {
  offer: NetworkOffering;
}

export interface Cart extends VersionedMongoDbModel {
  date: Date;
  networkId: string;
  billingCategory: NetworkPriceBillingCategory | string;
  userId: string;
  status: CartStatus;
  connectSubscriptionId?: string;
  billingAddress?: BillingAddress;
  items?: CartItem[]
  cartError?: CartError
}

export interface CartError {
  code: string;
  message: string;
}