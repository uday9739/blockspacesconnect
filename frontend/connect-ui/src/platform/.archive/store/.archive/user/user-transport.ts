// import ApiResult, { AsyncApiResult, IApiResult } from '@blockspaces/shared/models/ApiResult';
// import { TwoFactorConfigResultDto } from '@blockspaces/shared/dtos/authentication/two-factor-auth-configuration';
// import { TwoFactorLoginDto, TwoFactorLoginResultDto } from "@blockspaces/shared/dtos/authentication/two-factor-auth-login";
// import { InitialLoginDto, InitialLoginResultDto } from "@blockspaces/shared/dtos/authentication/initial-login";
// import { IResetPassword, IUser } from '@blockspaces/shared/models/users';
// import { getApiUrl } from 'src/platform/utils';
// import { BaseHttpTransport } from "src/platform/api";
// import { HttpStatus } from "@blockspaces/shared/types/http";
// import { UserRegistrationDto, UserProfileDto, UserRegistrationResultDto } from "@blockspaces/shared/dtos/users";
// import { ConnectSubscriptionExpandedDto } from "@blockspaces/shared/dtos/connect-subscription/ConnectSubscriptionDto"
// import { isErrorStatus } from "@blockspaces/shared/helpers/http";
// import { NetworkPriceBillingCodes } from '@blockspaces/shared/models/network-catalog';
// import { PlatformApiResponse, PlatformStatus } from "@blockspaces/shared/models/platform";

// export class UserTransport extends BaseHttpTransport {

//   /** singleton instance of {@link UserTransport} */
//   static readonly instance: UserTransport = new UserTransport();

//   /**
//    * Performs a check to determine if the user is currently logged in or not
//    */
//   async checkHeartbeat(): Promise<UserHeartbeatResult> {
//     const response = await this.httpService.get<ApiResult>(
//       getApiUrl("/users/heartbeat"),
//       { validErrorStatuses: [HttpStatus.UNAUTHORIZED] }
//     );

//     return { isLoggedIn: this.httpService.isSuccessStatus(response.status) }
//   }

//   /**
//    * Triggers the sending of a "Forgot Password" email to the given email address.
//    *
//    * A successful response is returned, regardless of whether the user's account exists or not
//    */
//   async forgotPassword(email: string): Promise<void> {
//     await this.httpService.get(getApiUrl(`/users/forgotPassword/${email}`));
//   }

//   /**
//    * Fetches the current logged in user.
//    *
//    * If the user is logged in, a successful {@link ApiResult} is returned, containing
//    * the user data
//    *
//    * If the user is not currently logged in, a failed {@link ApiResult} will be returned without user data.
//    */
//   async getCurrentUser(): Promise<ApiResult<IUser>> {

//     const response = await this.httpService.get<IApiResult<IUser>>(
//       getApiUrl("/users/current"),
//       { validErrorStatuses: [HttpStatus.UNAUTHORIZED] }
//     );
//     return ApiResult.fromJson(response.data);
//   }


//   /**
//    * Fetches the current logged in user's subscription status
//    */
//   async getSubscriptionStatus(): Promise<IApiResult<ConnectSubscriptionExpandedDto>> {

//     const { data: apiResult } = await this.httpService.get<IApiResult<ConnectSubscriptionExpandedDto>>(
//       getApiUrl("/connect-subscription")
//     );
//     return apiResult;
//   }

//   /**
//  * Cancel subscription
//  */
//   async cancelSubscription(networkId: string, billingCategoryCode: NetworkPriceBillingCodes): Promise<boolean> {
//     const { data: apiResult } = await this.httpService.post<IApiResult<boolean>>(
//       getApiUrl(`connect-subscription/cancel/${networkId}/${billingCategoryCode}`),
//       {},
//       { }
//     );
//     return apiResult.data
//     // return apiResult.data;
//   }

//   /**
//    * Confirms the "context" parameter that is used to authenticate a user that is attempting to
//    * reset their password
//    */
//   async getForgotPasswordConfirmResult(context: string) {

//     const { data: apiResult } = await this.httpService.get<IApiResult>(
//       getApiUrl(`/users/forgotPasswordConfirm/${context}`),
//       { validErrorStatuses: [HttpStatus.UNAUTHORIZED] }
//     )
//     return ApiResult.fromJson(apiResult);
//   }

//   /**
//    * Gets the profile/personal data for the current logged in user (GET /api/users/profile)
//    */
//   async getUserProfile(): Promise<UserProfileDto> {
//     const { data: apiResult } = await this.httpService.get<ApiResult<UserProfileDto>>(
//       getApiUrl("/user-profile")
//     );
//     return apiResult.data;
//   }

