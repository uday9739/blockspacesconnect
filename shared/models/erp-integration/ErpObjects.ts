import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsISO8601, IsJSON, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from "class-validator";
import ApiResult, { ApiResultStatus } from "../ApiResult";
import { ErpAccount } from "./ErpAccount";
import { ErpInvoice } from "./ErpInvoice";
import { ErpPayment } from "./ErpPayment";
import { ErpSalesReceipt } from "./ErpSalesReceipt";
import { ErpPurchase } from "./ErpPurchase";

type ErpObjectMap = {
  "Invoice": ErpInvoice,
  "SalesReceipt": ErpSalesReceipt,
  "Account": ErpAccount,
  "Payment": ErpPayment,
  "Purchase": ErpPurchase
};

export const ErpObjectTypes = ["Invoice", "SalesReceipt", "Account", "Payment", "Purchase"] as const;
export type ErpObjectType = keyof ErpObjectMap;
export type ErpObjects = ErpObjectMap[ErpObjectType];

export const domains = ['QBO'] as const;
export type Domain = typeof domains[number];

export const ErpObjectStatuses = ["PENDING", "PAID", "CANCELED", "EXPIRED"] as const;
export type ErpObjectStatus = typeof ErpObjectStatuses[number];

export class Metadata {
  @IsString()
  @IsNotEmpty()
  @Matches(`^${domains.join('|')}$`, 'i') // Domains, ignore casing
  @ApiProperty({ enum: domains })
  domain: Domain = null;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  externalId: string = null;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  tenantId: string = null;

  @IsOptional()
  @IsISO8601()
  @ApiPropertyOptional({ type: 'string', format: 'date-like', default: new Date().toISOString() })
  createdAt?: string = null;

  @IsOptional()
  @IsISO8601()
  @ApiPropertyOptional({ type: 'string', format: 'date-like', default: new Date().toISOString() })
  timestampSynced?: string = null;
}
export class ErpObject {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  internalId: string = null;

  @IsString()
  @IsEnum({ enum: ErpObjectTypes })
  @IsNotEmpty()
  @ApiProperty({ enum: ErpObjectTypes })
  objectType: ErpObjectType = null;

  @ValidateNested()
  @ApiProperty({ type: Metadata })
  metadata: Metadata = null;

  @ValidateNested()
  @ApiPropertyOptional({ type: ErpInvoice })
  invoiceData?: ErpInvoice = null;

  @ValidateNested()
  @ApiPropertyOptional({ type: ErpAccount })
  accountData?: ErpAccount = null;

  @ValidateNested()
  @ApiPropertyOptional({ type: ErpPayment })
  paymentData?: ErpPayment = null;

  @ValidateNested()
  @ApiPropertyOptional({ type: ErpSalesReceipt })
  salesReceiptData?: ErpSalesReceipt = null;
  // stringified json blob from source erp

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  @ApiProperty({ default: '{"erp": "jsonblob"}' })
  jsonBlob: string = null;
}
class ErpAccountObject implements Partial<ErpObject> {
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ description: "Account Data", default: ErpAccount })
  declare accountData: ErpAccount;

  @ValidateNested()
  @ApiProperty({ type: Metadata })
  declare metadata: Metadata;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Type of ErpObject", default: "Account" })
  declare objectType: ErpObjectType

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  @ApiProperty({ default: '{"erp": "jsonblob"}' })
  declare jsonBlob: string;
}
export class ErpAccountResult extends ApiResult {
  @IsString()
  @IsEnum([ApiResultStatus.Success, ApiResultStatus.Failed])
  @IsNotEmpty()
  @ApiProperty({ enum: [ApiResultStatus.Success, ApiResultStatus.Failed] })
  declare status: ApiResultStatus;

  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ type: ErpAccountObject })
  declare data: ErpAccountObject
}
class ErpInvoiceObject implements Partial<ErpObject> {
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ description: "Invoice Data", default: ErpInvoice })
  invoiceData: ErpInvoice;

  @ValidateNested()
  @ApiProperty({ type: Metadata })
  metadata: Metadata;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Type of ErpObject", default: "Invoice" })
  objectType: ErpObjectType;

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  @ApiProperty({ default: '{"erp": "jsonblob"}' })
  jsonBlob: string;
}
export class ErpInvoiceResult extends ApiResult {
  @IsString()
  @IsEnum([ApiResultStatus.Success, ApiResultStatus.Failed])
  @IsNotEmpty()
  @ApiProperty({ enum: [ApiResultStatus.Success, ApiResultStatus.Failed] })
  declare status: ApiResultStatus;

  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ type: ErpInvoiceObject })
  declare data: ErpInvoiceObject;
}
class ErpPaymentObject implements Partial<ErpObject> {
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ description: "Payment Data", default: ErpPayment })
  paymentData: ErpPayment;

  @ValidateNested()
  @ApiProperty({ type: Metadata })
  metadata: Metadata;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Type of ErpObject", default: "Payment" })
  objectType: ErpObjectType

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  @ApiProperty({ default: '{"erp": "jsonblob"}' })
  jsonBlob: string;
}
export class ErpPaymentResult extends ApiResult {
  @IsString()
  @IsEnum([ApiResultStatus.Success, ApiResultStatus.Failed])
  @IsNotEmpty()
  @ApiProperty({ enum: [ApiResultStatus.Success, ApiResultStatus.Failed] })
  declare status: ApiResultStatus;

  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ type: ErpPaymentObject })
  declare data: ErpPaymentObject
}

