import { BillingAddressDto, CartSessionResponseDto, UserCartDto } from "@blockspaces/shared/dtos/cart";
import { NetworkOfferingDTO } from "@blockspaces/shared/dtos/network-catalog";
import { ApiResultStatus, ApiResultWithError } from "@blockspaces/shared/models/ApiResult";
import { CartError } from "@blockspaces/shared/models/cart";
import { getApiUrl } from "@platform/utils";
import axios from "axios"

export async function getCart(cartId: string): Promise<ApiResultWithError<UserCartDto, string>> {
  const { data: apiResult } = await axios.get<ApiResultWithError<UserCartDto, string>>(
    getApiUrl(`/cart/${cartId}`));
  if (apiResult.status === ApiResultStatus.Failed) {
    return ApiResultWithError.failure(apiResult.message);
  }
  return ApiResultWithError.success(apiResult.data);
}

export async function initCart(networkId: string, billingCategoryCode: string): Promise<ApiResultWithError<CartSessionResponseDto, string>> {
  const { data: apiResult } = await axios.post<ApiResultWithError<CartSessionResponseDto, string>>(
    getApiUrl(`/cart`), { networkId, billingCategoryCode }
  );
  if (apiResult.status === ApiResultStatus.Failed) {
    return ApiResultWithError.failure(apiResult.message);
  }

  return ApiResultWithError.success(apiResult.data);
}


export async function selectOffering(cartId: string, offering: NetworkOfferingDTO): Promise<ApiResultWithError<CartSessionResponseDto, string>> {
  const { data: apiResult } = await axios.post<ApiResultWithError<CartSessionResponseDto, string>>(
    getApiUrl(`/cart/${cartId}/add-items`), { items: [{ offerId: offering.id }] }
  );
  if (apiResult.status === ApiResultStatus.Failed) {
    1
    return ApiResultWithError.failure(apiResult.message);
  }

  return ApiResultWithError.success(apiResult.data);
}

export async function getCartPendingPayment(): Promise<ApiResultWithError<CartSessionResponseDto, string>> {
  const { data: apiResult } = await axios.get<ApiResultWithError<CartSessionResponseDto, string>>(
    getApiUrl(`/cart/pending-payment`));
  if (apiResult.status === ApiResultStatus.Failed) {
    return ApiResultWithError.failure(apiResult.message);
  }
  return ApiResultWithError.success(apiResult.data);
}

export async function submitBillingInfo(cartId: string, billingInfo: BillingAddressDto): Promise<ApiResultWithError<CartSessionResponseDto, string>> {
  const { data: apiResult } = await axios.post<ApiResultWithError<CartSessionResponseDto, string>>(
    getApiUrl(`/cart/${cartId}/add-billing-info`), { billingAddress: billingInfo }
  );
  if (apiResult.status === ApiResultStatus.Failed) {
    return ApiResultWithError.failure(apiResult.message);
  }
  return ApiResultWithError.success(apiResult.data);
}

export async function markCartPendingPayment(cartId: string) {
  const { data: apiResult } = await axios.post<ApiResultWithError<UserCartDto, string>>(
    getApiUrl(`/cart/${cartId}/mark-pending-payment`), undefined);
  if (apiResult.status === ApiResultStatus.Failed) {
    return ApiResultWithError.failure(apiResult.message);
  }
  return ApiResultWithError.success(apiResult.data);
}

export async function markCartWithPaymentError(cartId: string, cartError: CartError) {
  const { data: apiResult } = await axios.post<ApiResultWithError<UserCartDto, string>>(
    getApiUrl(`/cart/${cartId}/mark-cart-with-error`), { cartError });
  if (apiResult.status === ApiResultStatus.Failed) {
    return ApiResultWithError.failure(apiResult.message);
  }
  return ApiResultWithError.success(apiResult.data);
}

export async function confirmCartPendingItems(cartId: string, paymentToken: string): Promise<ApiResultWithError<any, string>> {
  const { data: apiResult } = await axios.post<ApiResultWithError<UserCartDto, string>>(
    getApiUrl(`/cart/${cartId}/confirm-pending-items`), { paymentToken });
  if (apiResult.status === ApiResultStatus.Failed) {
    return ApiResultWithError.failure(apiResult.message);
  }
  return ApiResultWithError.success(apiResult.data);
}

export async function attachPaymentMethod(paymentMethodId: string, cartId?: string): Promise<Boolean> {
  const result = await axios.post<{ paymentMethodId: string }, ApiResultWithError<Boolean>>(getApiUrl(`/cart/${cartId}/attach`), { paymentMethodId, cartId })
  return result.data as any
}