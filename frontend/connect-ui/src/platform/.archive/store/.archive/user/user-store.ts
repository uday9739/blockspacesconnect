// import { InitialLoginResultDto } from '@blockspaces/shared/dtos/authentication/initial-login'
// import ApiResult from '@blockspaces/shared/models/ApiResult'
// import { UserNetwork } from '@blockspaces/shared/models/networks'
// import { localStorageHelper } from 'src/platform/utils'
// import { action, computed, makeAutoObservable, runInAction, toJS } from 'mobx'
// import { ObservableUser } from 'src/platform/api'
// import { UserNetworkTransport } from "src/platform/api";
// import { UserTransport } from './user-transport'
// import config from 'config';
// import { ILoginResponse } from '@blockspaces/shared/dtos/authentication/LoginResponse';
// import { UserProfileDto, UserRegistrationDto, UserRegistrationResultDto } from '@blockspaces/shared/dtos/users';
// import { GatewayUserAccountStatus } from '@blockspaces/shared/models/poktGateway'
// import { TwoFactorConfigResultDto } from '@blockspaces/shared/dtos/authentication/two-factor-auth-configuration'
// import { TwoFactorLoginResultDto } from '@blockspaces/shared/dtos/authentication/two-factor-auth-login'
// import { ConnectSubscriptionExpandedDto } from "@blockspaces/shared/dtos/connect-subscription/ConnectSubscriptionDto"
// import { NetworkPriceBillingCodes } from '@blockspaces/shared/models/network-catalog'
// import { PlatformApiResponse, PlatformStatus } from "@blockspaces/shared/models/platform";
// export class UserStore {

//   private static readonly TOKEN_EXPIRY_KEY = "__token_expiry__";

//   /** current user */
//   user: ObservableUser

//   /** the expiration date of the user's access token, represented as milliseconds since 1970-01-01 UTC */
//   tokenExpiry?: number;

//   /** true if the user store has been fully initialized */
//   isInitialized: boolean;

//   /** user's subscription status */
//   subscription: ConnectSubscriptionExpandedDto;


//   constructor(
//     private readonly transport: UserTransport = UserTransport.instance,
//     private readonly userNetworkTransport: UserNetworkTransport = UserNetworkTransport.instance
//   ) {
//     makeAutoObservable(this);

//     this.user = null;
//     this.tokenExpiry = this.loadTokenExpiry()
//     this.isInitialized = false;
//   }

//   /** the path to the default page, for the current user */
//   // get defaultStartingPath(): string {
//   //   if (!this.isLoggedIn)
//   //     return "/auth";

//   //   // if (!this.user.acceptedTerms)
//   //   //   return "/terms-of-service"

//   //   // if (!this.user.viewedWelcome)
//   //   //   return "/welcome"

//   //   if (this.user.connectedNetworks?.length) {
//   //     return "/connect";
//   //   }

//   //   return "/connect?modal=add-app"
//   // }

//   /** Returns true if a user is currently logged in */
//   get isLoggedIn(): boolean {
//     return this.isInitialized && this.user && !this.isDefaultUser;
//   }

//   get isDefaultUser(): boolean {
//     return this.user === ObservableUser.default;
//   }

//   /** Returns true if the token expiration date is currently valid (isn't expired or has no value) */
//   get tokenExpiryValid(): boolean {
//     return this.tokenExpiry && this.tokenExpiry >= Date.now();
//   }

//   @computed
//   get getPoktGatewayStatus(): string {
//     return this.user?.gatewayUser?.status
//   }
//   @computed
//   get hasUserRequestedDeveloperOffering(): boolean {
//     return this.isPoktGatewayConfirmed || this.user?.gatewayUser?.status === GatewayUserAccountStatus.REQUESTED;
//   }
//   @computed
//   get isPoktGatewayConfirmed(): boolean {
//     return this.user?.gatewayUser?.status === GatewayUserAccountStatus.CONFIRMED
//   }

//   clearTokenExpiry() {
//     localStorageHelper.removeItem(UserStore.TOKEN_EXPIRY_KEY);
//     this.tokenExpiry = null;
//   }

//   /**
//    * Adds a connection between the current user and the given blockchain network.
//    *
//    * @returns
//    * * newly added UserNetwork data if the operation was successful
//    * * null if the user is not logged in or has already connected with the network
//    */
//   async addNetworkConnection(networkId: string): Promise<UserNetwork> {
//     if (!this.isLoggedIn) {
//       return null;
//     }

//     const userNetwork: UserNetwork = await this.userNetworkTransport.addUserNetwork(networkId);

//     if (!userNetwork) return null;

//     runInAction(() => this.user.connectedNetworks.push(networkId));
//     return userNetwork;
//   }

//   /** Returns true if the given password reset context value is valid */
//   async confirmPasswordResetContext(context: string): Promise<boolean> {
//     if (!context) return false;

//     const result = await this.transport.getForgotPasswordConfirmResult(context);
//     return result.isSuccess;
//   }

//   /** If user is logged in, checks if their auth token/cookie is still valid. If not, the user will be logged out  */
//   async doLoginCheck() {
//     const result = await this.transport.checkHeartbeat();

//     if (!result.isLoggedIn) {
//       console.debug("User's auth token is no longer valid. Logging out.");
//       this.logout();
//     }
//   }

//   /**
//    * Fetch 2FA configuration data for a given user
//    */
//   async getTwoFactorSetupData(username: string, password: string): Promise<TwoFactorConfigResultDto> {
//     return await this.transport.configure2fa(username, password);
//   }

