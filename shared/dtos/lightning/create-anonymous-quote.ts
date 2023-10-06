import { IsNumber, IsString, Min } from "class-validator";

export class CreateAnonymousQuoteDto {
    @IsString()
    currency: string = "";

    @IsNumber()
    @Min(0)
    amount: number = 0;

    @IsString()
    memo: string = "";

    @IsString()
    tenantId: string = "";

    @IsNumber()
    @Min(0)
    expirationInSecs: number;
}