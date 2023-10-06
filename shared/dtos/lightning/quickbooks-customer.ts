
/**
 * Create a new customer request Dto. Given Name is all that is needed to create a new customer in Quickbooks but all avaiable columns are supplied here.
 */
export class CustomerCreateQuickbooksRequestDto {
  FullyQualifiedName?: string;
  PrimaryEmailAddr?: {
    Address: string;
  };
  DisplayName?: string;
  Suffix?: string;
  Title?: string;
  MiddleName?: string;
  Notes?: string;
  FamilyName?: string;
  PrimaryPhone?: {
    FreeFormNumber?: string;
  };
  CompanyName?: string;
  BillAddr?: {
    CountrySubDivisionCode?: string;
    City?: string;
    PostalCode?: string;
    Line1?: string;
    Country?: string;
  };
  /** Required for Customer Creation in QUickbooks. */
  GivenName: string;
}

/**
 * Save a QuickBooks customer id in the `userdetails` collection.
 */
export class SaveCustomerRequestDto {
  id: string
}

/** Quickbooks customer results. Full Quickbooks API results model. */
export class CustomerQuickbooksDto {
  Customer: {
    Taxable: boolean;
    BillAddr: {
      Id: string;
      Line1: string;
      City: string;
      Country: string;
      CountrySubDivisionCode: string;
      PostalCode: string;
    };
    Notes: string;
    Job: boolean;
    BillWithParent: false;
    Balance: number;
    BalanceWithJobs: number;
    CurrencyRef: {
      value: string;
      name: string;
    };
    PreferredDeliveryMethod: string;
    IsProject: boolean;
    domain: string;
    sparse: boolean;
    Id: string;
    SyncToken: string;
    MetaData: {
      CreateTime: string;
      LastUpdatedTime: string;
    };
    Title: string;
    GivenName: string;
    MiddleName: string;
    FamilyName: string;
    Suffix: string;
    FullyQualifiedName: string;
    CompanyName: string;
    DisplayName: string;
    PrintOnCheckName: string;
    Active: boolean;
    PrimaryPhone: {
      FreeFormNumber: string;
    };
    PrimaryEmailAddr: {
      Address: string;
    };
    DefaultTaxCodeRef: {
      value: string;
    };
  };
  time: string;
}

/** Quickbooks customers Array list. used for Customer dropdown HTML elements. */
export interface CustomerListQuickbooksDto {
  /** Quickbooks Customer Id */
  id: string,
  /** Quickbooks Customer Given Name */
  givenName: string
}