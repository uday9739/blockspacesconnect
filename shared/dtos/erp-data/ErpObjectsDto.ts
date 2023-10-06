import { IsArray, IsBoolean, IsISO8601, IsEnum, IsJSON, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, Matches } from "class-validator";
import { ErpAccount, ErpAccountType, ErpAccountTypes } from "../../models/erp-integration/ErpAccount";
import { ErpInvoice } from "../../models/erp-integration/ErpInvoice";
import { Domain, Metadata, ErpObjectStatuses, ErpObjectStatus, domains, ErpObjectType, ErpObjectTypes } from "../../models/erp-integration/ErpObjects";
import { DepositAccount, ErpPayment } from "../../models/erp-integration/ErpPayment";
import { ErpSalesReceipt, LineItem, TaxLine } from "../../models/erp-integration/ErpSalesReceipt";
import { SupportedCurrencies } from "../../models/lightning/Currencies";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import ApiResult, { ApiResultStatus } from "../../models/ApiResult";
import { ErpPurchase, ExpenseCategory } from "../../models/erp-integration/ErpPurchase";

export class ErpObjectDto implements Partial<Metadata> {
  @IsString()
  @IsNotEmpty()
  @Matches(`^${domains.join('|')}$`, 'i', {
    message: `domain must be one of the following: ${domains}`
  }) // Domains, ignore casing
  @ApiProperty({enum: domains})
  domain: Domain;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  externalId: string;

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  @ApiProperty({default: '{"erp": "jsonblob"}'})
  jsonBlob: string;
}

export class ErpSalesReceiptResultDto extends ApiResult<ErpSalesReceipt> {
  @IsString()
  @IsEnum([ApiResultStatus.Success, ApiResultStatus.Failed])
  @IsNotEmpty()
  @ApiProperty({enum: [ApiResultStatus.Success, ApiResultStatus.Failed]})
  status: ApiResultStatus;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty({description: "Sales Receipt Data", default: ErpSalesReceipt})
  paymentData: ErpSalesReceipt;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({description: "Type of ErpObject", default: "SalesReceipt"})
  objectType: ErpObjectType

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  @ApiProperty({default: '{"erp": "jsonblob"}'})
  jsonBlob: string;
}
export class ErpSalesReceiptDto extends ErpObjectDto implements ErpSalesReceipt {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({minimum: 0.01, default: 1.15})
  totalAmount: number;

  @IsString()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i', {
    message: `supportedCurrencies must be one of the following: ${SupportedCurrencies}`
  }) // Supported currencies, ignore casing
  @IsNotEmpty()
  @ApiProperty({enum: SupportedCurrencies})
  currencyCode: String;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({type: [LineItem]})
  lines?: LineItem[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @Matches(`^${ErpObjectStatuses.join('|')}$`, 'i', {
    message: `status must be one of the following: ${ErpObjectStatuses}`
  }) // ObjectStatuses, ignore casing
  @IsNotEmpty()
  @ApiProperty({enum: ErpObjectStatuses})
  status: ErpObjectStatus;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({type: TaxLine})
  taxLine?: TaxLine;
}
export class UpdateErpSalesReceiptDto extends PartialType(ErpSalesReceiptDto) { }

export class ErpPaymentResultDto extends ApiResult<ErpPayment> {
  @IsString()
  @IsEnum([ApiResultStatus.Success, ApiResultStatus.Failed])
  @IsNotEmpty()
  @ApiProperty({enum: [ApiResultStatus.Success, ApiResultStatus.Failed]})
  status: ApiResultStatus;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty({description: "Payment Data", default: ErpPayment})
  paymentData: ErpPayment;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({description: "Type of ErpObject", default: "Payment"})
  objectType: ErpObjectType

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  @ApiProperty({default: '{"erp": "jsonblob"}'})
  jsonBlob: string;
}
export class ErpPaymentDto extends ErpObjectDto implements ErpPayment {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({minimum: 0.01, default: 1.15})
  totalAmount: number;

  @IsString()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i', {
    message: `supportedCurrencies must be one of the following: ${SupportedCurrencies}`
  }) // Supported currencies, ignore casing
  @IsNotEmpty()
  @ApiProperty({enum: SupportedCurrencies})
  currencyCode: String;

  @IsString()
  @Matches(`^${ErpObjectStatuses.join('|')}$`, 'i', {
    message: `status must be one of the following: ${ErpObjectStatuses}` 
  }) // ObjectStatuses, ignore casing
  @IsNotEmpty()
  @ApiProperty({enum: ErpObjectStatuses})
  status: ErpObjectStatus;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({type: DepositAccount})
  depositAccount?: DepositAccount;

  @IsOptional()
  @IsISO8601()
  @ApiPropertyOptional({type: 'string', format: 'date-like', default: new Date().toISOString()})
  transactionDate?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;
}

