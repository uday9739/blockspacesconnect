import { VersionedMongoDbModel } from "../MongoDbModel";

export interface BillingTier extends VersionedMongoDbModel {
  displayName: string,
  tierSort: number;
  code: BillingTierCode
}

export enum BillingTierCode {
  WishListItem = "WishListItem",
  FreeWithCC = "FreeWithCC",
  Free = "Free",
  Basic = "Basic",
  Standard = "Standard",
  Professional = "Professional",
  Enterprise = "Enterprise"
}