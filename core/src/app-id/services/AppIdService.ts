import { AuthFailureReason } from '@blockspaces/shared/types/authentication';
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import qs from "qs";
import { URLSearchParams } from "url";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { HttpService, HttpRequestConfig, HttpResponse } from "@blockspaces/shared/services/http";
import { isErrorStatus, isSuccessStatus } from "@blockspaces/shared/helpers/http";
import { SignUpUserResponse, IAmToken, UserProfileResult, UserTokensResult, RequestEmailVerificationResult, SendEmailResult, AppIdStatusResult, ForgotPasswordResult, ForgotPasswordConfirmationResultResponse, ForgotPasswordConfirmationResult, ForgotPasswordConfirmationResultErrorResponse, ChangePasswordResult, DeleteUserResult, UpdateUserProfileResult, UpdateTwoFactorStatusResult, IndexUserProfileResult, AppIdRegistrationResult, AppIdUserData, AppIdCustomAttributes } from "../models";
import { TwoFactorSetupStatus } from "@blockspaces/shared/models/users";
import ApiResult from '@blockspaces/shared/models/ApiResult';
import { ValidationException } from '../../exceptions/common';

/**
 * SOME NOTES ABOUT APP ID
 *
 * there are users and profiles
 * to update "attributes" of a user, you need to call the endpoint that ends with "/profile"
 * and pass the profileId (or the top level id prop from a GetUser api call).
 *
 * to update top level properties of a user (email, password etc), you can use the APPId endpoint that ends in "/users"
 * and pass the id property under identities
 */

/**
 * Provides connectivity to the IBM App ID cloud service that's utilized for user management and authentication
 */
@Injectable()
export class AppIdService {
  private readonly USER_VERIFICATION_EMAIL_TEMPLATE = "USER_VERIFICATION";
  private readonly RESET_PASSWORD_EMAIL_TEMPLATE = "RESET_PASSWORD";
  private readonly CONFIRMATION_EMAIL_TEMPLATE = "CONFIRMATION";
  private readonly API_TIMEOUT = 1000 * 5; // Wait for 5 seconds
  private iAmToken: IAmToken = {
    access_token: "",
    refresh_token: "not_supported",
    ims_user_id: 0,
    token_type: "Bearer",
    expires_in: 0,
    expiration: 0,
    scope: "ibm openid",
  };

  private readonly iamApiKey: string;
  private readonly iamBaseUrl: string;
  private readonly oauthTenantId: string;
  private readonly oauthBaseUrl: string;
  private readonly oauthClientId: string;
  private readonly oauthSecret: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {
    logger.setModule(this.constructor.name);
    this.iamApiKey = env.appId.iamApiKey;
    this.iamBaseUrl = env.appId.iamBaseUrl;
    this.oauthClientId = env.appId.oauthClientId;
    this.oauthSecret = env.appId.oauthSecret;
    this.oauthTenantId = env.appId.oauthTenantId;
    this.oauthBaseUrl = env.appId.oauthBaseUrl;
  }

  /**
   * Returns JSON web tokens (JWTs) for a user.
   * @param username
   * @param password
   * @returns {UserTokensResult}
   */
  getUserTokens = async (username: string, password: string): Promise<UserTokensResult> => {

    const result: UserTokensResult = { success: true };

    const response = await this.httpService.request({
      method: "POST",
      url: this.getOauthUrl("/token"),
      params: {
        scope: "openid profile email appid_custom attributes"
      },
      data: qs.stringify({ grant_type: "password", username, password }),
      validErrorStatuses: [HttpStatus.BAD_REQUEST, HttpStatus.FORBIDDEN],
      headers: {
        Accept: "application/json",
        ...this.getFormEncodedContentHeader(),
        ...this.getAuthorizationHeader()
      }
    });

    if (isErrorStatus(response.status)) {
      result.success = false;
      result.error = response.data;
      result.failureReason = response.data?.error_description || AuthFailureReason.INVALID_CREDENTIALS
      return result;
    }

    result.tokens = response.data;
    return result;
  };

  /**
   * Returns a refreshed App Id Access token 
   * @returns {AppIdStatusResult}
   */
  getAppIdStatus = async (): Promise<AppIdStatusResult> => {
    const token = await this.getAdminToken();
    return AppIdStatusResult.success(token?.data?.access_token);
  };

