import { Inject, Injectable } from "@nestjs/common";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import OAuthClient from "intuit-oauth";
import { SecretService } from "../../secrets/services/SecretService";
import { UpdateSecretDto } from "@blockspaces/shared/dtos/UserSecrets";
import { QuickbooksOAuthClientToken } from "../types/QuickbooksTypes";
import { QuickbooksClientFactory } from "./QuickbooksClientFactory";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { SecretType } from "../../secrets/types/secret";
import Tokens from "csrf";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";

/** This connects to Quickbooks and returns the token object for HttpService useage. */
@Injectable()
export class QuickbooksClient {
  /** QBO Payments (quickbooks/v4/) BASE URL */
  public qboPaymentsUrl: string;
  /** QBO Accounting (v3) BASE URL  */
  public qboAccountingUrl: string;
  /** QBO Accounts (v1) BASE URL  */
  public qboAccountsUrl: string;
  constructor(@Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger, @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables, private readonly secretService: SecretService, private readonly clientFactory: QuickbooksClientFactory) {
    
    logger.setModule(this.constructor.name);
    // Load the QBO API URLs (6 secperate URLs, 2 for each API based on enviroment.)
    this.qboPaymentsUrl = this.env.quickbooks.environment.toLocaleLowerCase() === "sandbox" ? "https://sandbox.api.intuit.com" : "https://api.intuit.com";
    this.qboAccountingUrl = this.env.quickbooks.environment.toLocaleLowerCase() === "sandbox" ? "https://sandbox-quickbooks.api.intuit.com" : "https://quickbooks.api.intuit.com";
    this.qboAccountsUrl = this.env.quickbooks.environment.toLocaleLowerCase() === "sandbox" ? "https://sandbox-accounts.platform.intuit.com" : "https://accounts.platform.intuit.com";
  }

  // #region CREATE A NEW QUICKBOOKS TOKEN FOR SAVING AS A SECRET.

  /**
   * Get the Autorization URL for use in creating the OAuth Client Token used for access.
   * @param tenantId used for state
   * @returns sutorization URL for callback
   */
  async authorizeUri(tenantId: string): Promise<string> {
    const csrf = new Tokens();
    const state = csrf.create(tenantId);
    const authUri: string = this.clientFactory.getClient().authorizeUri({
      scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
      state: state
    });
    return authUri;
  }

  /**
   * create a new OAuth Client Token.
   *
   * @param url authorized URL
   * @returns valid OAuthClientToken
   */
  async createToken(url: string): Promise<QuickbooksOAuthClientToken> {
    const response = await this.clientFactory.getClient().createToken(url);
    const token: QuickbooksOAuthClientToken = <QuickbooksOAuthClientToken>response.token;
    return token;
  }

  /**
   * refresh an expired token using the refresh token.
   *
   * @param refreshToken OAuth refresh token.
   * @returns refreshec OAuthClientToken
   */
  async refreshUsingToken(token: QuickbooksOAuthClientToken): Promise<QuickbooksOAuthClientToken> {
    return await this.validateOAuthToken(token);
  }

  /**
   * revoke access to quickbooks by token
   *
   * @param token OAuthClientToken to revoke.
   * @returns revoked OAuthClientToken
   */
  async revoke(token: QuickbooksOAuthClientToken): Promise<QuickbooksOAuthClientToken> {
    const response = await this.clientFactory.getClient().revoke(token);
    const result: QuickbooksOAuthClientToken = <QuickbooksOAuthClientToken>response.token;
    return result;
  }

  // #endregion

  // #region HTTP SERVICE ACCESS TOKEN

  /**
   * Get the QBO Client Token for use in Service calls.
   *
   * @param secretId OPTIONAL. No Id is passed then assumtion is Internal use for Blockspaces.
   * @returns a vaild Quickbooks OAuth token.
   */
  async getOAuthClientToken(secretId?: string, tenantId?: string, accessToken?: string): Promise<QuickbooksOAuthClientToken> {
    const _secretId: string = this.setSecretId(secretId);
    const _tenantId: string = this.setTenantId(tenantId);
    // Blockspaces will never pass a tenant Id. so the assumption is external not internal.
    const _isBlockSpace: boolean = tenantId ? false : true;
    /** GET BlockSpace Token Saved in Vault. Saved TOken Works for all Scopes. */
    const vaultResult: ICredentialReference = await this.secretService.use(_secretId, _tenantId, SecretType.QUICKBOOKS, accessToken);

    /** QBO Token from Vault */
    const _authTokenFromVault: QuickbooksOAuthClientToken = <QuickbooksOAuthClientToken>vaultResult.credential;
    /** Get the Token for HTTP useage */
    const newToken: QuickbooksOAuthClientToken = await this.validateOAuthToken(_authTokenFromVault, _isBlockSpace);

    // Now that the token has been refreshed save it back to Vault.
    const _updateSecret: UpdateSecretDto = {
      credentialId: vaultResult.credentialId,
      tenantId: _tenantId,
      newCredential: newToken
    };
    await this.secretService.update(_updateSecret, SecretType.QUICKBOOKS, accessToken);
    // Finally, Return just the access token for use with HttpService.
    return newToken;
  }

  /**
   * Get the renewed Token for use with HTTPService.
   *
   * @param authTokenFromVault qboOAuthClientToken from vault.
   * @returns Valid Token.
   */
  private validateOAuthToken = async (authTokenFromVault: QuickbooksOAuthClientToken, isBlockSpace?: boolean): Promise<QuickbooksOAuthClientToken> => {
    const oauthClient = await this.clientFactory.getClient(isBlockSpace, authTokenFromVault);
    let response: any;
    try {
      response = await oauthClient.refresh();
    } catch (e) {
      this.logger.error('QuickbooksClient.validateOAuthToken: ' + e.message, e);
    }
    return <QuickbooksOAuthClientToken>response.token;
  };

  /**
   * set the secret id based on input. if not passed assume blockspaces account.
   *
   * @param secretId Optional
   * @returns QBO credential Id as string.
   */
  private setSecretId(secretId?: string): string {
    if (!secretId) {
      // Assume BlockSpace Account
      return this.env.quickbooks.blockspace.secretCredentialId;
    } else {
      // Assume Customer Account (Ligtening or similar network)
      return secretId;
    }
  }

  private setTenantId(tenantId?: string): string {
    if (!tenantId) {
      // Assume BlockSpace Tenant
      return this.env.backend.adminTenantId;
    } else {
      // Assume Customer Tenant (Ligtening or similar network)
      return tenantId;
    }
  }

  // #endregion
}
