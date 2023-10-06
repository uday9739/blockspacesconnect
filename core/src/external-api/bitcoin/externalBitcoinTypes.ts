/* eslint-disable indent */
import { BitcoinConvertResultDto } from "@blockspaces/shared/dtos/networks/bitcoin/convert";
import ApiResult, { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { SupportedCurrencies } from "@blockspaces/shared/models/lightning/Currencies";
import { PriceReference } from "@blockspaces/shared/models/lightning/Invoice";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Matches, Min, ValidateNested } from "class-validator";

export type Clean<T> = {
  [Property in keyof T]: T[Property];
}

export const clean = (obj: PriceReference) => {
  return {
    date: new Date(obj.timestamp).toISOString(),
    currency: obj.currency,
    exchangeRate: obj.exchangeRate
  };

};

class PriceObject extends PriceReference {
  @IsOptional()
  @IsString()
  @IsISO8601()
  @ApiPropertyOptional({type: 'string', format: 'date-like', default: new Date().toISOString()})
  declare date?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  @ApiProperty({default: 'btc'})
  declare currency: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({type: Number, default: 10.03})
  declare exchangeRate: number;
}

export class PriceResponse extends ApiResult {
  @IsString()
  @IsEnum([ApiResultStatus.Success, ApiResultStatus.Failed])
  @IsNotEmpty()
  @ApiProperty({enum: [ApiResultStatus.Success, ApiResultStatus.Failed]})
  declare status: ApiResultStatus | "success" | "failed";

  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({type: PriceObject})
  declare data: PriceObject;
}

export class BitcoinConvertExternalDto {
  @IsNumber()
  @Min(0)
  @ApiProperty({default: 5})
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  @ApiProperty({enum: SupportedCurrencies, default: 'usd'})
  baseCurrency: string;

  @IsString()
  @IsNotEmpty()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  @ApiProperty({enum: SupportedCurrencies, default: 'sats'})
  targetCurrency: string;

  @IsOptional()
  @IsString()
  @IsISO8601()
  @ApiPropertyOptional({type: 'string', format: 'date-like', default: new Date().toISOString()})
  declare date?: string;
}

class InvoicePriceObject {
  @IsString()
  @IsNotEmpty()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  @ApiProperty({enum: SupportedCurrencies, default: 'usd'})
  currency: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({type: Number, default: 10.03})
  amount: number;
}


export class BitcoinConvertObject extends BitcoinConvertResultDto {

  @IsOptional()
  @IsString()
  @IsISO8601()
  @ApiPropertyOptional({type: 'string', format: 'date-like', default: new Date().toISOString()})
  declare date?: string;

  @IsNumber()
  @ApiProperty({type: Number, default: 42115.3})
  exchangeRate: number;

  @IsArray()
  @IsObject({each: true})
  @ValidateNested({each: true})
  @Type(() => InvoicePriceObject)
  @ApiProperty({type: [InvoicePriceObject], default: [{amount: 5, currency: "usd"}, {amount: 210576.5, currency: "sats"}]})
  invoice: InvoicePriceObject[];
}

export class BitcoinConvertResponse extends ApiResult {
  @IsString()
  @IsEnum([ApiResultStatus.Success, ApiResultStatus.Failed])
  @IsNotEmpty()
  @ApiProperty({enum: [ApiResultStatus.Success, ApiResultStatus.Failed]})
  declare status: ApiResultStatus | "success" | "failed";

  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({type: BitcoinConvertObject})
  declare data: BitcoinConvertObject;
}