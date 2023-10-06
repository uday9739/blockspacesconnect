
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { useQuery } from "@tanstack/react-query"
import * as api from "../../api/integration-transport"
import { ErpObject } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { extractTenantId } from "@lightning/utils";

export const useListQuickbooksAccounts = (accountType: 'expense') => {
  const { data: user } = useGetCurrentUser()
  const shouldFetch = (user !== null && user?.qboCustomerId !== (null || undefined) && accountType !== null);
  return useQuery(
    ["QuickbooksAccounts", user?.activeTenant?.tenantId, accountType],
    () => api.listQuickbooksAccounts(accountType),
    {
      enabled: shouldFetch,
    }
  );
}

export const useCheckQuickBooksIntegrationForTenant = (currentTenantId?: string) => {
  const { data: user } = useGetCurrentUser()
  const tenantId = currentTenantId || user?.activeTenant?.tenantId
  return useQuery([`QuickBooksIntegrationStatus`, `${tenantId}`], () => api.checkQuickBooksIntegration(tenantId), { enabled: tenantId != null })
}

export const useListQuickbooksCustomers = () => {
  return useQuery([`QuickbooksCustomers`], api.listQuickbooksCustomers);
}

export const useGetQuickBooksInvoice = (tenantId: string, invoiceId: string) => {
  return useQuery([`QuickBooksInvoice`, `${tenantId}`, invoiceId], () => api.getQuickBooksInvoice(tenantId, invoiceId), { enabled: tenantId != null && invoiceId != null })
}

export const useGetErpInvoice = (tenantId: string, invoiceId: string, domain: string) => {
  return useQuery<ErpObject>([`ErpInvoice`, tenantId, invoiceId, domain], () => api.getErpInvoice(tenantId, invoiceId, domain), { enabled: tenantId != null && invoiceId != null && domain != null })
}

export const useIsCyclrEnabled = () => {
  const tenantId = extractTenantId()
  return useQuery<boolean>(["cyclr-enabled"], () => api.cyclrEnabledForUser(tenantId))
}