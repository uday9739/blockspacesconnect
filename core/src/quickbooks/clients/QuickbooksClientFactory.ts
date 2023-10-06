import { Injectable, Inject } from "@nestjs/common";
import OAuthClient from "intuit-oauth";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { QuickbooksOAuthClientToken } from "../types/QuickbooksTypes";


/** Connects to QuickBooks and gets all paramerters needed for HTTPService calls. */
@Injectable()
export class QuickbooksClientFactory {
  private _oAuthClient: OAuthClient;
  constructor(@Inject(ENV_TOKEN) private readonly env: EnvironmentVariables){ this._oAuthClient; };

  /**
   * Create a new OAuth object for useage.
   *
   * @param token OPTIONAL assumption is if no token is passed then create a token-less OAuthClient
   * @returns
   */
  getClient( isBlockSpace?: boolean, token?: QuickbooksOAuthClientToken): OAuthClient {
    return this.createOAuthClient(isBlockSpace, token);
  };

  /**
   * Create a OAuth Client with token from Vault.
   * @param token Passed in from getClient.
   * @returns newly created OAuth Client object w/token from vault.
   */
  private createOAuthClient = (isBlockSpace?: boolean, token?: QuickbooksOAuthClientToken): OAuthClient => {
    this._oAuthClient = new OAuthClient({
      // TODO This needs to call the values for the client NOT blockspaces...
      clientId: isBlockSpace ? this.env.quickbooks.blockspace.clientId : this.env.quickbooks.clientId,
      clientSecret: isBlockSpace ? this.env.quickbooks.blockspace.clientSecret : this.env.quickbooks.clientSecret,
      environment: this.env.quickbooks.environment,
      redirectUri: this.env.quickbooks.callbackUrl,
      logging: this.env.quickbooks.environment.toLocaleLowerCase() === "sandbox" ? false : true,
    });
    if(token){
      this._oAuthClient.setToken({
        realmId: token.realmId,
        token_type: token.token_type,
        refresh_token: token.refresh_token,
        access_token: token.access_token,
        expires_in: token.expires_in,
        x_refresh_token_expires_in: token.x_refresh_token_expires_in,
        id_token: token.id_token
      });
    }
    return this._oAuthClient;
  };
};