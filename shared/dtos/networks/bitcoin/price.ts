import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsISO8601, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { SupportedCurrencies } from "../../../models/lightning/Currencies";

export class BitcoinPriceDto {
    @IsString()
    @IsNotEmpty()
    @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
    currency: string;

    @IsOptional()
    @IsString()
    @IsISO8601()
    date?: string;
}

export class BitcoinPriceResultDto {
    @IsString()
    @IsNotEmpty()
    @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
    base: string;

    @IsString()
    @IsNotEmpty()
    @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
    currency: string;

    @IsString()
    @IsNotEmpty()
    exchangeRate: string;
}