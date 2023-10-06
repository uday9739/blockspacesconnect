import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@platform/api/cart";
import { NetworkOfferingDTO } from "@blockspaces/shared/dtos/network-catalog";
import { BillingAddressDto, CartSessionResponseDto } from "@blockspaces/shared/dtos/cart";
import { CartError, CartStatus } from "@blockspaces/shared/models/cart";
import { userQueryKeys } from "../../user/queries";

export type InitCartArgs = { networkId: string, billingCategoryCode: string }
export const useInitCart = () => {
  const queryClient = useQueryClient();
  const initCart = useMutation({
    mutationKey: ["cart-session"],
    mutationFn: (args: InitCartArgs) => api.initCart(args.networkId, args.billingCategoryCode),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart-session"] });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart-session"], data.data);
    }
  });

  return initCart;
};

export const getCartDetails = (): CartSessionResponseDto => {
  const client = useQueryClient();
  const init: CartSessionResponseDto = client.getQueryData(["cart-session"]);
  return init;
};

type UseSelectOfferingArgs = { cartId: string; offering: NetworkOfferingDTO };
export const useSelectOffering = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: UseSelectOfferingArgs) => api.selectOffering(args.cartId, args.offering),
    onSuccess: async (data) => {
      queryClient.setQueryData(["cart-session"], data.data)
      if (data.data.cart.status === CartStatus.CHECKOUT_COMPLETE) {
        await queryClient.invalidateQueries({ queryKey: [userQueryKeys.currentUser] })
        await queryClient.invalidateQueries({ queryKey: [userQueryKeys.userNetworks] })
        await queryClient.invalidateQueries({ queryKey: [userQueryKeys.connectSubscription] })
      }
    },
    onSettled: async () => await queryClient.invalidateQueries({ queryKey: ["cart-session"] })
  });
};

type UseSubmitBillingInfoArgs = { cartId: string; billingInfo: BillingAddressDto };
export const useSubmitBillingInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: UseSubmitBillingInfoArgs) => api.submitBillingInfo(args.cartId, args.billingInfo),
    onSuccess: (data) => { queryClient.setQueryData(["cart-session"], data.data); },
    onSettled: async () => await queryClient.invalidateQueries({ queryKey: ["cart-session"] }),
  });
};

export const useMarkCartPendingPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cartId: string) => api.markCartPendingPayment(cartId),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries(["get-cart", data?.data?.id]);
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
    },
  });
};

type UseMarkCartWithPaymentErrorArgs = { cartId: string; cartError: CartError };
export const useMarkCartWithPaymentError = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: UseMarkCartWithPaymentErrorArgs) => api.markCartWithPaymentError(args.cartId, args.cartError),
    onSuccess: async (data) => {
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
      await queryClient.invalidateQueries(["get-cart", data?.data?.id]);
    }
  });
};

type UseConfirmCartPendingItemsArgs = { cartId: string; paymentToken: string };
export const useConfirmCartPendingItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: UseConfirmCartPendingItemsArgs) => api.confirmCartPendingItems(args.cartId, args.paymentToken),
    onSuccess: async (data) => {
      await queryClient.setQueryData(["cart-session"], data.data);

      if (data.data._doc.status === CartStatus.CHECKOUT_COMPLETE) {
        queryClient.removeQueries({ queryKey: ["cart-session"] })
        await queryClient.invalidateQueries({ queryKey: [userQueryKeys.currentUser] })
        await queryClient.invalidateQueries({ queryKey: [userQueryKeys.userNetworks] })
        await queryClient.invalidateQueries({ queryKey: [userQueryKeys.connectSubscription] })
      }
    },
    onSettled: async () => await queryClient.invalidateQueries({ queryKey: ["cart-session"] })
  });
};

export const useResetCart = () => {
  const queryClient = useQueryClient();
  return queryClient.cancelQueries({ queryKey: ["cart-session"] });
};




export const useAttachPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { paymentMethodId: string, cartId: string }) => api.attachPaymentMethod(args.paymentMethodId, args.cartId),
    onSuccess: async (data, variables, context) => {
      // queryClient.removeQueries({ queryKey: ["cart-session"] })
      await queryClient.invalidateQueries({ queryKey: [userQueryKeys.currentUser] })
      await queryClient.invalidateQueries({ queryKey: [userQueryKeys.userNetworks] })
      await queryClient.invalidateQueries({ queryKey: [userQueryKeys.connectSubscription] })
    }
  });
}
