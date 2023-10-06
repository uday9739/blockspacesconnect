import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class GenerateQuoteDto {
  @IsString()
  invoiceId: string;

  @IsString()
  tenantId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expirationInSecs?: number;
}
