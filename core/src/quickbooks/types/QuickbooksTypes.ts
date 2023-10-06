import exp from "constants";
import { DateTime } from "luxon/src/datetime";

/** The token object to be used when creation of the OAuth Client */
export type QuickbooksOAuthClientToken = {
  x_refresh_token_expires_in: number;
  refresh_token: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
  latency?: Date;
  realmId: string;
};

export type QuickbooksOauthClient = {
  clientId: string;
  clientSecret: string;
  environment: string;
  redirectUri: string;
  token?: QuickbooksOAuthClientToken;
};

//#region Billing
export interface QuickbooksBillCreate {
  Line: [
    {
      DetailType: string,
      Amount: number,
      Id: string,
      AccountBasedExpenseLineDetail: {
        AccountRef: {
          value: string
        }
      }
    }
  ],
  VendorRef: {
    value: string
  }
};

export interface QuickbooksBill {
  Bill: {
    SyncToken: string,
    domain: string,
    APAccountRef: {
      name: string,
      value: string
    },
    VendorRef: {
      name: string,
      value: string
    },
    TxnDate: string,
    TotalAmt: number,
    CurrencyRef: {
      name: string,
      value: string
    },
    LinkedTxn: [
      {
        TxnId: string,
        TxnType: string
      }
    ],
    SalesTermRef: {
      value: string
    },
    DueDate: string,
    sparse: boolean,
    Line: [
      {
        DetailType: string,
        Amount: number,
        Id: string,
        AccountBasedExpenseLineDetail: {
          TaxCodeRef: {
            value: string
          },
          AccountRef: {
            name: string,
            value: string
          },
          BillableStatus: string,
          CustomerRef: {
            name: string,
            value: string
          }
        },
        Description: string
      }
    ],
    Balance: number,
    Id: string,
    MetaData: {
      CreateTime: DateTime,
      LastUpdatedTime: DateTime
    }
  },
  time: DateTime
};

export interface QuickbooksBillUpdate {
  DocNumber: string,
  SyncToken: string,
  APAccountRef: {
    name: string,
    value: string
  },
  VendorRef: {
    name: string,
    value: string
  },
  TxnDate: string,
  TotalAmt: number,
  CurrencyRef: {
    name: string,
    value: string
  },
  PrivateNote: string,
  SalesTermRef: {
    value: string
  },
  DepartmentRef: {
    name: string
    value: string
  },
  DueDate: string,
  sparse: boolean,
  Line: [
    {
      DetailType: string,
      Amount: number,
      Id: string,
      AccountBasedExpenseLineDetail: {
        TaxCodeRef: {
          value: string
        },
        AccountRef: {
          name: string,
          value: string
        },
        BillableStatus: string,
        CustomerRef: {
          name: string,
          value: string
        },
        MarkupInfo: {
          Percent: number
        }
      },
      Description: string
    }
  ],
  Balance: number,
  Id: string,
  MetaData: {
    CreateTime: DateTime,
    LastUpdatedTime: DateTime
  }
};


//#endregion

// #region Customer

export type CustomerRef = {
  name: string; // Display Name, ie First Last
  value: string; // customerID
};

/** Returns the customer from Quickbooks. */
export interface QuickbooksCustomerUpdateRequest {
  PrimaryEmailAddr: {
    Address: string
  },
  DisplayName: string,
  PreferredDeliveryMethod: string,
  GivenName: string,
  FullyQualifiedName: string,
  BillWithParent: boolean,
  Job: boolean,
  BalanceWithJobs: number
  PrimaryPhone: {
    FreeFormNumber: string
  },
  Active: boolean,
  MetaData: {
    CreateTime: DateTime,
    LastUpdatedTime: DateTime
  },
  BillAddr: {
    City: string,
    Line1: string,
    PostalCode: string,
    Lat: string,
    Long: string,
    CountrySubDivisionCode: string,
    Id: string
  },
  MiddleName: string,
  Taxable: boolean,
  Balance: null,
  SyncToken: string,
  CompanyName: string,
  FamilyName: string,
  PrintOnCheckName: string,
  sparse: boolean,
  Id: string
}
// #endregion

