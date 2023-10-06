import { IsEmail } from "class-validator";

export class ForgotPasswordFormDto {
  // @IsEmail({message: "Please enter a valid Email address"})
  @IsEmail({}, {message: "Please enter a valid Email address"})
  email: string
}