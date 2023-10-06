import { useQuery, useQueryClient } from "@tanstack/react-query"
import * as api from "../../api"

export const queryKeys = {
  paymentMethods: 'payment-methods',
  publishableKey: 'PublishableKey'
}
export const useGetPaymentMethods = () => {
  return useQuery([queryKeys.paymentMethods], () => api.listPaymentMethods());
}

export const useGetPublishableKey = () => {
  return useQuery([queryKeys.publishableKey], () => api.getPublishableKey(), { staleTime: Infinity });
}

export const useGetInvoicesForTenant = (page: number, take: number, sortByField: string, sortByFieldDirection: string) => {
  const queryClient = useQueryClient()
  return useQuery(["invoices-for-tenant", page, take, sortByField, sortByFieldDirection], () => api.getInvoicesForTenant(page, take, sortByField, sortByFieldDirection), {
    keepPreviousData: true,
    enabled: page >= 0 && take > 0,
    onSuccess: async data => {
      const invoices = data.data;
      for (const x of invoices) {
        queryClient.setQueryData(["invoice", x.id], x);
      }
    }
  });
};

export const useGetInvoice = (invoiceId: string) => {
  return useQuery(["invoice", invoiceId], () => api.getInvoiceDetails(invoiceId), {
    enabled: invoiceId !== null && invoiceId !== undefined
  });
}