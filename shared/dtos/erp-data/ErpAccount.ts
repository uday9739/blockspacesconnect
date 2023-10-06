import { IsDate, IsDecimal, IsInt, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { ErpAccount, ErpAccountType } from '../../models/erp-integration/ErpAccount';
import { ErpInvoice } from "../../models/erp-integration/ErpInvoice";
import { ErpObject, Metadata } from "../../models/erp-integration/ErpObjects";
import { ErpPayment } from "../../models/erp-integration/ErpPayment";
import { ErpSalesReceipt } from "../../models/erp-integration/ErpSalesReceipt";


export class ErpAccountDto implements ErpAccount {
  @IsString() 
  @IsNotEmpty() 
  accountType: ErpAccountType;
  @IsString()
  @IsNotEmpty()
  fullyQualifiedName: string;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  active: boolean;
  @IsString()
  @IsNotEmpty()
  jsonBlob: string;
}
