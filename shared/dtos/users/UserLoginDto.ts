import { IsEmail, IsString, Matches, MinLength } from "class-validator";

/**
 * The Login fields data shared between frontend and backend
 */
export class UserLoginDto implements LoginCredentials {

  @IsEmail({}, { message: "Please enter a valid Email address" })
  email: string;

  @IsString()
  @MinLength(8, { message: 'password should be a minimum of 8 characters' })
  // regex to validate a password strength - commented out until policy determined?
  // @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{10,}$/, { message: 'password should contain Upper Case, Lowercase, Numbers and Special Chars' })
  password: string;
}

export type LoginCredentials = {
  email: string,
  password: string
};