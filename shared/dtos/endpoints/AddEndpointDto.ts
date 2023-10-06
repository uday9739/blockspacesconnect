import { IsNotEmpty, IsOptional } from "class-validator";

export class AddEndpointDto {

  @IsNotEmpty()
  endpointId: string;

  @IsNotEmpty()
  networkId: string;

  @IsNotEmpty()
  alias: string;

  @IsOptional()
  token?: string;

  @IsOptional()
  description?: string;
}
