import { CountryCode } from "./Countries";
import { StateAbbreviation } from "./States";

export interface Address {
  country?: CountryCode | string;
  address1: string;
  address2?: string;
  city: string;
  state?: StateAbbreviation | string;
  zipCode?: string;
}