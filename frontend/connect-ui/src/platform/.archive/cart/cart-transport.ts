import { BillingAddressDto, CartSessionResponseDto, UserCartDto } from "@blockspaces/shared/dtos/cart";
import { NetworkOfferingDTO } from "@blockspaces/shared/dtos/network-catalog/NetworkPrice";
import ApiResult, { ApiResultStatus, ApiResultWithError } from "@blockspaces/shared/models/ApiResult";
import { CartError } from "@blockspaces/shared/models/cart";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { getApiUrl } from "src/platform/utils";
import { BaseHttpTransport } from "../../transport/base-http-transport";


export class CartTransport extends BaseHttpTransport {
  static readonly instance: CartTransport = new CartTransport();


  async getCart(cartId: string): Promise<ApiResultWithError<UserCartDto, string>> {
    const { data: apiResult } = await this.httpService.get<ApiResultWithError<UserCartDto, string>>(
      getApiUrl(`/cart/${cartId}`), {
      validErrorStatuses: [HttpStatus.BAD_REQUEST]
    });
    if (apiResult.status === ApiResultStatus.Failed) {
      return ApiResultWithError.failure(apiResult.message);
    }
    return ApiResultWithError.success(apiResult.data);
  }

  async initCart(networkId: string): Promise<ApiResultWithError<CartSessionResponseDto, string>> {
    const { data: apiResult } = await this.httpService.post<ApiResultWithError<CartSessionResponseDto, string>>(
      getApiUrl(`/cart`), { networkId }, {
      validErrorStatuses: [HttpStatus.BAD_REQUEST]
    }
    );
    if (apiResult.status === ApiResultStatus.Failed) {
      return ApiResultWithError.failure(apiResult.message);
    }

    return ApiResultWithError.success(apiResult.data);
  }


  async selectOffering(cartId: string, offering: NetworkOfferingDTO): Promise<ApiResultWithError<CartSessionResponseDto, string>> {
    const { data: apiResult } = await this.httpService.post<ApiResultWithError<CartSessionResponseDto, string>>(
      getApiUrl(`/cart/${cartId}/add-items`), { items: [{ offerId: offering.id }] }, {
      validErrorStatuses: [HttpStatus.BAD_REQUEST]
    }
    );
    if (apiResult.status === ApiResultStatus.Failed) {
      1
      return ApiResultWithError.failure(apiResult.message);
    }

    return ApiResultWithError.success(apiResult.data);
  }

  async getCartPendingPayment(): Promise<ApiResultWithError<CartSessionResponseDto, string>> {
    const { data: apiResult } = await this.httpService.get<ApiResultWithError<CartSessionResponseDto, string>>(
      getApiUrl(`/cart/pending-payment`), {
      validErrorStatuses: [HttpStatus.BAD_REQUEST]
    });
    if (apiResult.status === ApiResultStatus.Failed) {
      return ApiResultWithError.failure(apiResult.message);
    }
    return ApiResultWithError.success(apiResult.data);
  }

  async submitBillingInfo(cartId: string, billingInfo: BillingAddressDto): Promise<ApiResultWithError<CartSessionResponseDto, string>> {
    const { data: apiResult } = await this.httpService.post<ApiResultWithError<CartSessionResponseDto, string>>(
      getApiUrl(`/cart/${cartId}/add-billing-info`), { billingAddress: billingInfo }, {
      validErrorStatuses: [HttpStatus.BAD_REQUEST]
    }
    );
    if (apiResult.status === ApiResultStatus.Failed) {
      return ApiResultWithError.failure(apiResult.message);
    }
    return ApiResultWithError.success(apiResult.data);
  }

  async markCartPendingPayment(cartId: string) {
    const { data: apiResult } = await this.httpService.post<ApiResultWithError<CartSessionResponseDto, string>>(
      getApiUrl(`/cart/${cartId}/mark-pending-payment`), undefined, {
      validErrorStatuses: [HttpStatus.BAD_REQUEST]
    });
    if (apiResult.status === ApiResultStatus.Failed) {
      return ApiResultWithError.failure(apiResult.message);
    }
    return ApiResultWithError.success(apiResult.data);
  }

  async markCartWithPaymentError(cartId: string, cartError: CartError) {
    const { data: apiResult } = await this.httpService.post<ApiResultWithError<CartSessionResponseDto, string>>(
      getApiUrl(`/cart/${cartId}/mark-cart-with-error`), { cartError }, {
        validErrorStatuses: [HttpStatus.BAD_REQUEST]
      });
    if (apiResult.status === ApiResultStatus.Failed) {
      return ApiResultWithError.failure(apiResult.message);
    }
    return ApiResultWithError.success(apiResult.data);
  }

  async confirmCartPendingItems(cartId: string, paymentToken: string) {
    const { data: apiResult } = await this.httpService.post<ApiResultWithError<UserCartDto, string>>(
      getApiUrl(`/cart/${cartId}/confirm-pending-items`), { paymentToken }, {
      validErrorStatuses: [HttpStatus.BAD_REQUEST]
    });
    if (apiResult.status === ApiResultStatus.Failed) {
      return ApiResultWithError.failure(apiResult.message);
    }
    return ApiResultWithError.success(apiResult.data);
  }
}
