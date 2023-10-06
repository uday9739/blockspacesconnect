import { useQuery, useQueryClient } from "@tanstack/react-query"
import * as api from "@platform/api/cart"
import { CartSessionResponseDto } from "@blockspaces/shared/dtos/cart"
import { CartStatus } from "@blockspaces/shared/models/cart"
import { getCartDetails } from "../mutations"
import { userQueryKeys } from "../../user/queries"

export const useCartPollingProcessingPayment = () => {
  const cart = getCartDetails();
  const shouldFetch = cart?.cart?.status === CartStatus.PENDING_PROCESSING_PAYMENT;
  const queryClient = useQueryClient()
  return useQuery(["get-cart", cart?.cart?.id], () => api.getCart(cart?.cart?.id), {
    refetchInterval: 1000,
    enabled: shouldFetch,
    onSuccess: async data => {
      if (data.data.status === CartStatus.CHECKOUT_COMPLETE || data.data.status === CartStatus.ERROR_GATEWAY_ERROR) {
        await queryClient.invalidateQueries({ queryKey: [userQueryKeys.currentUser] })
        await queryClient.invalidateQueries({ queryKey: [userQueryKeys.userNetworks] })
        await queryClient.invalidateQueries({ queryKey: [userQueryKeys.connectSubscription] })
        await queryClient.invalidateQueries(["cart-session"])
        await queryClient.setQueryData(["cart-pending-payments"], null)
        queryClient.setQueryData(
          ['cart-session'],
          (oldData: CartSessionResponseDto) => oldData ? {
            ...oldData,
            cart: {
              ...oldData.cart,
              status: data.data.status
            }
          } : oldData
        )
      }
    }
  })
}

export const useCartPendingPayments = () => {
  const queryClient = useQueryClient()
  return useQuery(["cart-pending-payments"], () => api.getCartPendingPayment(), {
    onSuccess(data) {
      if (data?.data)
        queryClient.setQueryData(["cart-session"], data.data);
    },
  })
}

export const getPendingPaymentMessage = () => {
  const queryClient = useQueryClient()
  const session = queryClient.getQueryData<CartSessionResponseDto>(["cart-session"])
  let message: string = null
  if (session?.cart.status === CartStatus.PENDING_PROCESSING_PAYMENT) {
    message = "Processing CC ..."
  }
  return message
}