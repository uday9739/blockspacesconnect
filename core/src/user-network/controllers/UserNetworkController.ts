import { AddUserNetworkRequest } from '@blockspaces/shared/dtos/user-network';
import ApiResult, { AsyncApiResult } from '@blockspaces/shared/models/ApiResult';
import { BillingTierCode } from '@blockspaces/shared/models/network-catalog/Tier';
import { NetworkId, UserNetwork } from '@blockspaces/shared/models/networks';
import { IUser } from '@blockspaces/shared/models/users';
import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ConnectDbDataContext } from '../../connect-db/services/ConnectDbDataContext';
import { User } from '../../users';
import { ValidBody } from '../../validation';
import { UserNetworkDataService } from '../services/UserNetworkDataService';

@Controller('user-network')
export class UserNetworkController {
  constructor(private readonly dataService: UserNetworkDataService, private readonly db: ConnectDbDataContext) { }

  /** Get all UserNetwork data for the current user */
  @Get()
  async getAllUserNetworks(@User() user: IUser): Promise<ApiResult<UserNetwork[]>> {
    return ApiResult.success(await this.dataService.findByUserId(user.id));
  }

  /** Get a UserNetwork record for the current user and given NetworkId value */
  @Get(":networkId")
  async getByNetworkId(@User() user: IUser, @Param("networkId") networkId: string, @Param("billingCategoryId") billingCategoryId: string): AsyncApiResult<UserNetwork> {
    const userNetwork = await this.dataService.findByUserAndNetwork(user.id, networkId, billingCategoryId);

    if (!userNetwork) {
      throw new NotFoundException(`No UserNetwork data was found for networkId="${networkId}"`);
    }

    return ApiResult.success(userNetwork);
  }

  /**
   * Adds a new UserNetwork.
   *
   * An HTTP 400 (Bad Request) response will be returned if a UserNetwork record already exists
   * matching with the current user's ID and the networkId given in the body
   */
  @Post()
  async addUserNetwork(
    @User() user: IUser,
    @Body() addRequest: AddUserNetworkRequest
  ): AsyncApiResult<UserNetwork> {

    const billingTier = await this.db.billingTier.findOne({ code: addRequest.billingTierCode });
    if (!billingTier) throw new NotFoundException(`Tier ${addRequest.billingTierCode} not found`);
    const billingCategory = await this.db.networkPriceBillingCategories.findOne({ code: addRequest.billingCategoryCode });
    if (!billingCategory) throw new NotFoundException(`Category ${addRequest.billingCategoryCode} not found`);

    const existingUserNetwork = await this.dataService.findByUserAndNetwork(user.id, addRequest.networkId, billingCategory._id);

    if (existingUserNetwork) {
      throw new BadRequestException(`A UserNetwork record exists for the current user with networkId=${addRequest.networkId}`);
    }

    if (addRequest.networkId !== NetworkId.POCKET) {
      if (billingTier.code !== BillingTierCode.Free)
        throw new BadRequestException("Network not allowed with out checkout process");
    }

    const userNetwork: UserNetwork = {
      userId: user.id,
      networkId: addRequest.networkId,
      billingCategory: billingCategory._id,
      billingTier: billingTier._id
    };

    const newUserNetwork = await this.dataService.addUserNetwork(userNetwork);
    return ApiResult.success(newUserNetwork);
  }
}