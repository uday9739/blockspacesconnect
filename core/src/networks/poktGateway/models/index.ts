import ApiResult, { ApiResultStatus, ApiResultWithError, IApiResult } from "@blockspaces/shared/models/ApiResult";
import { UserNetwork } from "@blockspaces/shared/models/networks";
import { GatewaySource, GatewayUserData } from "@blockspaces/shared/models/poktGateway";

//#region PoktGatewayProvisioningService Specific

export class RegisterUserResult extends ApiResultWithError<GatewayUserData, string> {}

export class VerifyUserResult extends ApiResultWithError<GatewayUserData, string> {}

export class CreateNetworkEndpointForUserResult extends ApiResultWithError<CreateNetworkEndpointForUserResponse, string> {}

export class CreateNetworkEndpointForUserResponse {
  gatewayUser: GatewayUserData;
  network: UserNetwork<any>;
}

//#endregion

//#region  PoktGatewayService Specific

export class CreateUserAccountResult extends ApiResultWithError<{ source: GatewaySource }, string> {}

export class AuthenticateUserAccountResult extends ApiResultWithError<PoktGatewayLoginResponse, string> {}

export class CreateApplicationResult extends ApiResultWithError<PoktGatewayApplicationResponse, string> {}

export class UpdateApplicationResult extends ApiResultWithError<boolean, string> {}

interface PoktGatewayLoginResponse {
  status: string;
  token: string;
  data: PoktGatewayLoginResponseUserData;
}

interface PoktGatewayLoginResponseUserData {
  user: PoktGatewayUser;
}

interface PoktGatewayUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  validated: boolean;
  v2: boolean;
  __v: number;
}

export interface GatewaySettings {
  whitelistOrigins: string[];
  whitelistUserAgents: any[];
  whitelistContracts: any[];
  whitelistMethods: any[];
  secretKeyRequired: boolean;
  whitelistBlockchains: any[];
}

//#region  PoktGatewayApplicationResponse
interface App {
  appId: string;
  address: string;
  publicKey: string;
}
interface NotificationSettings {
  signedUp: boolean;
  quarter: boolean;
  half: boolean;
  threeQuarters: boolean;
  full: boolean;
}
export interface PoktGatewayApplicationResponse {
  chain: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  id: string;
  freeTier: boolean;
  gigastake: boolean;
  status: string;
  apps: App[];
  user: string;
  gatewaySettings: GatewaySettings;
  notificationSettings: NotificationSettings;
}
//#endregion

//#endregion
