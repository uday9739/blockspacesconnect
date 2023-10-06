import { IsArray, IsBoolean, IsDate, IsEnum, IsJSON, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, Matches } from "class-validator";
import { ErpAccount, ErpAccountType, ErpAccountTypes } from "../../models/erp-integration/ErpAccount";
import { ErpInvoice } from "../../models/erp-integration/ErpInvoice";
import { Domain, Metadata, ErpObjectStatuses, ErpObjectStatus, domains } from "../../models/erp-integration/ErpObjects";
import { DepositAccount, ErpPayment } from "../../models/erp-integration/ErpPayment";
import { ErpSalesReceipt, LineItem, TaxLine } from "../../models/erp-integration/ErpSalesReceipt";
import { SupportedCurrencies } from "../../models/lightning/Currencies";
import { IsGreaterOrEqualTo } from "../../validation/decorators";

export class ErpObjectDto implements Partial<Metadata> {
  @IsString()
  @IsNotEmpty()
  @Matches(`^${domains.join('|')}$`, 'i') // Domain, ignore casing
  domain: Domain;
  @IsString()
  @IsNotEmpty()
  externalId: string;
  @IsString()
  @IsNotEmpty()
  jsonBlob: string;
}

export class ErpSalesReceiptDto extends ErpObjectDto implements ErpSalesReceipt {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  totalAmount: number;

  @IsString()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  @IsNotEmpty()
  currencyCode: String;

  @IsOptional()
  @IsArray()
  lines?: LineItem[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsEnum(ErpObjectStatuses)
  @IsNotEmpty()
  status: ErpObjectStatus;

  @IsOptional()
  @IsObject()
  taxLine?: TaxLine;
}
export class ErpPaymentDto extends ErpObjectDto implements ErpPayment {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  totalAmount: number;

  @IsString()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  @IsNotEmpty()
  currencyCode: String;

  @IsString()
  @IsEnum(ErpObjectStatuses)
  @IsNotEmpty()
  status: ErpObjectStatus;

  @IsOptional()
  @IsObject()
  depositAccount?: DepositAccount;

  @IsOptional()
  @IsNumber()
  unappliedAmount?: number;

  @IsOptional()
  @IsDate()
  transactionDate?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ErpAccountDto extends ErpObjectDto implements ErpAccount {
  @IsString() 
  @IsNotEmpty() 
  accountType: ErpAccountType;

  @IsString()
  @IsNotEmpty()
  fullyQualifiedName: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  active: boolean;

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  jsonBlob: string;
}

export class ErpInvoiceDto extends ErpObjectDto implements ErpInvoice {
  @IsString() 
  @IsEnum(ErpAccountTypes)
  @IsNotEmpty() 
  txnDate: ErpAccountType;

  @IsString()
  @IsEnum(ErpObjectStatuses)
  @IsNotEmpty()
  status: ErpObjectStatus;

  @IsString()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  @IsNotEmpty()
  currencyCode: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  totalAmt: number;

  @IsOptional()
  @IsDate()
  dueDate?: string;

  @IsOptional()
  @IsObject()
  taxLine?: TaxLine;

  @IsOptional()
  @IsArray()
  lines?: LineItem[];

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  jsonBlob: string;
}