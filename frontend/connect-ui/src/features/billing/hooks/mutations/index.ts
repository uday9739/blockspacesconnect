import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "../../api/index"
import { queryKeys } from "../queries";



export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { pmId: string }) => api.setDefaultPaymentMethod(args.pmId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries([queryKeys.paymentMethods], {})
    }
  });
}

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { pmId: string }) => api.deletePaymentMethod(args.pmId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries([queryKeys.paymentMethods], {})
    }
  });
}

export const useAttachPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { paymentMethodId: string, setAsDefault?: boolean }) => api.attachPaymentMethod(args.paymentMethodId, args.setAsDefault),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries([queryKeys.paymentMethods], {})
    }
  });
}

