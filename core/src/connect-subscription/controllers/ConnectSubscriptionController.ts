import { IUser } from "@blockspaces/shared/models/users";
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { ConnectSubscriptionService } from "../services/ConnectSubscriptionService";
import { User } from '../../users';
import { NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { UserDataService } from "../../users/services/UserDataService";
import { AdminOnly } from "../../auth/decorators/AdminOnly.decorator";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { BillingTier, BillingTierCode } from "@blockspaces/shared/models/network-catalog/Tier";
import { UserNetworkDataService } from "../../user-network/services/UserNetworkDataService";


@Controller('connect-subscription')
export class ConnectSubscriptionController {

  constructor(
    private readonly connectSubscriptionService: ConnectSubscriptionService,
    private readonly userDataService: UserDataService,
    private readonly userNetworkDataService: UserNetworkDataService) {
  }

  @Get('')
  async getSubscriptionForUser(@User() user: IUser) {
    const data = await this.connectSubscriptionService.getActiveSubscriptionForUserWithUserNetworkDetails(user.id);
    return ApiResult.success(data);
  }

  @Post('cancel/:networkId/:billingCategoryCode/:billingTierCode')
  async cancelSelectServicesByNetworkIdAndBillingCategory(@User() user: IUser,
    @Param("networkId") networkId: string,
    @Param("billingCategoryCode") billingCategoryCode: NetworkPriceBillingCodes,
    @Param("billingTierCode") billingTierCode: BillingTierCode) {

    if (billingTierCode === BillingTierCode.Free) {
      //
      const userNetworks = await this.userNetworkDataService.findByUserId(user.id);
      const userNetwork = userNetworks.find(x => x.networkId === networkId && (x.billingTier as BillingTier)?.code === BillingTierCode.Free && (x.billingCategory as NetworkPriceBillingCategory)?.code === billingCategoryCode);
      await this.userNetworkDataService.deleteUserNetwork(userNetwork?._id);
      user.connectedNetworks = user.connectedNetworks.filter(x => x !== networkId);
      await this.userDataService.update(user);

    } else {
      // get user subscription
      const subscription = await this.connectSubscriptionService.getActiveSubscriptionForUser(user.id);
      if (!subscription) throw new HttpException(`No Active subscription found for user`, HttpStatus.NOT_FOUND);
      // get billing category by code
      const results = await this.connectSubscriptionService.cancelSelectServicesByNetworkIdAndBillingCategory(user, subscription, networkId, billingCategoryCode);

      return ApiResult.success(results);
    }


  }

  @AdminOnly()
  @Post('user/:userId/cancel/:networkId/:billingCategoryCode')
  async cancelSelectServicesForUserByNetworkIdAndBillingCategory(@Param("userId") userId: string, @Param("networkId") networkId: string, @Param("billingCategoryCode") billingCategoryCode: NetworkPriceBillingCodes) {
    // get user subscription 
    const subscription = await this.connectSubscriptionService.getActiveSubscriptionForUser(userId);
    if (!subscription) throw new HttpException(`No Active subscription found for user`, HttpStatus.NOT_FOUND);
    // get billing category by code
    const user = await this.userDataService.getUserById(userId);
    const results = await this.connectSubscriptionService.cancelSelectServicesByNetworkIdAndBillingCategory(user, subscription, networkId, billingCategoryCode);
    return ApiResult.success(results);
  }



}