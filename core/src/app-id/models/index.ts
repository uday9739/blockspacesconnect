import ApiResult, { ApiResultWithError } from "@blockspaces/shared/models/ApiResult";
import { TwoFactorSetupStatus } from "@blockspaces/shared/models/users";
import { AuthFailureReason } from "@blockspaces/shared/types/authentication";
import { AccessAndIdTokenResponse } from "@blockspaces/shared/types/oauth";


export interface AppIdError {
  error: string,
  error_description: string,
  cdErrorCode: string
}

export class AppIdStatusResult extends ApiResult<string>{ }

// #region Token
export interface IAmToken {
  access_token: string,
  refresh_token: string,
  ims_user_id: number,
  token_type: string,
  expires_in: number,
  expiration: number,
  scope: string,
};


export interface UserTokensResult {
  success: boolean,
  error?: AppIdError;

  /** access and indentity token data */
  tokens?: AccessAndIdTokenResponse

  /** the reason why getting tokens for a user failed */
  failureReason?: AuthFailureReason
}
// #endregion

// #region App Id User Common

interface UserEmail {
  value: string
  primary: boolean
}
export interface UserIdentity {
  provider: string
  id: string
  idpUserInfo: IdpUserInfo
}

export interface AppIdUserData {
  /** the unique ID (sub) for the user in AppId */
  profileId: string;

  /** the ID of the User Identity */
  id: string;

  isNew: boolean;

  active: boolean;

  attributes: AppIdCustomAttributes
}

export interface AppIdCustomAttributes {
  /** status of user's 2FA setup */
  twofastatus: TwoFactorSetupStatus;

  /** @deprecated this attribute is no longer used and should eventually be removed */
  orgs?: string[]
}

export interface IdpUserInfo {
  displayName: string
  active: boolean
  userName: string
  emails: UserEmail[]
  meta: any
  schemas: string[]
  id: string
  status: string
}
export interface AppIdUserProfile {
  id: string
  name: string
  email: string
  preferred_username: string
  identities: UserIdentity[]
  attributes?: AppIdCustomAttributes
  isNew?: boolean
}
// #endregion 

// #region Add User ( Sign Up )
export interface SignUpUserResponse {
  // https://datatracker.ietf.org/doc/html/rfc7643#section-8.2
  displayName: string
  active: boolean
  userName: string
  emails: UserEmail[]
  schemas: string[]
  id: string
  status: string
  profileId: string
}

export class AddUserResult extends ApiResult<SignUpUserResponse>{
}
// #endregion 

// #region App Id User's result
export interface FullUserProfileSearchResponse {
  totalResults: number
  itemsPerPage: number
  requestOptions: any,
  users: Array<AppIdUserProfile>
}

export interface IndexUserProfileResult {
  idp: string
  id: string
  email: string
}
export interface IndexUserProfileSearchResponse {
  totalResults: number
  itemsPerPage: number
  requestOptions: any,
  users: Array<IndexUserProfileResult>
}
// #endregion

// #region ForgotPassword
export interface ForgotPasswordResponse {
  displayName: string
  active: boolean
  userName: string
  mfaContext: any
  emails: UserEmail[]
  meta: any
  schemas: string[]
  id: string
  status: string
}

export class ForgotPasswordResult extends ApiResult<ForgotPasswordResponse>{ }

export interface ForgotPasswordConfirmationResultResponse {
  success: boolean,
  uuid: string
}
export interface ForgotPasswordConfirmationResultErrorResponse {
  errorCode: string,
  message: string
}

export class ForgotPasswordConfirmationResult extends ApiResultWithError<ForgotPasswordConfirmationResultResponse, ForgotPasswordConfirmationResultErrorResponse>{ }
// #endregion 

export class AppIdRegistrationResult extends ApiResult<AppIdUserData>{ }

export class UserProfileResult extends ApiResult<AppIdUserProfile>{ }

export class RequestEmailVerificationResult extends ApiResultWithError<{ message: string }, string>{ }

export class SendEmailResult extends ApiResultWithError<{ message: string }, string>{ }

export class ChangePasswordResult extends ApiResult<AppIdUserProfile>{ }

export class DeleteUserResult extends ApiResult<any>{ }

export class UpdateUserProfileResult extends ApiResult<AppIdUserProfile>{ }

export class UpdateTwoFactorStatusResult extends ApiResult<AppIdUserProfile>{ }

