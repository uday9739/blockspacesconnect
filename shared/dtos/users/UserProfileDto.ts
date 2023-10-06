
import { Allow, IsEmail, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsPostalCode, IsString, ValidateIf } from "class-validator";
import { Address } from "../../models/Address";
import { CountryCode } from "../../models/Countries";
import { StateAbbreviation } from "../../models/States";
import { Timezones } from "../../models/Timezones";
import { IUser } from "../../models/users";


/**
 * The Profile data provided for the user 
 */
export class UserProfileDto {
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: "First Name is Required" })
  firstName: string;

  @IsNotEmpty({ message: "Last Name is Required" })
  lastName: string;

  @IsPhoneNumber(null, { message: "Valid Phone Number is Required" })
  phone: string;

  @Allow()
  companyName: string;

  @IsNotEmpty({ message: "Address is Required" })
  address1: string;

  @Allow()
  address2: string;

  @IsNotEmpty({ message: "City is Required" })
  city: string;

  @ValidateIf(o => o.country === CountryCode.UnitedStates)
  @IsEnum(StateAbbreviation, { message: "Please enter a Valid State" })
  state: string;

  @ValidateIf(o => o.country === CountryCode.UnitedStates)
  @IsPostalCode('any', { message: 'Postal Code is invalid' })
  zipCode: string;

  @IsEnum(CountryCode, { message: "Please Choose a Country" })
  country: CountryCode;

  @IsNumber()
  @IsOptional()
  gaScore?: number;

  /**
   * Updates/mutates a given user object, using the data contained within this DTO instance
   */
  mergeWithUser(user: IUser): void {
    if (!user) return;

    user.firstName = this.firstName;
    user.lastName = this.lastName;
    user.companyName = this.companyName;
    user.email = this.email;
    user.phone = this.phone;
    user.gaScore = this.gaScore;
    const address: Address = {
      address1: this.address1,
      address2: this.address2,
      country: this.country,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode
    };

    if (user.address) {
      Object.assign(user.address, address)
    } else {
      user.address = address;
    }
  }

  /**
   * Create a new {@link UserProfileDto} from a given user object
   * @returns a new UserProfileDto or null if the given user object is falsey
   */
  static fromUser(user: IUser): UserProfileDto {
    if (!user) return null;

    const dto = new UserProfileDto();
    const address: Partial<Address> = user.address || {};
    dto.gaScore = user.gaScore;
    dto.address1 = address.address1;
    dto.address2 = address.address2;
    dto.city = address.city;
    dto.companyName = user.companyName;
    dto.country = address.country as CountryCode;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.phone = user.phone;
    dto.state = address.state as StateAbbreviation;
    dto.zipCode = address.zipCode;

    return dto;
  }
}
