import { IsNotEmpty, IsString } from "class-validator"

export class TwoFactorCodeFormDto { @IsString() @IsNotEmpty({message: "Please enter a 6-digit 2FA code"}) code: string }