// #region Sandbox Examples
export interface QuickbooksChargesResult {
  created: string;
  status: string;
  amount: string;
  currency: string;
  card: {
    number: string;
    name: string;
    address: {
      city: string;
      region: string;
      country: string;
      streetAddress: string;
      postalCode: string;
    };
    cardType: string;
    expMonth: string;
    expYear: string;
    cvc: string;
  };
  capture: boolean;
  avsStreet: string;
  avsZip: string;
  cardSecurityCodeMatch: string;
  id: string;
  context: {
    reconBatchID: string;
    mobile: boolean;
    paymentGroupingCode: string;
    txnAuthorizationStamp: string;
    paymentStatus: string;
    merchantAccountNumber: string;
    clientTransID: string;
    deviceInfo: {};
    recurring: boolean;
    isEcommerce: boolean;
  };
  authCode: string;
}
export interface QuickbooksUserInfoResults {
  sub?: string;
  email?: string;
  emailVerified?: boolean;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  address?: {
    streetAddress?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
} /** Model for update, display and create */
export interface QuickbooksCompanyInfo {
  /** Read Only Unique identifier for this object. Sort order is ASC by default. */
  Id: string;
  /** Required for update */
  SyncToken: string;
  domain: string;
  LegalAddr?: {
    Id: string;
    Line1: string;
    City: string;
    Country: string;
    CountrySubDivisionCode: string;
    PostalCode: string;
  };
  SupportedLanguages?: string;
  /** Required for update */
  CompanyName: string;
  Country?: string;
  /** Required for update */
  CompanyAddr: {
    Id: string;
    Line1: string;
    City: string;
    Country: string;
    CountrySubDivisionCode: string;
    PostalCode: string;
  };
  sparse?: boolean;
  WebAddr?: {
    URI?: string;
  };
  FiscalYearStartMonth?: string;
  CustomerCommunicationAddr?: {
    Id: string;
    Line1: string;
    City: string;
    Country: string;
    CountrySubDivisionCode: string;
    PostalCode: string;
  };
  PrimaryPhone?: {
    FreeFormNumber?: string;
  };
  LegalName?: string;
  /** read only system defined */
  CompanyStartDate: string;
  Email?: {
    Address?: string;
  };
  NameValue?: {};
  MetaData?: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  time?: string;
}
// #endregion

// #region Invoicing
/** Quickbooks invoice create object. */
export interface QuickbooksCreateInvoice {
  /** invoice line object */
  Line: QuickbooksInvoicingLineItem[];
  CustomerRef: {
    // Customer.Id
    value: string;
    // Customer.DisplayName
    name?: string;
  };

}

/** invoice status results */
export interface QuickbooksInvoiceStatus {
  balance: number;
  dueDate: Date;
  status: QuickbooksStatus;
}

/** invoice status's */
export enum QuickbooksStatus {
  "OPEN" = "open",
  "PAID" = "paid",
  "PASTDUE" = "past-due"
}

/** Invoice line item. each invoice needs at lest 1 line item */
export interface QuickbooksInvoicingLineItem {
  DetailType: string;
  Amount: number;
  SalesItemLineDetail?: {
    ItemRef: {
      name: string;
      value: string;
    };
  },
  Description?: string,
  DiscountLineDetail?: {
    PercentBased?: boolean,
    DiscountPercent?: number
  }
}
/** search result response when quering for quickbooks line items */
export interface QuickbooksLineItemResponse {
  startPosition: 1;
  Item: [
    {
      FullyQualifiedName: string;
      domain: string;
      Name: string;
      TrackQtyOnHand: false;
      Type: string;
      PurchaseCost: number;
      IncomeAccountRef: {
        name: string;
        value: string;
      };
      Taxable: boolean;
      MetaData: {
        CreateTime: string;
        LastUpdatedTime: string;
      };
      sparse: boolean;
      Active: boolean;
      SyncToken: string;
      UnitPrice: number;
      Id: string;
      Description: string;
      Sku: string;
    }
  ];
  maxResults: number;
}

/** invoice result object */
export interface QuickbooksInvoice {
  DocNumber: string;
  SyncToken: string;
  domain: string;
  Balance: number;
  BillAddr: {
    City: string;
    Line1: string;
    PostalCode: string;
    Lat: string;
    Long: string;
    CountrySubDivisionCode: string;
    Id: string;
  };
  TxnDate: string;
  TotalAmt: number;
  CustomerRef: {
    name: string;
    value: string;
  };
  ShipAddr: {
    City: string;
    Line1: string;
    PostalCode: string;
    Lat: string;
    Long: string;
    CountrySubDivisionCode: string;
    Id: string;
  };
  LinkedTxn: [];
  DueDate: string;
  PrintStatus: string;
  Deposit: string;
  sparse: boolean;
  EmailStatus: string;
  Line: [
    {
      LineNum: number;
      Amount: number;
      SalesItemLineDetail: {
        TaxCodeRef: {
          value: string;
        };
        ItemRef: {
          name: string;
          value: string;
        };
      };
      Id: string;
      DetailType: string;
    },
    {
      DetailType: string;
      Amount: number;
      SubTotalLineDetail: {};
    }
  ];
  ApplyTaxAfterDiscount: boolean;
  CustomField: [
    {
      DefinitionId: string;
      Type: string;
      Name: string;
    }
  ];
  Id: string;
  TxnTaxDetail: {
    TotalTax: number;
  };
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
}
// #endregion

// #region  PAYMENTS
export type QuickBooksPayment = {
  CustomerRef: {
    value: number;
  };
  PrivateNote?: string,
  TotalAmt: number;
  Line: [
    {
      Amount: number;
      LinkedTxn: [
        {
          TxnId: number;
          TxnType: string;
        }
      ];
    }
  ];
};
export type QuickBooksPaymentSummary = {
  TxnDate: string;
  TotalAmt: number;
  SyncToken: string;
  Line?: [
    {
      Amount: number;
      LinkedTxn?: [
        {
          TxnId: string;
          TxnType: string;
          TxnLineId?: string;
        }
      ];
    }
  ];
  CustomerRef: {
    name: string;
    value: string;
  };
  Id: string;
};
// #endregion

export interface CreateItem {
  Id?: string;
  Name: string;
  Sku?: string;
  QtyOnHand?: number;
  Type: 'Service';
  IncomeAccountRef: {
    value: string
  }
}
export interface CreateItemResponse {
  Item: {
    Id: string;
    Name: string;
    QtyOnHand?: number;
    Type: string;
    IncomeAccountRef: {
      value: string
    }
  }
}

export interface QuickbooksPurchase {
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

export interface QuickbooksCreatePurchase {
  AccountRef: {
    value: string;
  },
  PaymentType: string;
  Line: [
    {
      Amount: number;
      DetailType: string;
      AccountBasedExpenseLineDetail: {
        AccountRef: {
          value: string;
          name?: string;
        }
      }
    }
  ]
}