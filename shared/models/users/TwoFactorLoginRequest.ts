/**
 * Represents a request to login to Blockspaces using two-factor authentication
 */
export interface TwoFactorLoginRequest {
  email: string,
  password: string,

  /** two-factor auth code */
  code: string,

  /** if true, the response will include auth cookies if the login attempt is successful */
  cookies?: boolean
}