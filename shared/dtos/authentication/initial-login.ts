import { AuthFailureReason } from "../../types/authentication";

/**
 * The data provided by the user during the initial login step
 */
export class InitialLoginDto {

  email: string;
  password: string;

  constructor(json?: Partial<InitialLoginDto>) {
    Object.assign(this, json);
  }
}

/**
 * The result of an initial login attempt provided by the API
 */
export class InitialLoginResultDto {

  email: string;
  userId?: string;
  twoFactorSetupComplete: boolean;
  failureReason?: AuthFailureReason | string;

  constructor(json?: Partial<InitialLoginResultDto>) {
    Object.assign(this, json);
  }

  get success() {
    return !Boolean(this.failureReason);
  }
}