  registerNewUser = async (email: string, password: string, emailConfirmed: boolean = this.env.appId.enableEmailConfirmation): Promise<AppIdRegistrationResult> => {
    const result = await this.addUser(email, password, emailConfirmed);
    if (result.isSuccess) {
      return AppIdRegistrationResult.success<AppIdUserData>({
        profileId: result.data.id,
        id: result.data.identities[0].id,
        active: result.data.identities[0].idpUserInfo.active,
        isNew: result.data.isNew,
        attributes: result.data.attributes
      });
    }
    return AppIdRegistrationResult.failure(result.message);
  };

  /**
    * Adds a user to App id by calling 'cloud_directory/sign_up'
   * @param email
   * @param password
   * @param emailConfirmed When set to true user user will be add with Status `CONFIRMED` else status will be set to `PENDING`.
   * @returns {UserProfileResult} Add User Response
   *
    *
   */
  addUser = async (email: string, password: string, emailConfirmed: boolean)
    : Promise<UserProfileResult> => {

    const HTTP_ERROR_EMAIL_ALREADY_EXIST = 409;
    const STATUS_PENDING = "PENDING";
    const STATUS_CONFIRMED = "CONFIRMED";

    // first look for existing records
    const profileResult: UserProfileResult = await this.getUserProfileByEmail(email);
    if (profileResult.isSuccess) {
      profileResult.data.isNew = false;
      return UserProfileResult.success(profileResult.data);
    }

    // Profile Does not exist yet, Add the user to the registry
    const parameters = new URLSearchParams();
    parameters.append("shouldCreateProfile", "true");
    parameters.append("language", "en");
    const data: any = {
      emails: [
        {
          value: email,
          primary: true,
        },
      ],
      userName: email,
      password: password,
      status: emailConfirmed ? STATUS_PENDING : STATUS_CONFIRMED,
    };

    const signUpRequestOptions: HttpRequestConfig = {
      baseURL: `${this.oauthBaseUrl}/management/v4/${this.oauthTenantId}/cloud_directory/sign_up`,
      url: "",
      timeout: this.API_TIMEOUT,
      method: "post",
      validErrorStatuses: [HTTP_ERROR_EMAIL_ALREADY_EXIST],
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `${await this.getBearerToken()}`,
      },
      data: data,
      params: parameters,
    };

    const createResponse: HttpResponse = await this.httpService.request<SignUpUserResponse>(signUpRequestOptions);
    if (!createResponse.data?.profileId) {
      return UserProfileResult.failure(`Failed while creating identity profile in App Id`);
    }
    // Update newly created User's Profile for twofastatus = Pending
    const profileId = createResponse.data.profileId;

