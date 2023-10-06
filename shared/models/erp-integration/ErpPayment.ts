import { ErpObjectStatus, ErpObjectStatuses } from "./ErpObjects"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsISO8601, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, Matches, ValidateNested } from "class-validator";
import { string } from "yargs";
import { SupportedCurrencies } from "../lightning/Currencies";

export class DepositAccount {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string = null;

  @IsString()
  @ApiProperty()
  value: string = null;
}
export class ErpPayment {
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
  @ApiPropertyOptional({ type: DepositAccount })
  depositAccount?: DepositAccount = null;
  // Amount still owed

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ minimum: 0.01 })
  unappliedAmount?: number = null;

  @IsOptional()
  @IsISO8601()
  @ApiPropertyOptional({ type: 'string', format: 'date-time', example: '2018-11-21T06:20:32.232Z' })
  transactionDate?: string = null;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string = null;
}
