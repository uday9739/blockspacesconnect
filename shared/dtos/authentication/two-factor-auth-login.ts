import { IUser } from "../../models/users";
import {TwoFactorAuthLoginFailureReason} from "../../types/two-factor-auth-login";


/**
 * The data provided for a 2FA login request
 */
export class TwoFactorLoginDto {

  email: string;
  password: string;
  code: string;
  cookie: boolean;

  constructor(json?: Partial<TwoFactorLoginDto>) {
    Object.assign(this, json);
  }

  static validateRequest(object: any): boolean {
    return !!(object.email && object.password && object.code && (typeof object.cookie !== "undefined"));
  }
}

/**
 * The result of a 2FA login attempt
 */
export class TwoFactorLoginResultDto {

  userDetails?: IUser;
  failureReason?: TwoFactorAuthLoginFailureReason;

  constructor(json?: Partial<TwoFactorLoginResultDto>) {
    Object.assign(this, json);
  }

  get success() {
    return !Boolean(this.failureReason);
  }
}
