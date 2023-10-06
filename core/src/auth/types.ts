import { TwoFactorSetupStatus } from "@blockspaces/shared/models/users";
import jwt from "jsonwebtoken";

/** the decoded payload of a JWT from BlockSpaces' authentication system (IBM AppId) */
export interface BlockSpacesJwtPayload extends BaseJwtPayload {

  /** denotes whether or not the user has setup two-factor auth */
  twofastatus?: TwoFactorSetupStatus

  /** Encoded jwt */
  accessToken: string

}

/** the decoded payload of a 2FA JWT from BlockSpaces' */
export interface BlockSpacesTwoFactorAuthJwtPayload extends BaseJwtPayload {

  /** User's Email address */
  email: string

}

/**
 * Represents the members of the `jsonwebtoken` package
 *
 * @see https://www.npmjs.com/package/jsonwebtoken
 */
export type JsonWebTokenLibrary = typeof jwt;


export interface IRequestUserTwoFactorStatusReset {
  email: string
}

/**
 * Export JwtPayload, make sure only this file imports `jsonwebtoken`
 */
export interface BaseJwtPayload extends jwt.JwtPayload { }