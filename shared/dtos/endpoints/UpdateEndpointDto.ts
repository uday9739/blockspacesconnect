import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateEndpointDto {

  @IsNotEmpty()
  alias: string;

  @IsOptional()
  token?: string;

  @IsOptional()
  description?: string;
};
