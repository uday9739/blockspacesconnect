import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsJSON, IsNotEmpty, IsObject, IsString, ValidateNested } from "class-validator";
import ApiResult, { ApiResultStatus } from "../ApiResult";
import { ErpObject, ErpObjectCombined, ErpObjectType, Metadata } from "./ErpObjects";

export const ErpAccountTypes = [ "expense", "equity", "asset", "liability", "revenue" ] as const;
export type ErpAccountType = typeof ErpAccountTypes[number];

export class ErpAccount {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({description: "Type of Account within Erp system", enum: ErpAccountTypes})
  accountType: ErpAccountType = null;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fullyQualifiedName: string = null;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string = null;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  active: boolean = null;
}
