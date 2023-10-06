import { env } from "../env";

/** public key used to verify signed JWTs */
export const JWT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----\n${env.appId.oauthPublicKey}\n-----END PUBLIC KEY-----`;

/** injection token for the `jsonwebtoken` library */
export const JSON_WEB_TOKEN_LIBRARY_KEY = Symbol("JSON_WEB_TOKEN_LIBRARY");