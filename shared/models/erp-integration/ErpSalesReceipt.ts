import { ErpObjectStatus, ErpObjectStatuses } from "./ErpObjects";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Matches, ValidateNested } from "class-validator";
import { SupportedCurrencies } from "../lightning/Currencies";

export class ItemDetails {
  @IsString()
  @ApiProperty()
  itemName: string = null;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string = null;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({default: 1})
  lineNum?: number = null;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({minimum: 0, default: 1})
  quantity?: number = null;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiPropertyOptional({minimum: 0.01, default: 1.15})
  unitPrice?: number = null;
}
export class LineItem {
  @IsNumber()
  @IsPositive()
  @ApiProperty({minimum: 0.01, default: 1.15})
  amount: number = null;
  @ApiPropertyOptional({type: ItemDetails})
  itemDetails?: ItemDetails = null;
}
export class TaxLine {

  @IsNumber()
  @IsPositive()
  @ApiProperty({minimum: 0.01, default: 0.09})
  totalTax: number = null;

  @IsNumber()
  @IsPositive()
  @ApiProperty({minimum: 0.01, default: 1.15})
  netAmountTaxable: number = null;

  @IsNumber()
  @IsPositive()
  @ApiProperty({minimum: 1, maximum: 100, default: 7.5})
  taxPercent: number = null;
}
export class ErpSalesReceipt {

  @IsNumber()
  @IsPositive()
  @ApiProperty({minimum: 0.01, default: 1.24})
  totalAmount: number = null;

  @IsString()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  @ApiProperty({enum: SupportedCurrencies})
  currencyCode: String = null;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({type: [LineItem]})
  lines?: LineItem[] = null;

  @IsOptional()
  @ApiProperty()
  description?: string = null;

  @IsString()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  @ApiProperty({enum: ErpObjectStatuses})
  status: ErpObjectStatus = null;

  @IsOptional()
  @ApiPropertyOptional({type: TaxLine})
  taxLine?: TaxLine = null;
}

