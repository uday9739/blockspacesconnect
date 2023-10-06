//#region imports
import { IUser } from "@blockspaces/shared/models/users";
import { Inject, Injectable, NotImplementedException } from "@nestjs/common";
import GatewayProxyService, { GatewayUserCredentials } from "./PoktGatewayService";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { CreateNetworkEndpointForUserResult, GatewaySettings, RegisterUserResult, VerifyUserResult } from "../models";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { Network, NetworkId, UserNetwork } from "@blockspaces/shared/models/networks";
import {
  IGatewayNetwork,
  IPoktGatewayNetworkData,
  IPoktGatewayNetworkSettings,
  GatewayNetworkStatus,
  GatewaySource,
  GatewayUserAccountStatus,
  GatewayUserData
} from "@blockspaces/shared/models/poktGateway";
import { UserDataService } from "../../../users/services/UserDataService";
import { UserNetworkOptimism } from "@blockspaces/shared/models/networks/OptimismNetwork";
import { OptimismNetworkData } from "@blockspaces/shared/models/networks/OptimismNetwork";
import { MongooseRepository } from "../../../mongoose/services/MongooseRepository";
import { PoktSupportedChains } from "../models/PoktSupportedChains";
//#endregion

@Injectable()
export default class GatewayProvisioningService {
  private readonly AutoVerifyGatewayAccount = false;
  constructor(
    private readonly poktGatewayProxy: GatewayProxyService,
    private readonly userDataService: UserDataService,
    private readonly dataContext: ConnectDbDataContext,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {
    logger.setModule(this.constructor.name);}

  /**
   * Create a network endpoint
   * @param user
   * @param chain
   */
  public async CreateNetworkEndpointForUser(userId: string, networkId: string): Promise<CreateNetworkEndpointForUserResult> {
    //#region get user
    let user = await this.userDataService.getUserById(userId);
    if (!user) return RegisterUserResult.failure("user not found");
    let credentials = this._getUserCredentials(user);
    //#endregion

    //#region get pokt user data
    let poktUserData: GatewayUserData = await this._getGatewayUserHelper(user.id);
    if (!poktUserData) {
      // user hasn't been registered yet, create pokt gateway account
      let registerUserResponse = await this._createUserAccount(user.id, credentials);
      if (registerUserResponse.isFailure) return CreateNetworkEndpointForUserResult.failure(registerUserResponse.message);
      poktUserData = registerUserResponse.data;
    }
    //#endregion

    //#region Create User Network
    let userNetworkResult = await this._createOrUpdateUserNetworkHelper(user, poktUserData, networkId);
    if (!userNetworkResult) return CreateNetworkEndpointForUserResult.failure(`Error creating endpoint for ${networkId}`);
    //#endregion

    //#region AutoVerifyGatewayAccount
    if (this.AutoVerifyGatewayAccount) {
      let verifyUserResult = await this._verifyUserHelper(user, credentials);
      if (verifyUserResult.isFailure) {
        this.logger.error("Error auto verify gateway account ");
      } else {
        poktUserData = verifyUserResult.data;
      }
    }
    //#endregion

    return CreateNetworkEndpointForUserResult.success({
      gatewayUser: poktUserData,
      network: userNetworkResult
    });
  }
  /**
   * Verify Gateway User account.
   * @param userId
   * @returns
   */
  public async VerifyUser(userId: string): Promise<VerifyUserResult> {
    let user = await this.userDataService.getUserById(userId);
    if (!user) return RegisterUserResult.failure("user not found");
    let credentials = this._getUserCredentials(user);
    return this._verifyUserHelper(user, credentials);
  }

  /**
   * This method calls {@link GatewayProxyService.AuthenticateUserAccount}
   * If successful will update related {@link GatewayUserData} for user
   *
   * @param user
   */
  private async _verifyUserHelper(user: IUser, credentials?: GatewayUserCredentials): Promise<VerifyUserResult> {
    credentials = credentials || this._getUserCredentials(user);
    let gatewayAppId: string;
    let gatewayLbId: string;
    let gatewaySettings: GatewaySettings = null;
    let verificationCount = 1;
    //#region Get Gateway User
    let gatewayUserData = await this._getGatewayUserHelper(user.id);
    if (!gatewayUserData) return VerifyUserResult.failure(`User not registered for gateway`);
    //#endregion

    //#region Handle CONFIRMED
    if (gatewayUserData.status === GatewayUserAccountStatus.CONFIRMED) {
      return VerifyUserResult.success(gatewayUserData);
    }
    //#endregion
    //#region Handle REQUESTED
    else if (gatewayUserData.status === GatewayUserAccountStatus.REQUESTED) {
      verificationCount = (gatewayUserData.verificationCount || 0) + 1;
      //#region verify user account by attempting to login in
      let authUserResponse = await this.poktGatewayProxy.AuthenticateUserAccount(credentials);
      if (authUserResponse.isFailure) {
        gatewayUserData.verificationCount = verificationCount;
        gatewayUserData = (await this.dataContext.gatewayUser.updateByIdAndSave(gatewayUserData._id, gatewayUserData))?.toObject();
        this.logger.error(`Error calling poktGateway.AuthenticateUserAccount for userId:${user.id}. Error msg: ${authUserResponse.message}, verificationCount ${verificationCount}`);
        return VerifyUserResult.failure(authUserResponse.message, authUserResponse.error);
      }
      let authUserResponseData = authUserResponse.data;
      //#endregion

      //#region Create Application
      let applicationResult = await this.poktGatewayProxy.CreateApplication(credentials, user.id);
      if (applicationResult.isFailure) return VerifyUserResult.failure(applicationResult.message || "Error creating user application");
      gatewayAppId = applicationResult.data.apps[0].appId;
      gatewayLbId = applicationResult.data.id;
      gatewaySettings = applicationResult.data.gatewaySettings;
      //#endregion

      //#region Update gatewayUserData
      gatewayUserData.verificationCount = verificationCount;
      gatewayUserData.appId = gatewayAppId;
      gatewayUserData.loadBalancerId = gatewayLbId;
      gatewayUserData.gatewayUserId = authUserResponseData.data.user._id;
      gatewayUserData.status = GatewayUserAccountStatus.CONFIRMED;
      gatewayUserData = (await this.dataContext.gatewayUser.updateByIdAndSave(gatewayUserData._id, gatewayUserData))?.toObject();
      //#endregion

      //#region Fetch Requested User Networks & set as Confirmed
      let requestedUserNetworks = await this.dataContext.userNetworks.find(
        {
          userId: user.id,
          $and: [
            {
              networkData: {
                $ne: null
              }
            },
            {
              $and: [
                {
                  networkData: {
                    gatewayNetworkData: {
                      $ne: null
                    }
                  }
                },
                {
                  networkData: {
                    gatewayNetworkData: {
                      status: GatewayNetworkStatus.REQUESTED
                    }
                  }
                }
              ]
            }
          ]
        },
        { networkId: 1 }
      );
      const tasks = requestedUserNetworks.map(async (network) => await this._createOrUpdateUserNetworkHelper(user, gatewayUserData, network.networkId, gatewaySettings));
      await Promise.all(tasks);
      //#endregion
    }
    //#endregion

    return VerifyUserResult.success(gatewayUserData);
  }

  //#region Helper Methods
  /**
   * This method handles Network specific implementation
   * To add a new network add a new case in the switch statement for the target network and add the required steps documented
   * @param user
   * @param poktUserData
   * @param networkId
   * @param gatewaySettings
   * @returns
   */
  private async _createOrUpdateUserNetworkHelper(user: IUser, poktUserData: GatewayUserData, networkId: string, gatewaySettings?: IPoktGatewayNetworkSettings): Promise<UserNetwork<any>> {
    let userNetworkResult: UserNetwork<any> = null;
    let repo: MongooseRepository<UserNetwork<any>> = null;
    let status: GatewayNetworkStatus = poktUserData.status === GatewayUserAccountStatus.CONFIRMED ? GatewayNetworkStatus.CREATED : GatewayNetworkStatus.REQUESTED;
    let poktChainData = PoktSupportedChains.find((x) => x.networkId == networkId && x.supported);
    let genericPoktGatewayNetworkData: IPoktGatewayNetworkData = {
      gatewayUserId: poktUserData.gatewayUserId,
      status: status,
      source: this.poktGatewayProxy.Source,
      loadBalancerId: poktUserData.loadBalancerId,
      appId: poktUserData.appId,
      gatewaySettings: gatewaySettings,
      apiPrefix: poktChainData?.portalApiPrefix
    };

    /**
     * Generic type. cast to proper type when setting below for target network
     */
    let userNetwork: any = null;
    let networkData: IGatewayNetwork = null;
    switch (networkId) {
      /**
       * Network specific implementations
       * Each network should implement the following 4 steps
       * 1) set repo reference
       * 2) check if user network is already present
       * 3) handle new network request
       * 4) handle update network request
       */
      case NetworkId.OPTIMISM:
        {
          //#region 1) set repo reference
          repo = this.dataContext.optimismNetwork;
          //#endregion

          //#region 2) check if user network is already present
          userNetwork = (await repo.findOne({ userId: user.id, networkId }))?.toObject<UserNetworkOptimism>();
          //#endregion

          //#region 3) handle new network request
          if (!userNetwork) {
            userNetwork = { userId: user.id, networkId: NetworkId.OPTIMISM, networkData: new OptimismNetworkData(genericPoktGatewayNetworkData) } as UserNetworkOptimism;
          }
          //#endregion

          //#region 4) handle update network request
          else if (!userNetwork.networkData) {
            // this will never get called
            networkData = new OptimismNetworkData(genericPoktGatewayNetworkData);
          }
          //#endregion
        }
        break;
      default:
        return null;
    }

    //#region Persist Data & set Results
    if (userNetwork._id === undefined) {
      userNetworkResult = (await repo.create(userNetwork)).toObject();
    } else {
      if (!userNetwork.networkData) {
        (userNetwork.networkData as IGatewayNetwork) = networkData;
      } else {
        (userNetwork.networkData as IGatewayNetwork).gatewayNetworkData.appId = genericPoktGatewayNetworkData.appId;
        (userNetwork.networkData as IGatewayNetwork).gatewayNetworkData.loadBalancerId = genericPoktGatewayNetworkData.loadBalancerId;
        (userNetwork.networkData as IGatewayNetwork).gatewayNetworkData.gatewayUserId = genericPoktGatewayNetworkData.gatewayUserId;
        (userNetwork.networkData as IGatewayNetwork).gatewayNetworkData.status = genericPoktGatewayNetworkData.status;
        (userNetwork.networkData as IGatewayNetwork).gatewayNetworkData.apiPrefix = genericPoktGatewayNetworkData.apiPrefix;
        //should this be a deep merge ??
        (userNetwork.networkData as IGatewayNetwork).gatewayNetworkData.gatewaySettings =
          (userNetwork.networkData as IGatewayNetwork).gatewayNetworkData.gatewaySettings || genericPoktGatewayNetworkData.gatewaySettings;
      }
      userNetworkResult = (await repo.updateByIdAndSave(userNetwork._id, userNetwork))?.toObject();
      //#endregion
    }

    return userNetworkResult;
  }

  /**
   * This method will create a user account calling {@link GatewayProxyService.CreateUserAccount}
   * This will also create a instance of PoktGatewayUserData
   * @param user
   */
  private async _createUserAccount(userId: string, credentials: GatewayUserCredentials): Promise<RegisterUserResult> {
    let createPoktGatewayUserAccountResponse = await this.poktGatewayProxy.CreateUserAccount(credentials);
    if (createPoktGatewayUserAccountResponse.isFailure) return RegisterUserResult.failure(createPoktGatewayUserAccountResponse.message, createPoktGatewayUserAccountResponse.error);

    let newPoktGatewayUser: GatewayUserData = {
      appId: null, // this will be populated once user account is verified
      loadBalancerId: null, // this will be populated once user account is verified
      gatewayUserId: null, // this will be populated once user account is verified
      source: createPoktGatewayUserAccountResponse.data.source,
      status: GatewayUserAccountStatus.REQUESTED,
      userId: userId,
      verificationCount: 0
    };
    const poktGatewayUserData = (await this.dataContext.gatewayUser.create(newPoktGatewayUser)).toObject();
    return RegisterUserResult.success(poktGatewayUserData);
  }

  private async _getGatewayUserHelper(userId): Promise<GatewayUserData> {
    let poktUserDataQuery = await this.dataContext.gatewayUser.findOne({ userId: userId });
    return poktUserDataQuery?.toObject<GatewayUserData>();
  }

  private _getUserCredentials(user: IUser): GatewayUserCredentials {
    return new GatewayUserCredentials(user.id, user.email);
  }

  //#endregion
}