export class ErpPurchaseDto extends ErpObjectDto implements ErpPurchase {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({minimum: 0.01, default: 1.15})
  totalAmount: number;

  @IsString()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i', {
    message: `supportedCurrencies must be one of the following: ${SupportedCurrencies}`
  }) // Supported currencies, ignore casing
  @IsNotEmpty()
  @ApiProperty({enum: SupportedCurrencies})
  currencyCode: String;

  @IsString()
  @Matches(`^${ErpObjectStatuses.join('|')}$`, 'i', {
    message: `status must be one of the following: ${ErpObjectStatuses}` 
  }) // ObjectStatuses, ignore casing
  @IsNotEmpty()
  @ApiProperty({enum: ErpObjectStatuses})
  status: ErpObjectStatus;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({type: ExpenseCategory})
  expenseCategory?: ExpenseCategory;

  @IsOptional()
  @IsISO8601()
  @ApiPropertyOptional({type: 'string', format: 'date-like', default: new Date().toISOString()})
  transactionDate?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string; 
}

export class UpdateErpPaymentDto extends PartialType(ErpPaymentDto) { }

export class ErpAccountDto extends ErpObjectDto implements ErpAccount {

  @IsString()
  @IsNotEmpty()
  @Matches(`^${ErpAccountTypes.join('|')}$`, 'i', {
    message: `accountType must be one of the following: ${ErpAccountTypes}`
  }) // Account Types, ignore casing
  @ApiProperty({description: "Type of Account within Erp system", enum: ErpAccountTypes})
  accountType: ErpAccountType;

  /**
   * Full Name for Account
   *
   * @example "Bank of America - Debit#1434341"
   */
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fullyQualifiedName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  active: boolean;
}

export class UpdateErpAccountDto extends PartialType(ErpAccountDto) { }

export class ErpInvoiceDto extends ErpObjectDto implements ErpInvoice {
  @IsISO8601()
  @IsNotEmpty()
  @ApiProperty({type: 'string', format: 'date-like', default: new Date().toISOString()})
  txnDate: string;

  @IsString()
  @Matches(`^${ErpObjectStatuses.join('|')}$`, 'i', {
    message: `status must be one of the following: ${ErpObjectStatuses}` 
  }) // ObjectStatuses, ignore casing
  @IsNotEmpty()
  @ApiProperty({enum: ErpObjectStatuses})
  status: ErpObjectStatus;

  @IsString()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i', {
    message: `supportedCurrencies must be one of the following: ${SupportedCurrencies}`
  }) // Supported currencies, ignore casing
  @IsNotEmpty()
  @ApiProperty({enum: SupportedCurrencies})
  currencyCode: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({minimum: 0.01, default: 1.45})
  totalAmt: number;

  @IsOptional()
  @IsISO8601()
  @ApiPropertyOptional({type: 'string', format: 'date-like', default: new Date().toISOString()})
  dueDate?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ type: TaxLine })
  taxLine?: TaxLine;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [LineItem] })
  lines?: LineItem[];
}

export class UpdateErpInvoiceDto extends PartialType(ErpInvoiceDto) { }

export class ErpInvoiceResultDto extends ApiResult<ErpInvoice> {
  @IsString()
  @IsEnum([ApiResultStatus.Success, ApiResultStatus.Failed])
  @IsNotEmpty()
  @ApiProperty({enum: [ApiResultStatus.Success, ApiResultStatus.Failed]})
  status: ApiResultStatus;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty({description: "Account Data", default: ErpInvoice})
  invoiceData: ErpInvoice;

  @IsString()
  @IsNotEmpty()
  @Matches(`^${ErpObjectTypes.join('|')}$`, 'i', {
    message: `erpObjectType must be one of the following: ${ErpObjectTypes}`
  }) // object type, ignore casing
  @ApiProperty({ description: "Type of ErpObject", default: "Invoice" })
  objectType: ErpObjectType;

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  @ApiProperty({default: '{"erp": "jsonblob"}'})
  jsonBlob: string;
}