import { ErpObjectStatus, ErpObjectStatuses } from "./ErpObjects"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, ValidateNested } from "class-validator";
import { SupportedCurrencies } from "../lightning/Currencies";

export class ExpenseCategory {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string = null;

  @IsString()
  @ApiProperty()
  value: string = null;
}

export class ErpPurchase {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ minimum: 0.01, default: 1.15 })
  totalAmount: number = null;

  @IsString()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  @IsNotEmpty()
  @ApiProperty({ enum: SupportedCurrencies })
  currencyCode: String = null;

  @IsOptional()
  @IsString()
  @ApiProperty({ enum: ErpObjectStatuses })
  status: ErpObjectStatus = null;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({ type: ExpenseCategory })
  expenseCategory?: ExpenseCategory = null;

  @IsOptional()
  @IsISO8601()
  @ApiPropertyOptional({ type: 'string', format: 'date-time', example: '2018-11-21T06:20:32.232Z' })
  transactionDate?: string = null;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string = null;
}