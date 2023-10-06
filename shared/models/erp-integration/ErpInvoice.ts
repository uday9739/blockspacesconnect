import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, ValidateNested } from "class-validator";
import { SupportedCurrencies } from "../lightning/Currencies";
import { ErpObjectStatus, ErpObjectStatuses } from "./ErpObjects";

export class ItemDetails {
  @IsString()
  @ApiProperty()
  itemName: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ default: 1 })
  lineNum?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ minimum: 0, default: 1 })
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiPropertyOptional({ minimum: 0.01, default: 1.15 })
  unitPrice?: number;
}

export class LineItem {
  @IsNumber()
  @IsPositive()
  @ApiProperty({ minimum: 0.01, default: 1.15 })
  amount: number;
  @ApiPropertyOptional({ type: ItemDetails })
  itemDetails?: ItemDetails;
}

export class CustomerRef {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiPropertyOptional()
  value?: string;

  @IsString()
  @ApiPropertyOptional()
  memo?: string;
}

export class TaxLine {

  @IsNumber()
  @IsPositive()
  @ApiProperty({ minimum: 0.01, default: 0.09 })
  totalTax: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ minimum: 0.01, default: 1.15 })
  netAmountTaxable: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ minimum: 1, maximum: 100, default: 7.5 })
  taxPercent: number;
}

export class ErpInvoice {
  @IsISO8601()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', format: 'date-like', default: new Date().toISOString() })
  txnDate: string = null;

  @IsString()
  @IsEnum({enum: ErpObjectStatuses})
  @IsNotEmpty()
  @ApiProperty({ enum: ErpObjectStatuses })
  status: ErpObjectStatus = null;

  @IsString()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  @IsNotEmpty()
  @ApiProperty({ enum: SupportedCurrencies })
  currencyCode: String = null;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ minimum: 0.01, default: 1.45 })
  totalAmt: number = null;

  @IsOptional()
  @IsISO8601()
  @ApiPropertyOptional({ type: 'string', format: 'date-like', default: new Date().toISOString() })
  dueDate?: string = null;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({ type: [LineItem] })
  lines?: LineItem[] = null;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({ type: TaxLine })
  taxLine?: TaxLine = null;
}