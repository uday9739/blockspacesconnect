import { IsDate, IsDecimal, IsInt, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { CartError, CartStatus } from "../../models/cart";
import { CountryCode } from "../../models/Countries";
import { NetworkPriceBillingCategory } from "../../models/network-catalog";


export class BillingAddressDto {
  @IsNotEmpty({ message: "Full Name is a required field, and should match your payment card name." })
  fullName: string;
  @IsNotEmpty({ message: "Address Line 1 is required" })
  addressLine1: string;
  @IsString()
  @IsOptional()
  addressLine2: string;
  @ValidateIf(x => x.country === CountryCode.UnitedStates)
  @IsNotEmpty({ message: "State is required" })
  state: string;
  @IsString()
  @IsOptional()
  city: string;

  @ValidateIf(x => x.country === CountryCode.UnitedStates)
  @IsNotEmpty({ message: "Postal code is required" })
  postalCode: string;
  @IsNotEmpty()
  /**
    * Two-letter country code ([ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)).
    */
  @IsNotEmpty({ message: "Country required" })
  country: string;

  setAsDefault?: boolean
}

export class UserCartItemDto {
  @IsNotEmpty()
  offerId: string;
}

export class UserCartDto {
  id: string;
  @IsDate()
  date: Date;
  @IsNotEmpty()
  networkId: string;
  @IsNotEmpty()
  userId: string;
  status: CartStatus;
  @ValidateIf(x => x.status != CartStatus.EMPTY)
  @IsNotEmpty()
  billingAddress?: BillingAddressDto;
  items?: UserCartItemDto[]
  cartError?: CartError;
  billingCategory?: NetworkPriceBillingCategory
}