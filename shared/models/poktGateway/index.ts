import { VersionedMongoDbModel } from "../MongoDbModel";
import { IUser } from "../users";


//#region   PoktGateway enum's
export enum GatewayUserAccountStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED'
}
export enum GatewayNetworkStatus {
  REQUESTED = 'REQUESTED',
  CREATED = 'CREATED'
}
export enum GatewaySource {
  POKT='POKT',
  BLOCKSPACES='BLOCKSPACES'
}

//#endregion

//#region  GatewayUserData
export interface GatewayUserData extends VersionedMongoDbModel {
  /**
   * connect user id {@link IUser.id}
   */
  userId:string;
  /**
   * Pokt Gateway User Account Status {@link GatewayUserAccountStatus }
   */
  status: GatewayUserAccountStatus;
  // this way when we migrate to our own, we may need to run both in parallel for some time. IDK ?? 
  // will user id's be same across  ?
  source: GatewaySource;
  /**
   *  id mapping to POKT Portal/Gateway user
   */
  gatewayUserId?: string;
  /**
   * pokt load balancer id
   */
  loadBalancerId?: string;
  /**
   * pokt app it
   */
  appId?: string;
/**
 * Keep track of how many attempts to verify user account
 * can be used to limit attempts 
 */
  verificationCount:number;

}
//#endregion

//#region  GatewayNetwork

export interface IPoktGatewayNetworkWhitelistContracts {
  blockchainID:string,
  contracts: string[]
}

export interface IPoktGatewayNetworkWhitelistMethods {
  blockchainID:string,
  methods: string[]
}

export interface IPoktGatewayNetworkSettings {
  whitelistOrigins: string[];
  whitelistUserAgents: string[];
  whitelistContracts: IPoktGatewayNetworkWhitelistContracts[];
  whitelistMethods: IPoktGatewayNetworkWhitelistMethods[];
  secretKeyRequired: boolean;
  whitelistBlockchains: string[];
}

export  interface IPoktGatewayNetworkData {
  gatewayUserId:string;
  status: GatewayNetworkStatus;
  source: GatewaySource;
  loadBalancerId: string;
  appId: string;
  gatewaySettings: IPoktGatewayNetworkSettings;
  apiPrefix:string;
}

export interface IGatewayNetwork {
  gatewayNetworkData:IPoktGatewayNetworkData;
}
//#endregion
