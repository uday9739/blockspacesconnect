import { CreateQuickBooksInvoice, PaymentQuickBooksDto } from "@blockspaces/shared/dtos/lightning"
import { AccountCreateQuickbooksRequestDto, CreatePurchaseDto } from "@blockspaces/shared/dtos/lightning/quickbooks-account"
import { CustomerCreateQuickbooksRequestDto, SaveCustomerRequestDto } from "@blockspaces/shared/dtos/lightning/quickbooks-customer"
import { useGetCurrentUser, useGetUserProfile } from "@src/platform/hooks/user/queries"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "../../api/integration-transport"


export const useCreatePurchase = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: CreatePurchaseDto) => api.createPurchase(args),
    onSuccess: () => queryClient.invalidateQueries(["refresh-invoices"])
  })
}

export const useStoreQuickBooksCredentials = () => {
  return useMutation({
    mutationFn: (args: { url: string, realmId: string, state: string }) => api.storeQuickBooksCredentials(args.url, args.realmId, args.state),
  });
}

export const useCreateQuickBooksBillingAccount = () => {
  return useMutation({
    mutationFn: (args: { Name: string, AccountType: string, Classification: string, AccountSubType: string, FullyQualifiedName?: string }) =>
      api.createQuickBooksBillingAccount({
        FullyQualifiedName: args.FullyQualifiedName,
        Name: args.Name,
        AccountType: args.AccountType,
        Classification: args.Classification,
        AccountSubType: args.AccountSubType
      })
  });
}

export const useSaveQboCustomerId = () => {
  return useMutation({
    mutationFn: (args: SaveCustomerRequestDto) => api.saveCustomerId(args)
  });
}

export const useCreateQuickbooksCustomer = () => {
  const queryClient = useQueryClient()
  const {data:user} = useGetCurrentUser()
  return useMutation({
    mutationFn: (args: CustomerCreateQuickbooksRequestDto) => api.createQuickbooksCustomer(args),
    onSuccess: async () => queryClient.invalidateQueries([`QuickBooksIntegrationStatus`, `${user?.activeTenant}`])
  });
}

export const useCreateQuickBooksInvoice = () => {
  return useMutation({
    mutationFn: (args: CreateQuickBooksInvoice) => api.createQuickBooksInvoice(args)
  });
}

export const useMakeQuickBooksUnappliedPayment = () => {
  return useMutation({
    mutationFn: (args: PaymentQuickBooksDto) => api.makeQuickBooksUnappliedPayment(args)
  });
}

export const useMakeQuickBooksPayment = () => {
  return useMutation({
    mutationFn: (args: PaymentQuickBooksDto) => api.makeQuickBooksPayment(args)
  });
}

