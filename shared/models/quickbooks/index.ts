// Only model that is shared outside of CORE.
export type QuickBooksInvoiceSummary = {
  AllowIPNPayment: boolean;
  AllowOnlinePayment: boolean;
  AllowOnlineCreditCardPayment: boolean;
  AllowOnlineACHPayment: boolean;
  domain: string;
  sparse: boolean;
  Id: string;
  SyncToken: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  CustomField: [];
  DocNumber: string;
  TxnDate: string;
  CurrencyRef: { value: string; name: string };
  LinkedTxn: [];
  Line: [];
  TxnTaxDetail: {
    TxnTaxCodeRef: { value: string };
    TotalTax: number;
    TaxLine: [Object];
  };
  CustomerRef: { value: string; name: string };
  CustomerMemo: { value: string };
  SalesTermRef: { value: string; name: string };
  DueDate: string;
  TotalAmt: number;
  ApplyTaxAfterDiscount: boolean;
  PrintStatus: string;
  EmailStatus: string;
  BillEmail: { Address: string };
  Balance: number;
  DeliveryInfo: { DeliveryType: string; DeliveryTime: string };
};

