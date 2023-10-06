/**
 * Standard OAuth2 access token response
 *
 * @see https://www.oauth.com/oauth2-servers/access-tokens/access-token-response/
 */
export interface AccessTokenResponse {

  /** The access token string as issued by the authorization server */
  access_token: string,

  /** A refresh token which applications can use to obtain another access token */
  refresh_token?: string,

  /** The type of token this is, typically just the string “Bearer” */
  token_type: "Bearer",

  /** the duration of time the access token is granted for (in seconds) */
  expires_in: number
}

/**
 * OpenID Connect identity token response
 */
export interface IdentityTokenResponse {

  /** OIDC identity token securely signed by the issuer */
  id_token?: string
}

/**
 * A response that includes both an OAuth2 access token and an OpenID connect identity token
 *
 * @see {@link AccessTokenResponse}
 * @see {@link IdentityTokenResponse}
 */
export type AccessAndIdTokenResponse = AccessTokenResponse & IdentityTokenResponse;