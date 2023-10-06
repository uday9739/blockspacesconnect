import { IsNumber, IsOptional, IsString } from "class-validator";

export class BitcoinTransactionDto {
    @IsOptional()
    @IsNumber()
    start_height?: number;

    @IsOptional()
    @IsNumber()
    end_height?: number;

    @IsOptional()
    @IsString()
    account?: string;
}