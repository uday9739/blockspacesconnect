/**
 * The result of validating a user's username and password during the login process,
 * before confirming their 2FA code
 */
export type UserPreLoginResult = {
  success: boolean,
  email: string,
  userId?: string,
  twoFactorSetupStatus?: TwoFactorSetupStatus,
  failureReason?: PreLoginFailureReason
}

export default UserPreLoginResult

/** the status of a user's two-factor auth setup */
export enum TwoFactorSetupStatus {
  Pending = "PENDING",
  Confirmed = "CONFIRMED"
}

export enum PreLoginFailureReason {
  /** email or password were invalid */
  InvalidCredentials = 1,

  /** user's email address has not been verified */
  EmailNotVerified = 2
}
