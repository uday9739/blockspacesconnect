import { TwoFactorAuthConfigurationFailureReason } from "../../types/two-factor-auth-configuration";

/**
 * The data provided by the user during the initial login step
 *   email: string;
 *   password: string;
 */
export class TwoFactorAuthConfigurationDto {

  email: string;
  password: string;

  constructor(json?: Partial<TwoFactorAuthConfigurationDto>) {
    Object.assign(this, json);
  }
}

/**
 * The result of configuring two-factor authentication for a user
 */
export class TwoFactorConfigResultDto {

  // TODO Impelent datatypes for each individual response
  // Example Response
  // "barcode": "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",
  // "url": "otpauth://totp/BlockSpaces%20Platform:BlockSpaces%20Connect?algorithm=SHA1&digits=6&issuer=BlockSpaces+Platform&period=30&secret=7YJLMPOPLPM5MHI2CJB4ZE4ZB2NFLYIF",
  // "secret": "7YJLMPOPLPM5MHI2CJB4ZE4ZB2NFLYIF"

  /** a base64 representation of the QR code that can be used to configure a TOTP 2fa app (i.e. Google Authenticator, Authy, etc) */
  barcode: string;

  /** the TOTP URL represented by the QR code */
  url: string;

  /** the TOTP secret that can be used to manually */
  secret: string;
  failureReason?: TwoFactorAuthConfigurationFailureReason;

  constructor(json?: Partial<TwoFactorConfigResultDto>) {
    Object.assign(this, json);
  }

  get success() {
    return !Boolean(this.failureReason);
  }
}
