import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from "class-validator";
import { SupportedCurrencies } from "../../../models/lightning/Currencies";

export class BitcoinConvertDto {
    @IsNumber()
    @Min(0)
    amount: number;

    @IsString()
    @IsNotEmpty()
    @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
    currency: string;
}

export class BitcoinConvertResultDto {
    data: {
        exchangeRate: {
            base: string,
            currency: string,
            amount: string
        },
        invoice: [
            {
                amount: string,
                currency: string
            },
            {
                amount: number,
                currency: string
            }
        ]
    }
}