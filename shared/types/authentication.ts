/** Reasons why authentication could fail */
export enum AuthFailureReason {
  /** user's credentials (email/password) are invalid */
  INVALID_CREDENTIALS = "invalid credentials",

  /** the user's email address has not been verified */
  EMAIL_NOT_VERIFIED = "email not verified",

  /** the JWT access token could not be verified */
  INVALID_JWT = "invalid JWT",

  /** the user has not registered, or has not completed the registration process */
  NOT_REGISTERED = "user not registered"
}
