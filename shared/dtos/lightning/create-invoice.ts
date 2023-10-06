import { IsNumber, IsString, Min } from "class-validator";

export class GenerateBolt11Dto {
  @IsString()
  tenantId: string;

  @IsString()
  memo: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  expiry: number;
}