class ErpPurchaseObject implements Partial<ErpObject> {
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ description: "Purchase Data", default: ErpPurchase })
  paymentData: ErpPurchase;

  @ValidateNested()
  @ApiProperty({ type: Metadata })
  metadata: Metadata;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Type of ErpObject", default: "Purchase" })
  objectType: ErpObjectType

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  @ApiProperty({ default: '{"erp": "jsonblob"}' })
  jsonBlob: string;
}
export class ErpPurchaseResult extends ApiResult {
  @IsString()
  @IsEnum([ApiResultStatus.Success, ApiResultStatus.Failed])
  @IsNotEmpty()
  @ApiProperty({ enum: [ApiResultStatus.Success, ApiResultStatus.Failed] })
  declare status: ApiResultStatus;

  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ type: ErpPurchaseObject })
  declare data: ErpPurchaseObject
}
class ErpSalesReceiptObject implements Partial<ErpObject> {
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ description: "SalesReceipt Data", default: ErpSalesReceipt })
  declare salesReceiptData: ErpSalesReceipt;

  @ValidateNested()
  @ApiProperty({ type: Metadata })
  declare metadata: Metadata;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Type of ErpObject", default: "SalesReceipt" })
  declare objectType: ErpObjectType

  @IsString()
  @IsJSON()
  @IsNotEmpty()
  @ApiProperty({ default: '{"erp": "jsonblob"}' })
  declare jsonBlob: string;
}

export class ErpSalesReceiptResult extends ApiResult {
  @IsString()
  @IsEnum([ApiResultStatus.Success, ApiResultStatus.Failed])
  @IsNotEmpty()
  @ApiProperty({ enum: [ApiResultStatus.Success, ApiResultStatus.Failed] })
  declare status: ApiResultStatus;

  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({ type: ErpSalesReceiptObject })
  declare data: ErpSalesReceiptObject
}
type ErpObjectTypeData = {
  invoiceData: ErpInvoice,
  accountData: ErpAccount,
  salesReceiptData: ErpSalesReceipt,
  paymentData: ErpPayment
}

type ErpObjectTypeDatum<T extends ErpObjects> =
  T extends ErpInvoice ? { invoiceData: ErpInvoice } :
  T extends ErpAccount ? { accountData: ErpAccount } :
  T extends ErpPayment ? { paymentData: ErpPayment } :
  { salesReceiptData: ErpSalesReceipt };

type ErpObjectCommon = {
  [Property in keyof Omit<ErpObject, keyof ErpObjectTypeData>]: ErpObject[Property];
}
export type ErpObjectData<T extends ErpObjects> = {
  [Property in keyof ErpObjectTypeDatum<T>]-?: T
}

export type ErpObjectCombined<T extends ErpObjects> = ErpObjectTypeDatum<T> | ErpObjectCommon;
