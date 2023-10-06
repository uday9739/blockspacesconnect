import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Domain, domains, ErpObjectType, ErpObjectTypes } from "../erp-integration/ErpObjects";

export interface IntegrationTransactionReference {
  integrationId: string,
  integration: Integration
  transactionType: IntegrationTransactionType,
  url: string
}

export const ErpMetadataTypes = ['expenseCategory', 'revenueCategory', 'erpInvoiceId', 'posted'] as const
export type ErpMetadataType = typeof ErpMetadataTypes[number];

export class ErpMetadata {
  @IsString()
  @IsEnum({ enum: ErpMetadataTypes })
  @IsNotEmpty()
  dataType: ErpMetadataType = null;

  @IsString()
  @IsNotEmpty()
  @IsEnum({ enum: domains })
  domain: Domain = null;

  @IsString()
  value: string = null;
}

export class IntegrationTransaction implements IntegrationTransactionReference {
  integrationId: string;
  integration: Integration;
  transactionType: IntegrationTransactionType;
  url: string

  constructor(integrationRef: IntegrationTransactionReference) {
    Object.assign(this, integrationRef)
  }

  toJSON() {
    return {
      integrationId: this.integrationId,
      integration: this.integration,
      transactionType: this.transactionType,
      url: this.url
    }
  }
}

export enum Integration {
  QuickBooks = "quickbooks"
}

export enum IntegrationTransactionType {
  Invoice = "invoice",
  SalesReceipt = "sales-receipt",
  Purchase = "purchase"
}