    const profileUpdateResponse = await this.updateUserProfile(profileId, { twofastatus: TwoFactorSetupStatus.Pending });
    if (profileUpdateResponse.isFailure) {
      return UserProfileResult.failure(`Failed while adding 2FA Status to profile in App Id`);
    }
    profileUpdateResponse.data.isNew = true;
    return UserProfileResult.success(profileUpdateResponse.data);

  };

  /**
   * Gets App Id User profile
   * @param userId 
   * @returns {UserProfileResult}
   */
  getUserProfile = async (userId: string): Promise<UserProfileResult> => {

    const requestOptions: HttpRequestConfig = {
      baseURL: this.oauthBaseUrl, // https://iam.cloud.ibm.com
      url: `/management/v4/${this.oauthTenantId}/users/${userId}/profile`,
      timeout: this.API_TIMEOUT,
      method: "get",
      validErrorStatuses: [HttpStatus.NOT_FOUND],
      headers: {
        Authorization: `${await this.getBearerToken()}`,
      },
    };

    const response = await this.httpService.request(requestOptions);
    if (response.status === HttpStatus.NOT_FOUND) {
      return UserProfileResult.failure(`User with id ${userId} not found`);
    }


    return UserProfileResult.success(response.data);

  };

  /**
   * Returns User Profile for a given Email Address 
   * @param email 
   * @returns {UserProfileResult}
   */
  getUserProfileByEmail = async (email: string): Promise<UserProfileResult> => {
    return this.getUserByEmailHelper(email, "full");
  };

  /**
   *  Sends a email template to a given user Id. Using `cloud_directory/resend`
   * @param templateName Available values  ["USER_VERIFICATION", "WELCOME", "PASSWORD_CHANGED" or "RESET_PASSWORD".]
   * @param uuid 
   * @returns {SendEmailResult}
   */
  sendEmail = async (templateName: string, uuid: string): Promise<SendEmailResult> => {
    const API_ERROR_RESET_PASSWORD = 409;
    const API_ERROR_ACCOUNT_ALREADY_CONFIRMATION = 410;


    const requestOptions: HttpRequestConfig = {
      baseURL: this.oauthBaseUrl, // https://iam.cloud.ibm.com
      url: `/management/v4/${this.oauthTenantId}/cloud_directory/resend/${templateName}`,
      timeout: this.API_TIMEOUT,
      validErrorStatuses: [API_ERROR_RESET_PASSWORD, API_ERROR_ACCOUNT_ALREADY_CONFIRMATION],
      method: "post",
      headers: {
        Authorization: `${await this.getBearerToken()}`,
      },
      data: { uuid: uuid },
    };

    const res = await this.httpService.request(requestOptions);
    if (isSuccessStatus(res.status)) {
      return SendEmailResult.success({ message: "Email is queued to be delivered." });
    }
    else {
      let msg = (typeof res.data === 'string' ? res.data : res.data?.message) || `Error sending email.`;
      if (res.status === API_ERROR_RESET_PASSWORD) {
        if (templateName === this.RESET_PASSWORD_EMAIL_TEMPLATE) {
          // override error message 
          msg = "Cannot reset password, User account not verified.";
        }
      }
      else if (res.status === API_ERROR_ACCOUNT_ALREADY_CONFIRMATION) {
        if (templateName === this.CONFIRMATION_EMAIL_TEMPLATE) {
          // override error message 
          msg = "User account already confirmed.";
        }
      }
      return SendEmailResult.failure(msg, msg);
    }
  };

  /**
   * Starts the forgot password process.
   * https://cloud.ibm.com/docs/appid?topic=appid-branded#branded-api-forgot-password
   * @param emailAddress 
   * @returns 
   */
  forgotPassword = async (emailAddress: string): Promise<ForgotPasswordResult> => {
    const API_ERROR_USER_ACCOUNT_NOT_VERIFIED = 409;

    const requestOptions: HttpRequestConfig = {
      baseURL: this.oauthBaseUrl, // https://iam.cloud.ibm.com
      url: `/management/v4/${this.oauthTenantId}/cloud_directory/forgot_password?language=en`,
      timeout: this.API_TIMEOUT,
      method: "post",
      validErrorStatuses: [API_ERROR_USER_ACCOUNT_NOT_VERIFIED, HttpStatus.NOT_FOUND],
      headers: {
        Authorization: `${await this.getBearerToken()}`,
      },
      data: { user: emailAddress },
    };

    const res = await this.httpService.request(requestOptions);
    if (res.status === API_ERROR_USER_ACCOUNT_NOT_VERIFIED) {
      return ForgotPasswordResult.failure(`User account not verified.`);
    } else if (this.httpService.isErrorStatus(res.status)) {
      return ForgotPasswordResult.failure("No account was found");
    }

    return ForgotPasswordResult.success(res.data);

  };

  /**
   * 
   * @param context 
   * @returns {ForgotPasswordConfirmationResult}
   */
  forgotPasswordConfirmResult = async (context: string): Promise<ForgotPasswordConfirmationResult> => {
    const API_ERROR_CONTEXT_NOT_FOUND = 404;

    const requestOptions: HttpRequestConfig = {
      baseURL: this.oauthBaseUrl, // https://iam.cloud.ibm.com
      url: `/management/v4/${this.oauthTenantId}/cloud_directory/forgot_password/confirmation_result`,
      timeout: this.API_TIMEOUT,
      method: "post",
      validErrorStatuses: [API_ERROR_CONTEXT_NOT_FOUND],
      headers: {
        Authorization: `${await this.getBearerToken()}`,
      },
      data: { context: context },
    };

    const res = await this.httpService.request(requestOptions);

    if (res.status === API_ERROR_CONTEXT_NOT_FOUND) {
      return ForgotPasswordConfirmationResult.failure((res.data as ForgotPasswordConfirmationResultErrorResponse)?.message, res.data as ForgotPasswordConfirmationResultErrorResponse);
    }
    return ForgotPasswordConfirmationResult.success(res.data as ForgotPasswordConfirmationResultResponse);
  };

  /**
   * Changes the Cloud Directory user password. By calling `cloud_directory/change_password`
   * @param newPassword 
   * @param identityUuid 
   * @param changedIpAddress 
   * @returns {ChangePasswordResult}
   */
  changePassword = async (newPassword: string, identityUuid: string, changedIpAddress?: string): Promise<ChangePasswordResult> => {
    const ip = typeof changedIpAddress === "undefined" ? "0.0.0.0" : changedIpAddress;

    const requestOptions: HttpRequestConfig = {
      baseURL: this.oauthBaseUrl, // https://iam.cloud.ibm.com
      url: `/management/v4/${this.oauthTenantId}/cloud_directory/change_password`,
      timeout: this.API_TIMEOUT,
      method: "post",
      validErrorStatuses: [401],
      headers: {
        Authorization: `${await this.getBearerToken()}`,
      },
      data: { newPassword: newPassword, uuid: identityUuid, changedIpAddress: ip },
    };

    const res = await this.httpService.request(requestOptions);

    if (res.status === 401) {
      throw new ValidationException(res.data?.error?.toString());
    }
    return ChangePasswordResult.success(res.data);

  };

  /**
   * Deletes an existing Cloud Directory user and the Profile related to it
   * @param sub 
   * @returns {DeleteUserResult}
   */
  deleteUser = async (sub: string): Promise<DeleteUserResult> => {

    const requestOptions: HttpRequestConfig = {
      baseURL: this.oauthBaseUrl, // https://iam.cloud.ibm.com
      url: `/management/v4/${this.oauthTenantId}/users/${sub}`, // sub is the subject in the identity token or profile id in IBM App ID
      timeout: this.API_TIMEOUT,
      validErrorStatuses: [HttpStatus.NOT_FOUND],
      method: "delete",
      headers: {
        Authorization: `${await this.getBearerToken()}`,
      },
    };

    const res = await this.httpService.request(requestOptions);
    if (res.status === HttpStatus.NOT_FOUND) {
      this.logger.error(res.statusText, null, res.data);
      return DeleteUserResult.failure(`${res.statusText} for: ${sub}`);
    }
    return DeleteUserResult.success(res.data);
  };

  /**
   * Send User Verification Email 
   * @param email 
   * @returns {RequestEmailVerificationResult}
   */
  requestEmailVerification = async (email: string): Promise<RequestEmailVerificationResult> => {
    // Get User Profile
    const userProfileResult = await this.getUserProfileByEmail(email);
    if (userProfileResult.isFailure) {
      return RequestEmailVerificationResult.failure(userProfileResult.message, userProfileResult.message);
    }
    const userProfile = userProfileResult.data;
    // Get cloud_directory provider ID
    const cloudDirectoryProvider = userProfile?.identities?.find(x => x.provider === "cloud_directory");
    if (cloudDirectoryProvider) {
      const uuid = cloudDirectoryProvider.id;
      // send `USER_VERIFICATION_EMAIL_TEMPLATE` email 
      const sendEmailResponse = await this.sendEmail(this.USER_VERIFICATION_EMAIL_TEMPLATE, uuid);
      if (sendEmailResponse.isSuccess) {
        return RequestEmailVerificationResult.success(sendEmailResponse.data);
      } else {
        return RequestEmailVerificationResult.failure(sendEmailResponse.message, sendEmailResponse.error);
      }
    } else {
      const msg = "cloud_directory provider not found";
      return RequestEmailVerificationResult.failure(msg, msg);
    }
  };

  /**
   * Updates a user profile
   * @param userId 
   * @param attributes 
   * @returns 
   */
  updateUserProfile = async (userId: string, attributes: AppIdCustomAttributes): Promise<UpdateUserProfileResult> => {

    const requestOptions: HttpRequestConfig = {
      baseURL: this.oauthBaseUrl, // https://iam.cloud.ibm.com
      url: `/management/v4/${this.oauthTenantId}/users/${userId}/profile`,
      timeout: this.API_TIMEOUT,
      validErrorStatuses: [HttpStatus.NOT_FOUND],
      method: "put",
      headers: {
        Authorization: `${await this.getBearerToken()}`,
      },
      data: { attributes: attributes },
    };

    const response = await this.httpService.request(requestOptions);
    if (response.status === HttpStatus.NOT_FOUND) {
      return UpdateUserProfileResult.failure(`User not found`);
    }
    return UpdateUserProfileResult.success(response.data);
  };

  /**
   * Update User Profile [twofastatus] property 
   * @param userId 
   * @param twofastatus 
   * @returns {UpdateTwoFactorStatusResult}
   */
  updateTwoFactorStatus = async (userId: string, twofastatus: TwoFactorSetupStatus): Promise<UpdateTwoFactorStatusResult> => {
    const userProfileResult = await this.getUserProfile(userId);
    const userProfile = userProfileResult.data;
    if (userProfile && userProfile.id === userId) {
      const attributes = {
        ...userProfile.attributes,
        twofastatus
      };
      const updatedProfileResult = await this.updateUserProfile(userId, attributes);
      if (updatedProfileResult.isSuccess) {
        return UpdateTwoFactorStatusResult.success(updatedProfileResult.data);
      } else {
        return UpdateTwoFactorStatusResult.failure("Error updating User Profile", updatedProfileResult.data);
      }
    }
    return UpdateTwoFactorStatusResult.failure("Error updating User Profile");
  };
  /**
   * Update User Profile [twofastatus] property , providing a user email
   * @param email 
   * @param twofastatus 
   * @returns {UpdateTwoFactorStatusResult}
   */
  updateTwoFactorStatusForUserByEmail = async (email: string, twofastatus: TwoFactorSetupStatus): Promise<UpdateTwoFactorStatusResult> => {
    const userIdResponse = await this.getUserIdByEmail(email);
    if (userIdResponse.isFailure) {
      return UpdateTwoFactorStatusResult.failure(userIdResponse.message);
    }
    return this.updateTwoFactorStatus(userIdResponse.data.id, twofastatus);
  };

  /**
   * Add's Org from User Profile `attributes.orgs` Array, given a user's Id
   * @param userId 
   * @param Org 
   * @returns {UpdateTwoFactorStatusResult}
   *
   * @deprecated tenants/orgs are no longer stored in App ID; this method should be removed once all references to it have been removed
   */
  addOrgToUserProfile = async (userId: string, Org: string): Promise<UpdateUserProfileResult> => {
    const userProfileResult = await this.getUserProfile(userId);
    const userProfile = userProfileResult.data;
    const profileAttributes: AppIdCustomAttributes = userProfile.attributes || { orgs: [], twofastatus: TwoFactorSetupStatus.Pending };
    profileAttributes.orgs = [...(userProfile.attributes.orgs || [])];

    const isAlreadyAdded = profileAttributes.orgs.find((x: string) => x.toLowerCase() === Org.toLowerCase()) != null;

    if (isAlreadyAdded) {
      return UpdateUserProfileResult.success(userProfile);
    }

    // add org
    profileAttributes.orgs.push(Org);
    const updatedProfileResult = await this.updateUserProfile(userId, profileAttributes);
    if (updatedProfileResult.isSuccess) {
      return UpdateUserProfileResult.success(updatedProfileResult.data);
    } else {
      return UpdateUserProfileResult.failure(updatedProfileResult.message);
    }

  };

  /**
   * Removes Org from User Profile `attributes.orgs` Array, given a user's Id
   * @param userId 
   * @param Org 
   * @returns {UpdateUserProfileResult}
   *
   * @deprecated tenants/orgs are no longer stored in App ID; this method should be removed once all references to it have been removed
   */
  removeOrgFromUserProfile = async (userId: string, Org: string): Promise<UpdateUserProfileResult> => {
    const userProfileResult = await this.getUserProfile(userId);
    const userProfile = userProfileResult.data;
    const profileAttributes: AppIdCustomAttributes = userProfile.attributes || { orgs: [], twofastatus: TwoFactorSetupStatus.Pending };
    profileAttributes.orgs = [...(userProfile.attributes.orgs || [])];

    const isAlreadyAdded = profileAttributes.orgs.find((x: string) => x.toLowerCase() === Org.toLowerCase()) != null;

    if (isAlreadyAdded === false) {
      return UpdateUserProfileResult.success(userProfile);
    }

    // remove from array
    profileAttributes.orgs = profileAttributes.orgs.filter(x => x.toString().toLowerCase() !== Org.toLowerCase());

    const updatedProfileResult = await this.updateUserProfile(userId, profileAttributes);
    if (updatedProfileResult.isSuccess) {
      return UpdateUserProfileResult.success(updatedProfileResult.data);
    } else {
      return UpdateUserProfileResult.failure(updatedProfileResult.message);
    }

  };

  /**
   * Add's Org from User Profile `attributes.orgs` Array, given a user's Email
   * @param email 
   * @param Org 
   * @returns {UpdateUserProfileResult}
   *
   * @deprecated tenants/orgs are no longer stored in App ID; this method should be removed once all references to it have been removed
   */
  addUserOrgToUserProfileByEmail = async (email: string, Org: string): Promise<UpdateUserProfileResult> => {
    const userData = await this.getUserIdByEmail(email);
    if (userData.isFailure || !userData.data) {
      return UpdateUserProfileResult.failure("Error updating User Profile");
    }
    return this.addOrgToUserProfile(userData.data.id, Org);
  };

  /**
   * Removes's Org from User Profile `attributes.orgs` Array, given a user's Email
   * @param email 
   * @param Org 
   * @returns {UpdateUserProfileResult}
   *
   * @deprecated tenants/orgs are no longer stored in App ID; this method should be removed once all references to it have been removed
   */
  removeUserOrgFromProfileByEmail = async (email: string, Org: any): Promise<UpdateUserProfileResult> => {
    const userData = await this.getUserIdByEmail(email);
    if (userData.isFailure || !userData.data) {
      return UpdateUserProfileResult.failure("Error updating User Profile");
    }
    return this.removeOrgFromUserProfile(userData.data.id, Org);
  };

  // #region Private Helper Methods

  /**
 * Returns User Id for a given Email Address 
 * @param email 
 * @returns 
 */
  private getUserIdByEmail = async (email: string): Promise<ApiResult<IndexUserProfileResult>> => {
    return this.getUserByEmailHelper(email, "index");
  };

  /**
   * Helper method to search for user by Email. Returns Full profile when `dataScope = full`. Or Id's when `dataScope = index`
   * @param email 
   * @param dataScope 
   * @returns 
   */
  private getUserByEmailHelper = async (email: string, dataScope: 'full' | 'index' = 'full'): Promise<ApiResult<any>> => {

    // TODO: Ignore 401 and return user found other wise continue.
    const requestOptions: HttpRequestConfig = {
      baseURL: this.oauthBaseUrl, // https://iam.cloud.ibm.com
      url: `/management/v4/${this.oauthTenantId}/users?email=${encodeURIComponent(email)}&dataScope=${dataScope}`,
      timeout: this.API_TIMEOUT,
      method: "get",
      headers: {
        Authorization: `${await this.getBearerToken()}`,
      },
    };

    const response = await this.httpService.request(requestOptions);

    const profile = response.data?.users?.find(x => x.email === email);

    if (profile) {

      return ApiResult.success(profile);
    } else {
      return ApiResult.failure(`User not found`);
    }
  };

  private getAuthorizationHeader(): any {
    return {
      Authorization: "Basic " + Buffer.from(`${this.oauthClientId}:${this.oauthSecret}`, "utf8").toString("base64")
    };
  }

  private getFormEncodedContentHeader(): any {
    return {
      "Content-Type": "application/x-www-form-urlencoded"
    };
  }

  private getOauthUrl(path: string = ""): string {
    return this.getUrl(`${this.oauthBaseUrl}/oauth/v4/${this.oauthTenantId}`, path);
  }

  private getManagementUrl(path: string = ""): string {
    return this.getUrl(`${this.oauthBaseUrl}/management/v4/${this.oauthTenantId}`, path);
  }

  private isTokenValid(tokenExpirationStamp: number = this.iAmToken.expiration): boolean {
    // subtract 5 minutes from the expiration deadline for margin
    return (tokenExpirationStamp * 1000) > (Date.now() - 5 * 60 * 1000);
  }

  // TODO convert in to a util method in shared library (this would be useful in a lot of places)
  private getUrl(baseUrl, path): string {
    const trimmedPath = path?.trim()?.replace(/^\//, "");

    if (!trimmedPath) return baseUrl;

    return `${baseUrl}/${trimmedPath}`;
  }

  /**
   * Returns a refreshed App Id Access token 
   * @returns {ApiResult<IAmToken>}
   */
  private getAdminToken = async (): Promise<ApiResult<IAmToken>> => {

    if (this.isTokenValid(this.iAmToken.expiration)) {
      //this.logger.trace("getAdminToken.isTokenValid return true");
      return ApiResult.success<IAmToken>(this.iAmToken);
    }
    this.logger.trace("getAdminToken.isTokenValid return false, refreshing token");
    const payload = {
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: this.iamApiKey,
    };
    const requestOptions: HttpRequestConfig = {
      baseURL: this.iamBaseUrl,
      url: `/identity/token`,
      timeout: this.API_TIMEOUT,
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(payload),
    };

    const response = await this.httpService.request(requestOptions);
    this.iAmToken = response.data;
    // this.logger.trace("getAdminToken::refreshing token completed successfully");

    return ApiResult.success<IAmToken>(this.iAmToken);
  };

  private async getBearerToken(): Promise<string> {
    const accessToken = await this.getAdminToken();
    return `Bearer ${accessToken.data?.access_token}`;
  }

  // #endregion
}