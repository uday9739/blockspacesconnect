import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInvoice, payBolt11Invoice } from "@lightning/api";
import { InvoiceReference, OnchainInvoice, PaymentSource } from "@blockspaces/shared/models/lightning/Invoice";
import { ErpMetadata } from "@blockspaces/shared/models/lightning/Integration";
import { useNodeDoc } from "../queries";

type UseCreateInvoiceArgs = { amount: number; memo: string; tenantId: string; currency?: string, erpId?: string, erpMetadata?: ErpMetadata[], source?: PaymentSource };
export const useCreateInvoice = () => {
  return useMutation<{onchain: OnchainInvoice, offchain: InvoiceReference}, any, UseCreateInvoiceArgs, any>(
    (args: UseCreateInvoiceArgs) => createInvoice(args.amount, args.memo, args.tenantId, args.currency, args.erpId, args.erpMetadata, args.source ?? 'unknown')
  );
};

export const usePayBolt11Invoice = () => {
  const {nodeDoc} = useNodeDoc()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { apiEndpoint, payReq }) => payBolt11Invoice(args.apiEndpoint, args.payReq, 1, nodeDoc?.data?.cert, nodeDoc?.data?.nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries(["node-balance", nodeDoc?.data?.tenantId])
    }
  })
}