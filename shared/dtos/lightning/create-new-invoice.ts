import { Type } from "class-transformer";
import { IsArray, IsEnum, IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Domain, domains, ErpObjectType, ErpObjectTypes } from "../../models/erp-integration/ErpObjects";
import { ErpMetadata } from "../../models/lightning/Integration";
import { PaymentSource, PaymentSources } from "../../models/lightning/Invoice";

export class CreateInvoiceDto {

  @IsString()
  @IsNotEmpty()
  currency: string = "";

  @IsNumber()
  @Min(0)
  amount: number = 0;

  @IsString()
  memo: string = "";

  @IsString()
  @IsNotEmpty()
  tenantId: string = "";

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ErpMetadata)
  erpMetadata?: ErpMetadata[] = [];

  @IsString()
  @IsIn(PaymentSources)
  source: PaymentSource = "unknown";

  constructor(json?: Partial<CreateInvoiceDto>) {
    Object.assign(this, json);
  }
}