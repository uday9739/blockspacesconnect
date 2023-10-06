import { BadRequestException, Controller, Post, Query, Body, Param, HttpException, HttpStatus } from "@nestjs/common";
import { Get, Inject } from "@nestjs/common";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { BillingAddressDto, CartSessionResponseDto, UserCartDto, UserCartItemDto } from "@blockspaces/shared/dtos/cart";
import { User } from "../../users";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { CartService } from "../services/CartService";
import { ValidBody } from "../../validation";
import { IUser } from "@blockspaces/shared/models/users";
import { CartError } from "@blockspaces/shared/models/cart";
import { PaymentStorageService } from "../../connect-subscription/services/PaymentStorageService";
import { ConnectSubscriptionService } from "../../connect-subscription/services/ConnectSubscriptionService";



@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService, @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly connectSubscriptionService: ConnectSubscriptionService,
    private readonly paymentStorageService: PaymentStorageService
  ) {

    logger.setModule(this.constructor.name);
  }

  @Get("pending-payment")
  async getCartPendingPayment(@User() user: IUser): Promise<ApiResult<CartSessionResponseDto>> {
    return ApiResult.success(await this.cartService.getCartPendingPaymentByUserId(user.id));
  }

  @Get(":id")
  async getCart(@User() user: IUser, @Param("id") id: string): Promise<ApiResult<UserCartDto>> {

    return ApiResult.success(await this.cartService.getCartById(id));

  }

  @Post("")
  async initCartSessionForNetwork(@User() user: IUser, @Body("networkId") networkId: string, @Body("billingCategoryCode") billingCategoryCode: string): Promise<ApiResult<CartSessionResponseDto>> {

    return ApiResult.success(await this.cartService.initCartSessionForNetwork(user, networkId, billingCategoryCode));
  }

  @Post(":id/add-items")
  async addCartItem(@User() user: IUser, @Param("id") cartId: string, @ValidBody("items") items: UserCartItemDto[]): Promise<ApiResult<CartSessionResponseDto>> {
    return ApiResult.success(await this.cartService.addCartItem(user, cartId, items));
  }


  @Post(":id/add-billing-info")
  async addBillingInfo(@User() user: IUser, @Param("id") cartId: string, @Body("billingAddress") billingAddress: BillingAddressDto): Promise<ApiResult<CartSessionResponseDto>> {
    return ApiResult.success(await this.cartService.addBillingInfo(user, cartId, billingAddress));
  }

  @Post(":id/mark-pending-payment")
  async markCartPendingPayment(@User() user: IUser, @Param("id") cartId: string): Promise<ApiResult<UserCartDto>> {
    return ApiResult.success(await this.cartService.markCartPendingPayment(user, cartId));
  }

  @Post(":id/mark-cart-with-error")
  async markCartWithPaymentError(@User() user: IUser, @Param("id") cartId: string, @Body("cartError") cartError: CartError): Promise<ApiResult<UserCartDto>> {
    return ApiResult.success(await this.cartService.markCartWithPaymentError(user, cartId, cartError));
  }


  @Post(":id/confirm-pending-items")
  async confirmCartPendingItems(@User() user: IUser, @Param("id") cartId: string, @Body("paymentToken") paymentToken: string): Promise<ApiResult<UserCartDto>> {
    return ApiResult.success(await this.cartService.confirmCartPendingItems(user, cartId, paymentToken));
  }

  @Post(':id/attach')
  async attachPaymentMethod(@User() user: IUser, @Body("paymentMethodId") paymentMethodId: string, @Param("id") cartId: string) {

    const createSetupIntentResult = await this.paymentStorageService.createSetupIntent(user, paymentMethodId);

    if (createSetupIntentResult) {
      await this.connectSubscriptionService.setSubscriptionDefaultPaymentMethod(user, paymentMethodId);
      await this.cartService.markCartCheckoutComplete(cartId);

    }


    return ApiResult.success(true);
  }

}