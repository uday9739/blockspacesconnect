import ApiResult, { AsyncApiResult, IApiResult } from '@blockspaces/shared/models/ApiResult';
import { TwoFactorConfigResultDto } from '@blockspaces/shared/dtos/authentication/two-factor-auth-configuration';
import { TwoFactorLoginDto, TwoFactorLoginResultDto } from "@blockspaces/shared/dtos/authentication/two-factor-auth-login";
import { InitialLoginDto, InitialLoginResultDto } from "@blockspaces/shared/dtos/authentication/initial-login";
import { IResetPassword, IUser } from '@blockspaces/shared/models/users';
import { getApiUrl } from 'src/platform/utils';
import { UserRegistrationDto, UserProfileDto, UserRegistrationResultDto } from "@blockspaces/shared/dtos/users";
import { ConnectSubscriptionExpandedDto } from "@blockspaces/shared/dtos/connect-subscription/ConnectSubscriptionDto"
import { NetworkPriceBillingCodes } from '@blockspaces/shared/models/network-catalog';
import axios from 'axios';
import { UserNetwork } from '@blockspaces/shared/models/networks';
import { AddUserNetworkRequest } from '@blockspaces/shared/dtos/user-network';
import { AppSettings } from '@blockspaces/shared/models/app-settings';
import { BillingTier } from '@blockspaces/shared/models/network-catalog/Tier';

export async function initialLogin(username: string, password: string): Promise<InitialLoginResultDto> {
  const { data: apiResult } = await axios.post<IApiResult<InitialLoginResultDto>>(
    getApiUrl("/auth/initial"), <InitialLoginDto>{ email: username, password: password }
  );
  return new InitialLoginResultDto(apiResult.data);
}

export async function login2fa(email: string, password: string, twoFactorCode: string): Promise<TwoFactorLoginResultDto> {

  const loginRequest = new TwoFactorLoginDto({
    email,
    password,
    code: twoFactorCode,
    cookie: true
  });

  const { data: apiResult } = await axios.post<IApiResult<TwoFactorLoginResultDto>>(
    getApiUrl("/auth/login"),
    loginRequest
  );

  return new TwoFactorLoginResultDto(apiResult.data);
}

export async function register(userRegistration: UserRegistrationDto): Promise<UserRegistrationResultDto> {
  const { data: apiResult } = await axios.post<IApiResult<UserRegistrationResultDto>>(
    getApiUrl("/user-registration"),
    userRegistration
  );
  return apiResult.data;
}

export async function quickRegister(userRegistration: UserRegistrationDto): Promise<UserRegistrationResultDto> {
  const { data: apiResult } = await axios.post<IApiResult<UserRegistrationResultDto>>(
    getApiUrl("/user-registration/quick"),
    userRegistration
  );
  return apiResult.data;
}

export async function configure2fa(username: string, password: string): Promise<TwoFactorConfigResultDto> {
  const { data: apiResult } = await axios.post<IApiResult<TwoFactorConfigResultDto>>(
    getApiUrl("/auth/2fa/configure"),
    { email: username, password: password }
  );
  return apiResult.data;
}

export async function verifyEmail(email: string): Promise<void> {
  return await axios.post(
    getApiUrl("/users/verifyemail"),
    { email }
  )
}

export async function forgotPassword(email: string): Promise<void> {
  return await axios.get(getApiUrl(`/users/forgotPassword/${email}`));
}

export async function getForgotPasswordConfirmResult(context: string) {
  const { data: apiResult } = await axios.get<IApiResult>(
    getApiUrl(`/users/forgotPasswordConfirm/${context}`)
  )
  return apiResult.data
}

export async function resetPassword(password: string, context: string): Promise<void> {

  const { data: apiResult } = await axios.post<IApiResult>(
    getApiUrl("/users/changePassword"),
    <IResetPassword>{ password, context }
  )
  return apiResult.data
}

export async function logout(): Promise<void> {
  return await axios.get(
    getApiUrl("/auth/logout")
  );
}

export async function revokeToken(): Promise<void> {
  return await axios.get(
    getApiUrl("/auth/revoke-token")
  );
}

export async function getCurrentUser(): Promise<IUser> {
  const response = await axios.get<IApiResult<IUser>>(
    getApiUrl("/users/current")
  );
  return response.data.data;
}

export async function acceptTos(): Promise<IUser> {
  const { data: apiResult } = await axios.get<IApiResult>(getApiUrl("/users/acceptToS"));
  return apiResult.data;
}

export async function setWelcomeFlag(): Promise<void> {
  return await axios.put(getApiUrl("/users/welcome"))
}

export async function addUserNetwork(networkId: string, billingTierCode: string, billingCategoryCode: string): Promise<UserNetwork> {
  const response = await axios.post<ApiResult<UserNetwork>>(
    getApiUrl("/user-network"),
    new AddUserNetworkRequest({ networkId, billingTierCode, billingCategoryCode })
  );
  return response.data.data;
}

export async function getUserNetworks(): Promise<UserNetwork[]> {
  const response = await axios.get<ApiResult<UserNetwork[]>>(
    getApiUrl("/user-network")
  );
  return response.data.data;
}

export async function getConnectSubscription(): Promise<ConnectSubscriptionExpandedDto> {
  const { data: apiResult } = await axios.get<IApiResult<ConnectSubscriptionExpandedDto>>(
    getApiUrl("/connect-subscription")
  );
  return apiResult.data;
}

export async function cancelSubscription(networkId: string, billingCategoryCode: NetworkPriceBillingCodes, billingTierCode: string): Promise<boolean> {
  const { data: apiResult } = await axios.post<IApiResult<boolean>>(
    getApiUrl(`connect-subscription/cancel/${networkId}/${billingCategoryCode}/${billingTierCode}`),
    {},
    {}
  );
  return apiResult.data
}

export async function getUserProfile(): Promise<UserProfileDto> {
  const { data: apiResult } = await axios.get<ApiResult<UserProfileDto>>(
    getApiUrl("/user-profile")
  );
  return apiResult.data;
}

export async function updateUserProfile(userProfile: UserProfileDto): Promise<void> {
  return await axios.patch(
    getApiUrl("/user-profile"),
    userProfile
  );
}

export async function updateUserAppSettings(setting: AppSettings): Promise<void> {
  return await axios.patch(
    getApiUrl("/users/settings"),
    setting
  )
}

export async function verifyEmailWithToken(userId, token) {
  const { data: apiResult } = await axios.post<IApiResult<boolean>>(
    getApiUrl(`/auth/verify-email`),
    {
      userId, token
    },
    {}
  );
  return apiResult.data
}
