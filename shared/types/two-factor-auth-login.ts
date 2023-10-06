/** Reasons why two factor login could fail */
export enum TwoFactorAuthLoginFailureReason {

  USER_NOT_FOUND = "User was not found.",

  INVALID_CODE = "Invalid 2FA code provided.",

  UNAUTHORIZED_USER = "User is not authorized.",

  INVALID_CREDENTIALS = "Invalid user credentials.",

  INVALID_REQUEST_BODY = "Invalid request body.",

  NOT_REGISTERED = "user not registered",

  TENANT_NOT_FOUND = "Tenant not found"
}