//   /**
//    * Get the profile data for the currently logged in user
//    */
//   async getUserProfile(): Promise<UserProfileDto> {
//     if (!this.isLoggedIn) {
//       return null;
//     }

//     return await this.transport.getUserProfile()
//   }

//   async refreshUser(newNetwork?: string) {
//     const userResult = await this.transport.getCurrentUser();
//     if (userResult.isFailure) {
//       return;
//     }

//     const userData = userResult.data;

//     const subscription = await this.transport.getSubscriptionStatus();
//     runInAction(() => this.subscription = subscription.data)


//     if (newNetwork && userData.connectedNetworks?.indexOf(newNetwork) < 0) {
//       runInAction(() => userData.connectedNetworks.push(newNetwork))
//     }

//     this.setUser(new ObservableUser(userData));
//   }

//   removeUserNetwork(newNetwork: string) {
//     runInAction(() => {
//       this.user.connectedNetworks = this.user.connectedNetworks.filter(x => x !== newNetwork)
//     })
//   }

//   addUserNetwork(newNetwork: string) {
//     runInAction(() => {
//       this.user.connectedNetworks = (this.user.connectedNetworks || []).concat([newNetwork])
//     })
//   }

//   /**
//    * Initialize the user store
//    */
//   async initialize(): Promise<void> {
//     if (!this.tokenExpiryValid) {
//       this.initializeForDefaultUser();
//       return;
//     }

//     const userResult = await this.transport.getCurrentUser();
//     if (userResult.isFailure) {
//       this.initializeForDefaultUser();
//       return;
//     }

//     const userData = userResult.data;

//     this.setUser(new ObservableUser(userData));

//     const subscription = await this.transport.getSubscriptionStatus();
//     runInAction(() => this.subscription = subscription.data)

//     runInAction(() => this.isInitialized = true);
//   }

//   /** Initialize the store using default user info */
//   private initializeForDefaultUser(): void {
//     this.clearTokenExpiry();
//     this.setUser(ObservableUser.default);
//     runInAction(() => this.isInitialized = true);
//     runInAction(() => this.subscription = undefined);
//   }

//   /**
//    * Verifies a user's username and password, prior to verifying a 2FA code.
//    * This should be used as the 1st step in the login process, prior to checking the user's 2FA code
//    */
//   async doInitialLogin(username, password): Promise<InitialLoginResultDto> {
//     return await this.transport.initialLogin(username, password);
//   }

//   /**
//    * Attempts to log a user in via 2FA.
//    */
//   async cancelSubscription(networkId: string, billingCategoryCode: NetworkPriceBillingCodes): Promise<boolean> {
//     const isCancelled = await this.transport.cancelSubscription(networkId, billingCategoryCode)
//     return isCancelled;
//   }

//   /**
//    * Attempts to log a user in via 2FA.
//    */
//   async loginTwoFactor(username: string, password: string, twoFactorCode: string): Promise<TwoFactorLoginResultDto> {
//     const result = await this.transport.login2fa(username, password, twoFactorCode)

//     if (!result.success) return result;

//     this.setUser(new ObservableUser(result.userDetails));

//     // TODO update to use data returned from API
//     // sets expiration to be 24 hours from "now"
//     this.setTokenExpiry(Date.now() + (24 * 60 * 60 * 1000))

//     return result;
//   }

//   /** Logs user out by clearing their auth cookies and resetting the store to defaults */
//   async logout() {
//     this.initializeForDefaultUser();
//     await this.transport.logout();
//   }

//   async register(userRegistration: UserRegistrationDto): Promise<UserRegistrationResultDto> {
//     const apiResult = await this.transport.register(userRegistration);
//     return apiResult.data;
//   }

//   /** request a "Forgot Password" email be sent to the given email address */
//   async requestForgotPasswordEmail(email: string): Promise<any> {
//     await this.transport.forgotPassword(email);
//   }

//   /** Resend a verification email */
//   async resendVerificationEmail(email: string) {
//     await this.transport.verifyEmail(email);
//   }

//   /**
//    * Resets a user's password
//    * @param newPassword the new password the user wishes to set
//    * @param context the unique context ID that is used to validate the user's request
//    */
//   async resetPassword(newPassword: string, context: string): Promise<ApiResult> {
//     if (!newPassword || !context) {
//       return ApiResult.failure("A valid password and context must be provided");
//     }

//     return await this.transport.resetPassword(newPassword, context);
//   }

//   @action
//   setUser(user: ObservableUser) {
//     this.user = user;
//   }

//   setTokenExpiry(tokenExpiry: number) {
//     this.tokenExpiry = tokenExpiry;
//     localStorageHelper.setItem(UserStore.TOKEN_EXPIRY_KEY, tokenExpiry.toFixed());
//   }

//   async setWelcomeFlag() {
//     if (!this.isLoggedIn) return;

//     await this.transport.setWelcomeFlag()
//     this.user.setViewedWelcome();
//   }

//   async updateUserProfile(userProfile: UserProfileDto): Promise<void> {
//     await this.transport.updateUserProfile(userProfile);
//   }

//   private loadTokenExpiry(): number {

//     const tokenExpiryValue = localStorageHelper.getItem(UserStore.TOKEN_EXPIRY_KEY);
//     return parseInt(tokenExpiryValue);
//   }




// }
