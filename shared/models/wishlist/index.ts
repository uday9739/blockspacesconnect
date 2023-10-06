import { VersionedMongoDbModel } from "../MongoDbModel";

export interface Wishlist extends VersionedMongoDbModel {
  userId: string;
  connectorId?: string;
  offerId?: string;
  networkId?: string;
  createdAt?: string;
  updatedAt?: string;
}