//   /**
//    * Attempts to log a user in, using their credentials and a two-factor auth code
//    */
//   async login2fa(email: string, password: string, twoFactorCode: string): Promise<TwoFactorLoginResultDto> {

//     const loginRequest = new TwoFactorLoginDto({
//       email,
//       password,
//       code: twoFactorCode,
//       cookie: true
//     });

//     const { data: apiResult } = await this.httpService.post<IApiResult<TwoFactorLoginResultDto>>(
//       getApiUrl("/auth/login"),
//       loginRequest,
//       { validErrorStatuses: [HttpStatus.UNAUTHORIZED] }
//     );

//     return new TwoFactorLoginResultDto(apiResult.data);
//   }

//   /**
//    * Ends a user's session by invalidating their access token(s).
//    *
//    * Returns a successful {@link ApiResult} if the user was logged out,
//    * or a failed result if the user was already logged out
//    */
//   async logout(): Promise<ApiResult> {
//     const response = await this.httpService.get(
//       getApiUrl("/auth/logout"),
//       {
//         validErrorStatuses: [HttpStatus.UNAUTHORIZED]
//       }
//     );

//     return isErrorStatus(response.status) ? ApiResult.failure() : ApiResult.success();
//   }

//   /**
//    * Verifies a user's username and password, without returning an access token.
//    */
//   async initialLogin(username: string, password: string): Promise<InitialLoginResultDto> {
//     const { data: apiResult } = await this.httpService.post<IApiResult<InitialLoginResultDto>>(
//       getApiUrl("/auth/initial"),
//       <InitialLoginDto>{ email: username, password: password },
//       {
//         validErrorStatuses: [HttpStatus.FORBIDDEN, HttpStatus.UNAUTHORIZED]
//       }
//     );

//     return new InitialLoginResultDto(apiResult.data);
//   }

//   /**
//    * Gets a user's 2FA configuration data (QR code, key, etc), needed for initially setting up two-factor auth
//    */
//   async configure2fa(username: string, password: string): Promise<TwoFactorConfigResultDto> {
//     const { data: apiResult } = await this.httpService.post<IApiResult<TwoFactorConfigResultDto>>(
//       getApiUrl("/auth/2fa/configure"),
//       { email: username, password: password }
//     );

//     return apiResult.data;
//   }

//   /**
//    * register a new user account
//    */
//   async register(userRegistration: UserRegistrationDto): AsyncApiResult<UserRegistrationResultDto> {

//     const { data: apiResult } = await this.httpService.post<IApiResult<UserRegistrationResultDto>>(
//       getApiUrl("/user-registration"),
//       userRegistration,
//       {
//         validErrorStatuses: [
//           HttpStatus.FORBIDDEN    // occurs if registration returns with a failure result
//         ]
//       }
//     );

//     return ApiResult.fromJson(apiResult);
//   }

//   /**
//    * Reset a user's password.
//    * @param password the new password to set
//    * @param context a temporary key, initially provided at the beginning of the reset process, used to validate the request
//    */
//   async resetPassword(password: string, context: string): Promise<ApiResult> {

//     const { data: apiResult } = await this.httpService.post<IApiResult>(
//       getApiUrl("/users/changePassword"),
//       <IResetPassword>{ password, context },
//       { validErrorStatuses: [HttpStatus.UNAUTHORIZED] }
//     )

//     return ApiResult.fromJson(apiResult);
//   }

//   /**
//    * Updates the "welcome" flag for the logged in user
//    */
//   async setWelcomeFlag(): Promise<void> {
//     await this.httpService.put(getApiUrl("/users/welcome"))
//   }

//   /**
//    * Send/resend a verification email to a user with the given email address
//    */
//   async verifyEmail(email: string): Promise<void> {
//     await this.httpService.post(
//       getApiUrl("/users/verifyemail"),
//       { email }
//     )
//   }

//   /**
//    * Updates the current user's personal/profile data (PUT /api/users/profile)
//    */
//   async updateUserProfile(userProfile: UserProfileDto): Promise<void> {
//     await this.httpService.patch(
//       getApiUrl("/user-profile"),
//       userProfile
//     );
//   }

//   async platformCheck() {
//     const results = await this.httpService.get<ApiResult<PlatformApiResponse>>(
//       getApiUrl("platform/status/detailed") ) 
//     return ApiResult.success(results.data.data);
//   }
// }


// export type UserHeartbeatResult = {
//   isLoggedIn: boolean
// }
