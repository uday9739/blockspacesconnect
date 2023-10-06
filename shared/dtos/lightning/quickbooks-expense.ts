/** Quickbooks customer results. Full Quickbooks API results model. */
export class PurchaseQuickbooksDto {
  Purchase: {
    AccountRef: {
      value: string;
      name: string;
    },
    PaymentType: string;
    TotalAmt: string;
    PurchaseEx: {
      any: any[];
    },
    Domain: string;
    Sparse: boolean;
    Name: string;
    Id: string;
    SyncToken: string;
    Classification: string;
    AccountSubType: string;
    MetaData: {
      CreateTime: string;
      LastUpdatedTime: string;
    },
    TxnDate: string;
    CurrencyRef: {
      Name: string;
      value: string;
    },
    Line: [
      {
        Id: string;
        Amount: number;
        AccountBasedExpenseLineDetail: {
          AccountRef: {
            value: string;
            name: string;
          },
          BillableStatus: string;
          TaxCodeRef: {
            value: string;
          }
        }
      }
    ]
    CurrentBalanceWithSubAccounts: number;
    AccountType: string;
    CurrentBalance: number;
    Active: boolean;
    SubAccount: boolean;
  };
  Time: string;
}
