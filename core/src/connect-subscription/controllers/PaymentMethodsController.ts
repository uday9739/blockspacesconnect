import { IUser } from "@blockspaces/shared/models/users";
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ConnectSubscriptionService } from "../services/ConnectSubscriptionService";
import { User } from '../../users';
import { NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { UserDataService } from "../../users/services/UserDataService";
import { AdminOnly } from "../../auth/decorators/AdminOnly.decorator";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { PaymentStorageService } from "../services/PaymentStorageService";
import { BillingTier, BillingTierCode } from "@blockspaces/shared/models/network-catalog/Tier";
import { UserNetworkDataService } from "../../user-network/services/UserNetworkDataService";
import { TenantResourceGuard } from "../../authorization/guards/TenantResourceGuard";


@Controller('payment-methods')
export class PaymentMethodsController {

  constructor(
    private readonly connectSubscriptionService: ConnectSubscriptionService,
    private readonly paymentStorageService: PaymentStorageService) {
  }

  //#region Payment Methods 
  @Put(':paymentMethodId')
  @UseGuards(TenantResourceGuard)
  async setDefaultPaymentMethod(@User() user: IUser, @Param("paymentMethodId") paymentMethodId: string) {
    return ApiResult.success(await this.connectSubscriptionService.setSubscriptionDefaultPaymentMethod(user, paymentMethodId));
  }

  @Post(':paymentMethodId')
  @UseGuards(TenantResourceGuard)
  async attachPaymentMethod(@User() user: IUser, @Param("paymentMethodId") paymentMethodId: string, @Query("setAsDefault") setAsDefault: boolean) {

    const createSetupIntentResult = await this.paymentStorageService.createSetupIntent(user, paymentMethodId);

    if (createSetupIntentResult && setAsDefault) {
      await this.connectSubscriptionService.setSubscriptionDefaultPaymentMethod(user, paymentMethodId);
    }
    return ApiResult.success(true);
  }

  @Get('publishable-key')
  @UseGuards(TenantResourceGuard)
  async getPublishableKey() {
    return ApiResult.success(this.paymentStorageService.getPublishableKey());
  }

  @Get()
  @UseGuards(TenantResourceGuard)
  async getPaymentInfo(@User() user: IUser) {
    const subscription = await this.connectSubscriptionService.getActiveSubscriptionForUser(user.id);
    return ApiResult.success(await this.paymentStorageService.getCreditCardsOnFileForSubscription(user, subscription));
  }

  @Delete('payment-methods/:paymentMethodId')
  @UseGuards(TenantResourceGuard)
  async removePaymentMethod(@User() user: IUser, @Param("paymentMethodId") paymentMethodId: string) {
    return ApiResult.success(await this.paymentStorageService.removePaymentMethod(user, paymentMethodId));
  }
  //#endregion

}