/** Reasons why two factor authentication configuration could fail */
export enum TwoFactorAuthConfigurationFailureReason {
  /** user's credentials (email/password) are invalid */
  INVALID_CREDENTIALS = "invalid credentials",

  /** failed to create vault 2FA configuration */
  FAILED_2FA_CONFIGURATION = " failed to create vault 2FA configuration"
}
