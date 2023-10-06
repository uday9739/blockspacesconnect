import { BillingTier } from "../network-catalog/Tier";
import { MongoDbModel, VersionedMongoDbModel } from "../MongoDbModel";
import { NetworkPriceBillingCategory } from "../network-catalog";
/**
 * An association between a specific user and Blockchain network.
 *
 * The generic type param, `T`, represents the type associated
 * with any network-specific data (i.e. configuration or other user-specific metadata).
 *
 * The existence of this data means only that a user has chosen to
 * include a specific network in their list of "available" networks,
 * and does not indicate that a user owns or has access to
 * any specific resources or services related to the network.
 */
export interface UserNetwork<T = any> extends VersionedMongoDbModel {

  /** unique ID of the user that is associated with the network */
  userId: string;

  /** ID of the network the user is connected to */
  networkId: string;

  /** network-specific data for the user (configuration, resource metadata, etc) */
  networkData?: T;
  /**
   * Readonly property for mongo discriminator pattern
   */
  readonly type?: string;

  status?: UserNetworkStatus;

  billingCategory: NetworkPriceBillingCategory | string;
  billingTier: BillingTier | string;
}

export enum UserNetworkStatus {
  PendingCancelation = 'PendingCancelation',
  TemporarilyPaused = 'TemporarilyPaused'
}