import { string } from "yargs";

/**
 * Create a new Account request Dto. Given Name is all that is needed to create a new customer in Quickbooks but all avaiable columns are supplied here.
 */
export class AccountCreateQuickbooksRequestDto {
  FullyQualifiedName?: string;
  Name: string;
  AccountType: string;
  Classification: string;
  AccountSubType: string;
}

/**
 * Save a QuickBooks account id in the `userdetails` collection.
 */
export class SaveAccountRequestDto {
  id: string;
}

/**
 * Create purchase obj in QuickBooks
 */
export class CreatePurchaseDto {
  expenseCategoryName: string;
  expenseCategoryId: string;
  amount: number;
  payment:any;
}

/** Quickbooks customer results. Full Quickbooks API results model. */
export class AccountQuickbooksDto {
  Account: {
    FullyQualifiedName: string;
    Domain: string;
    Name: string;
    Classification: string;
    AccountSubType: string;
    CurrencyRef: {
      Name: string;
      value: string;
    },
    CurrentBalanceWithSubAccounts: number;
    Sparse: boolean;
    MetaData: {
      CreateTime: string;
      LastUpdatedTime: string;
    },
    AccountType: string;
    CurrentBalance: number;
    Active: boolean;
    SyncToken: string;
    Id: string;
    SubAccount: boolean;
  };
  Time: string;
}

/** Quickbooks Accounts Array list. used for Account dropdown HTML elements. */
export interface AccountListQuickbooksDto {
  /** Quickbooks Account Id */
  id: string,
  /** Quickbooks Account Name */
  name: string
}