import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Matches, MinLength, registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { TwoFactorSetupStatus, UnregisteredUser } from "../../models/users";
import { IsEqualTo } from "../../validation/decorators";
import { UserProfileDto } from "./UserProfileDto";

export class QuickUserRegistrationDto {
  @IsString()
  @IsOptional()
  token: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @IsOptional()
  gaScore?: number;

  @IsBoolean()
  @IsOptional()
  acceptInvite?: boolean;

  @IsString()
  @IsOptional()
  inivtorTenantId?: string;


  @IsString()
  @MinLength(8, { message: 'password should be a minimum of 8 characters' })
  // regex to validate a password strength - commented out until policy determined?
  // @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{10,}$/, { message: 'password should contain Upper Case, Lowercase, Numbers and Special Chars' })
  password?: string;

  @IsEqualTo<UserRegistrationDto>('password', { message: "Password fields must match" })
  verifyPassword?: string;

  toUnregisteredUser(): UnregisteredUser {
    return {
      email: this.email,
      twoFAStatus: "PENDING",
      gaScore: this.gaScore
    }
  }
}

export class InviteUserRegistrationDto {
  @IsString()
  @IsOptional()
  token: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @IsOptional()
  gaScore?: number;

  @IsString()
  tenantId?: string;

  toUnregisteredUser(): UnregisteredUser {
    return {
      email: this.email,
      twoFAStatus: "PENDING",
      gaScore: this.gaScore
    }
  }
}

/**
 * The Profile data provided for the user 
 */
export class UserRegistrationDto extends UserProfileDto {
  @IsString()
  @IsOptional()
  token: string;

  @IsString()
  @MinLength(8, { message: 'password should be a minimum of 8 characters' })
  // regex to validate a password strength - commented out until policy determined?
  // @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{10,}$/, { message: 'password should contain Upper Case, Lowercase, Numbers and Special Chars' })
  password?: string;

  @IsEqualTo<UserRegistrationDto>('password', { message: "Password fields must match" })
  verifyPassword?: string;

  @IsBoolean()
  @IsOptional()
  acceptInvite?: boolean;

  @IsString()
  @IsOptional()
  inivtorTenantId?: string;

  /** Create an {@link UnregisteredUser} object based on the properties of this DTO */
  toUnregisteredUser(): UnregisteredUser {
    return {
      gaScore: this.gaScore,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      companyName: this.companyName,
      phone: this.phone,
      twoFAStatus: "PENDING",
      address: {
        address1: this.address1,
        address2: this.address2,
        country: this.country,
        city: this.city,
        state: this.state,
        zipCode: this.zipCode,
      },
    }
  }
}