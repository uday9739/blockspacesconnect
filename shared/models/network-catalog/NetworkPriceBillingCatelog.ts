import { VersionedMongoDbModel } from "../MongoDbModel";

export enum NetworkPriceBillingCodes {
  MultiWebApp = 'MultiWebApp',
  Infrastructure = 'Infrastructure',
  BusinessConnectors = 'BusinessConnectors'
}

export interface NetworkPriceBillingCategory extends VersionedMongoDbModel {
  name: string;
  description: string;
  code: NetworkPriceBillingCodes
  sortOrder: number;
  slug: string;
  active: boolean;
}