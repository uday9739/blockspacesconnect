import { TypeOfInvoice } from "../../models/lightning/Invoice";

export class PaymentQuickBooksDto {
    /** not logged in tenant who receiving payment.*/
    tenantId: string;
    invoiceId: string;
    type: TypeOfInvoice
}