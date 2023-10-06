import { useQuery } from "@tanstack/react-query";
import { InvoiceReference, InvoiceStatus, OnchainInvoice, TypeOfInvoice } from "@blockspaces/shared/models/lightning/Invoice";
import { generateLightningQuote, generateOnchainQuote, getInvoiceStatus } from "@lightning/api";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { useState } from "react";
import { extractTenantId } from "@lightning/utils";

export const useInvoiceStatus = (offchainInvoiceId: string, onchainInvoiceId: string): { invoiceHook: ApiResult<{ offchain: InvoiceReference, onchain: OnchainInvoice }>; invoiceLoading: boolean; invoiceError: any; paid: boolean; typeOfInvoicePaid: TypeOfInvoice; refetch: any } => {
  const tenantId = extractTenantId()
  const [paid, setPaid] = useState(false);
  const [typeOfInvoicePaid, setTypeOfInvoicePaid] = useState<TypeOfInvoice>(null)
  const { data: invoiceHook, isLoading: invoiceLoading, error: invoiceError, refetch } = useQuery(["invoice", offchainInvoiceId, onchainInvoiceId], () => getInvoiceStatus(offchainInvoiceId, onchainInvoiceId, tenantId), {
    refetchInterval: 5000,
    retry: 3,
    retryDelay: 5000,
    enabled: (offchainInvoiceId !== null && offchainInvoiceId !== undefined && offchainInvoiceId !== "" && onchainInvoiceId !== null && onchainInvoiceId !== undefined && onchainInvoiceId !== ""),
    onSuccess: (data) => {
      if (data?.data?.onchain?.status === InvoiceStatus.PAID || data?.data?.offchain?.status === InvoiceStatus.PAID) {
        if (data?.data?.onchain?.status === InvoiceStatus.PAID) setTypeOfInvoicePaid("onchain")
        if (data?.data?.offchain?.status === InvoiceStatus.PAID) setTypeOfInvoicePaid("offchain")
        setPaid(true);
        
      }
    }
  });

  return { invoiceHook, invoiceLoading, invoiceError, paid, typeOfInvoicePaid, refetch };
};

export const useGenerateLightningQuote = (invoiceId: string) => {
  const tenantId = extractTenantId()
  return useQuery(
    ["generate-lightning-quote"],
    () => generateLightningQuote(invoiceId, 3600, tenantId),
    {
      enabled: invoiceId !== (null || undefined),
      refetchInterval: 10000
    }
  )
}

export const useGenerateOnchainQuote = (invoiceId: string) => {
  const tenantId = extractTenantId()
  return useQuery(
    ["generate-onchain-quote"],
    () => generateOnchainQuote(invoiceId, 3600, tenantId),
    {
      enabled: invoiceId !== (null || undefined),
      refetchInterval: 10000
    }
  )
}