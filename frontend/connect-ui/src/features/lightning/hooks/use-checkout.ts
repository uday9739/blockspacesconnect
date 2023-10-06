import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { InvoiceReference, OnchainInvoice, PaymentSource } from '@blockspaces/shared/models/lightning/Invoice';
import { QuickBooksInvoiceSummary } from "@blockspaces/shared/models/quickbooks";
import { useCheckQuickBooksIntegrationForTenant, useInvoiceStatus, useNodeDoc, useGenerateLightningQuote, useGenerateOnchainQuote, useIsCyclrEnabled } from "./queries";
import { useCreateInvoice, useCreateQuickBooksInvoice, useMakeQuickBooksPayment, useMakeQuickBooksUnappliedPayment } from "./mutations";
import { ErpMetadata } from "@blockspaces/shared/models/lightning/Integration";

// Need to refactor the bipInvoice logic for source: ERPInvoice

export const useCheckout = (source: PaymentSource) => {
  const router = useRouter()
  const {data: isCyclrEnabled} = useIsCyclrEnabled();
  const { nodeDoc } = useNodeDoc()
  // Lightning related MongoDB entries.
  const [invoice, setInvoice] = useState<{ onchain: OnchainInvoice, offchain: InvoiceReference }>(null);
  // QuickBooks invoice if `PaymentType` is set to QuickBooks
  const [qbInvoice, setQbInvoice] = useState<QuickBooksInvoiceSummary>(null)
  // State if the caller wants to cancel the quote generation interval.
  const [cancel, setCancel] = useState<boolean>(false);

  // Creates a regular invoice object with source of "pos". 
  const { data: bipInvoice, mutate: createBIPInvoice } = useCreateInvoice()
  // Creates a lightning quote.
  const { data: lightningQuote } = useGenerateLightningQuote(invoice?.offchain?.invoiceId)
  // Creates an onchain quote.
  const { data: onchainQuote } = useGenerateOnchainQuote(invoice?.onchain?.invoiceId)
  // Checks the invoice status for onchain and offchain.
  const { paid, typeOfInvoicePaid } = useInvoiceStatus(bipInvoice?.offchain?.invoiceId || invoice?.offchain?.invoiceId || "", bipInvoice?.onchain?.invoiceId || invoice?.onchain?.invoiceId || "")
  // Checks if the tenant is set up for QuickBooks integration.
  const { data: isQuickBooksSetupForTenant } = useCheckQuickBooksIntegrationForTenant(router?.query?.tenantId?.toString());
  // Creates a QuickBooks invoice, requires an invoice id from quickbooks.
  const { mutate: createQuickBooksInvoice, isSuccess: createQuickBooksInvoiceIsSuccess, data: createQuickBooksInvoiceResult } = useCreateQuickBooksInvoice();
  // Creates a sales receipt in QuickBooks.
  const { mutate: makeQuickBooksUnappliedPayment } = useMakeQuickBooksUnappliedPayment();
  // Marks a QuickBooks invoice as paid.
  const { mutate: makeQuickBooksPayment } = useMakeQuickBooksPayment();

  //#region handle paid
  useEffect(() => {
    if (!paid) return
    // If a user is not set up for cyclr, then we use legacy quickbooks integration.
    if (isCyclrEnabled) return
    // If the invoice has a balance of zero, do not call QuickBooks.
    if (createQuickBooksInvoiceResult?.markAsPaid) return
    markInvoiceAsPaid(invoice)
  }, [paid, isCyclrEnabled])
  //#endregion

  //#region handle bipInvoice
  useEffect(() => {
    if (!bipInvoice) return
    setInvoice(bipInvoice)
  }, [bipInvoice])
  //#endregion

  //#region handle createQuickBooksInvoiceResult
  useEffect(() => {
    if (!createQuickBooksInvoiceIsSuccess || !createQuickBooksInvoiceResult) return
    setInvoice({ onchain: createQuickBooksInvoiceResult.onchainInvoice, offchain: createQuickBooksInvoiceResult.lightningInvoice })
    setQbInvoice(createQuickBooksInvoiceResult.quickbooksInvoice)
  }, [createQuickBooksInvoiceResult, createQuickBooksInvoiceIsSuccess]);
  //#endregion

  // Checks the status is paid. If paid, set paid state as true which clears the
  // quote generation interval.
  const markInvoiceAsPaid = async (invoice: { onchain: OnchainInvoice, offchain: InvoiceReference }) => {
    const paidInvoice = typeOfInvoicePaid === "offchain" ? invoice.offchain : invoice.onchain

    if (isQuickBooksSetupForTenant && source === "pos" || source === "unknown") {
      makeQuickBooksUnappliedPayment({ tenantId: paidInvoice.tenantId, invoiceId: paidInvoice.invoiceId, type: typeOfInvoicePaid });
    } else if (isQuickBooksSetupForTenant && source === "legacy-qbo") {
      const erpId = typeOfInvoicePaid === "offchain" ? invoice.offchain.integrations[0].integrationId : invoice.onchain.erpMetadata[0].value
      makeQuickBooksPayment({ tenantId: paidInvoice.tenantId, invoiceId: erpId, type: typeOfInvoicePaid });
    }
  };

  // Create an invoice and generate the first quote.
  const getInvoice = async (amount: number, tenantId: string, erpId?: string, erpMetadata?: ErpMetadata[], source?: PaymentSource) => {
    if (amount <= 0) { setCancel(true); return }
    const memo = `${nodeDoc?.data?.nodeLabel} from BlockSpaces`;

    const createInvoiceArgs = { amount, memo, tenantId, erpMetadata, source }
    // If cyclr is enabled we assume we have the ERP Metadata
    if (isCyclrEnabled) {
      createBIPInvoice(createInvoiceArgs)
    } else {
      switch (source) {
        case "pos":
          // point of sale
          createBIPInvoice(createInvoiceArgs)
          break;
        // ERP invoice checkout
        case "legacy-qbo":
          createQuickBooksInvoice({ tenantId: tenantId, invoiceId: erpId });
          break;
        default:
          createBIPInvoice(createInvoiceArgs);
          break;
      }
    }

  };

  return { getInvoice, invoice, qbInvoice, lightningQuote, onchainQuote, paid, cancel, setCancel };
};

// Modal related query params to return if we close the <Checkout /> modal.
export const getCheckoutReturnQuery = (query: ParsedUrlQuery) => {
  switch (query.source) {
    case "pos" as PaymentSource:
      return { tenantId: query.tenantId, source: 'pos' as PaymentSource }
    case "erpinvoice" as PaymentSource:
      return { tenantId: query.tenantId, erpId: query.erpId, domain: query.domain, source: 'erpinvoice' as PaymentSource }
    case "legacy-qbo" as PaymentSource:
      return { tenantId: query.tenantId, erpId: query.erpId, source: "legacy-qbo" as PaymentSource }
    default:
      return
  }
}

// Query params if the invoice is paid.
export const getPaidReturnQuery = (query: ParsedUrlQuery) => {
  switch (query.source) {
    case "pos" as PaymentSource:
      return { tenantId: query.tenantId, modal: "pos-invoice-paid", domain: query.domain, source: 'pos' as PaymentSource }
    case "erpinvoice" as PaymentSource:
      return { tenantId: query.tenantId, erpId: query.erpId, modal: "pos-invoice-paid", domain: query.domain, source: 'erpinvoice' as PaymentSource }
    case "legacy-qbo" as PaymentSource:
      return { tenantId: query.tenantId, erpId: query.erpId, modal: "pos-invoice-paid", source: "legacy-qbo" as PaymentSource }
    default:
      return
  }
}
