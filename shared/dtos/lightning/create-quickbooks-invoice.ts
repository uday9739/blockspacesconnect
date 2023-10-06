import { InvoiceReference, OnchainInvoice } from "../../models/lightning/Invoice";
import { QuickBooksInvoiceSummary } from "../../models/quickbooks";

export class CreateQuickBooksInvoice {
    tenantId: string;
    invoiceId: string;
}

export class CreateQuickBooksInvoiceResponseDto {
    lightningInvoice: InvoiceReference;
    onchainInvoice: OnchainInvoice;
    quickbooksInvoice: QuickBooksInvoiceSummary;
    markAsPaid: boolean
}