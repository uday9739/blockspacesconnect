import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { QuickbooksOAuthClientToken } from "../types/QuickbooksTypes";
import { QuickbooksClient } from "../clients/QuickbooksClient";
import { StoreCredentialsDto } from "@blockspaces/shared/dtos/quickbooks";
import { SecretService } from "../../secrets/services/SecretService";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { SecretType } from "../../secrets/types/secret";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";

/** This service handles all the Quickbooks base API methods for creating a new token (storage and use) */
@Injectable()
export class QuickbooksService {
  constructor(
    private readonly qbClient: QuickbooksClient,
    private readonly secretService: SecretService,
    private readonly db: ConnectDbDataContext
  ) {}

  /**
   * Create and store the customer Quickbooks OAuth Token.
   *   NOTE: returns Token for possiable storage in the users browser or another type of storage that is not Vault.
   *
   * @param body {@link StoreCredentialsDto}
   * @param userId {@link string} used to create the UserSecret
   * @param tenantId {@link string} used to create the UserSecret
   * @param accessToken {@link string} users JWT.
   * @returns New {@link quickbooksOAuthClientToken}
   */
  async storeClientToken(body: StoreCredentialsDto, userId: string, tenantId: string, accessToken: string): Promise<QuickbooksOAuthClientToken> {
    // Builds the url for the request to QuickBooks
    const url = body.url + "&realmId=" + body.realmId + "&state=" + body.state;

    // get OAuth Token from Quickbooks
    const token: QuickbooksOAuthClientToken = await this.qbClient.createToken(url);
    if(!token){
      throw new BadRequestException("Failed to create Create Quickbooks OAuth Token");
    }

    // Secret Token to be stored in the vault.
    const newToken: QuickbooksOAuthClientToken = {
      x_refresh_token_expires_in: token.x_refresh_token_expires_in,
      refresh_token: token.refresh_token,
      access_token: token.access_token,
      token_type: token.token_type,
      expires_in: token.expires_in,
      realmId: token.realmId
    };
    const response: ICredentialReference = await this.secretService.create(
      {
        label: "QuickBooks",
        description: "Credentials granting access to a customer's Quickbooks Online account",
        credential: newToken,
        userId: userId,
        tenantId: tenantId
      },
      tenantId,
      userId,
      SecretType.QUICKBOOKS,
      accessToken
    );
    if(response){
      return newToken;
    } else {
      throw new BadRequestException("Failed to create Mongo Collection.");
    }
  };

  /**
   * Create a new customer Quickbooks OAuth access token.
   *
   * @param tenantId {@link string} used for creating the authorize Url state.
   * @returns URL string for callback.
   */
  async authorizeUri(tenantId: string): Promise<string> {
    return await this.qbClient.authorizeUri(tenantId);
  }

  /**
   * Refresh a token that is not stored in Mongo DB.
   * @param tenantId {@link string} used for getting node data and token creation.
   * @param accessToken {@link string} used for connection to vault.
   * @returns Promise of {@link quickbooksOAuthClientToken}
   */
  async refresh(tenantId?: string, accessToken?: string): Promise<QuickbooksOAuthClientToken> {
    let secretId: string;
    if(tenantId){
      const secretData = await this.db.userSecrets.findOne({ tenantId: tenantId, description: "QuickBooks"});
      if(secretData){
        secretId = secretData.credentialId;
      } else {
        throw new NotFoundException("User Secrets did not find a Tenant with QuickBooks connection. Please try again.");
      }
    }

    return await this.qbClient.getOAuthClientToken(
      secretId,
      tenantId,
      accessToken);
  }

  /**
   * revoke token access for a specific token supplied.
   *  NOTE: Mainly used for tokens Not stored using secretService.
   * @param token {@link quickbooksOAuthClientToken} to be revoked.
   * @returns revoked {@link quickbooksOAuthClientToken}
   */
  async revoke(token: QuickbooksOAuthClientToken): Promise<QuickbooksOAuthClientToken> {
    return await this.qbClient.revoke(token);
  }



  // getCompanyInfo = async (): Promise<quickbooksCompanyInfo> => {
  //   const qboToken: quickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken();
  //   const _axiosResponse: AxiosResponse<quickbooksCompanyInfo> = await this.httpService.request({
  //     baseURL: this.qbClient.qboAccountingUrl,
  //     url: "/v3/company/" + qboToken.realmId + "/companyinfo/" + qboToken.realmId,
  //     timeout: this.httpTimeout,
  //     method: "GET",
  //     validErrorStatuses: [HttpStatus.NOT_FOUND],
  //     headers: {
  //       Authorization: `Bearer ${qboToken.access_token}`
  //     }
  //   });
  //   return _axiosResponse.data;
  // };
  // getUserInfo = async (): Promise<quickbooksUserInfoResults> => {
  //   const qboToken: quickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken();
  //   const _axiosResponse: AxiosResponse<quickbooksUserInfoResults> = await this.httpService.request({
  //     baseURL: this.qbClient.qboAccountsUrl,
  //     url: "/v1/openid_connect/userinfo",
  //     timeout: this.httpTimeout,
  //     method: "GET",
  //     validErrorStatuses: [HttpStatus.NOT_FOUND],
  //     headers: {
  //       Authorization: `Bearer ${qboToken.access_token}`
  //     }
  //   });
  //   return _axiosResponse.data;
  // };
}
