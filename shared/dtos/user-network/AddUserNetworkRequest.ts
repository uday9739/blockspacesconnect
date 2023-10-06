import { IsDefined, IsIn, IsOptional } from "class-validator";
import { NetworkPriceBillingCategory } from "../../models/network-catalog";
import { BillingTier } from "../../models/network-catalog/Tier";

/**
 * Data in the body of a request to add a new UserNetwork (i.e. POST /api/user-network)
 */
export class AddUserNetworkRequest<TNetworkData = any> {

  /** the unique ID of the blockchain network */
  @IsDefined()
  networkId: string;

  /** network-specific data that will be saved as part of the UserNetwork record */
  @IsOptional()
  networkData?: TNetworkData;

  billingCategoryCode: string;
  billingTierCode: string;

  constructor(json?: Partial<AddUserNetworkRequest<TNetworkData>>) {
    Object.assign(this, json);
  }
}