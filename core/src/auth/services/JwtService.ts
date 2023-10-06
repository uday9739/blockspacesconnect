import { AuthFailureReason } from '@blockspaces/shared/types/authentication';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppIdService } from '../../app-id';
import { JWT_PUBLIC_KEY } from '../constants';
import { BaseJwtPayload, BlockSpacesJwtPayload, BlockSpacesTwoFactorAuthJwtPayload } from '../types';
import { JwtLibraryWrapper } from './JwtLibraryWrapper';
import { returnErrorStatus } from "../../exceptions/utils";
import ApiResult from '@blockspaces/shared/models/ApiResult';
import { JsonWebTokenError, decode } from 'jsonwebtoken';
import { ConnectDbDataContext } from '../../connect-db/services/ConnectDbDataContext';
import { v4 } from "uuid"
import crypto from "crypto"



/**
 * Provides functionality for working with JSON Web Tokens (JWTs) within the BlockSpaces platform
 */
@Injectable()
export class JwtService {
  private readonly randomString2faSecret: string;
  constructor(
    private readonly appIdService: AppIdService,
    private readonly jwtLibrary: JwtLibraryWrapper,
    private readonly db: ConnectDbDataContext
  ) {
    this.randomString2faSecret = Math.random().toString(36).slice(-8);
  }

  /**
   * Given a username and password, will attempt to get a JWT access token and validate it
   */
  async getJwt(email: string, password: string): Promise<GetJwtResult> {
    const tokenResult = await this.appIdService.getUserTokens(email, password);
    if (!tokenResult.success) {
      return {
        success: false,
        failureReason: tokenResult.failureReason
      }
    }

    const { tokens } = tokenResult;

    if (!tokens?.access_token) {
      return {
        success: false,
        failureReason: AuthFailureReason.INVALID_JWT
      }
    }

    let jwtPayload: BlockSpacesJwtPayload;

    try {
      jwtPayload = this.verifyJwt(tokens.access_token);
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        return {
          success: false,
          failureReason: AuthFailureReason.INVALID_JWT,
          message: err.message
        }
      }

      throw err;
    }

    return {
      success: true,
      payload: jwtPayload,
      jwtEncoded: tokens.access_token
    };
  }

  /**
   * Decodes a JWT without verifying the signature
   */
  decodeJwt<T extends BaseJwtPayload = BlockSpacesJwtPayload>(jwt: string): T {
    return this.jwtLibrary.decode(jwt) as T;
  }

  /**
   * Verifies a JWT against a key.
   *
   * If the JWT is valid, the decoded payload will be returned.
   *
   * If the JWT is invalid, a `JsonWebTokenError` will be thrown
   */
  verifyJwt<T extends BaseJwtPayload = BlockSpacesJwtPayload>(jwt: string, secretOrPublicKey: string = JWT_PUBLIC_KEY): T {
    return this.jwtLibrary.verify(jwt, secretOrPublicKey) as T;
  }

  /**
 * Given a userId, will create a JWT that will live for 5 minutes. For 2fa use only
 */
  async get2faJwt(userId: string, emailAddress: string, expirationInMins: number = 5): Promise<Get2faJwtResult> {

    const payload = { sub: userId, email: emailAddress, exp: Math.floor(Date.now() / 1000) + (60 * expirationInMins) };
    const signedJwt = this.jwtLibrary.sign(payload, this.randomString2faSecret, { issuer: "BlockSpaces Connect" });

    return {
      success: true,
      payload: payload,
      jwtEncoded: signedJwt
    }
  }
  /**
   * Verifies the 2fa JWT 
   *
   * If the JWT is valid, the decoded payload will be returned.
   *
   * If the JWT is invalid, a `TwoFactorAuthJsonWebTokenError` will be thrown
   */
  async verify2faJwt(twoFactorAuthJwt: string): Promise<Get2faJwtResult> {
    try {
      const response = this.verifyJwt<BaseJwtPayload>(twoFactorAuthJwt, this.randomString2faSecret);

      if (typeof response === "string") {
        return {
          success: false,
          failureReason: response
        }
      }
      return {
        success: true,
        payload: response as BlockSpacesTwoFactorAuthJwtPayload
      }
    } catch (error) {
      if ("JsonWebTokenError" === error.name) {
        return {
          success: false,
          failureReason: error.message
        }
      }
      returnErrorStatus(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ApiResult.failure(`Error while verifying request.`),
        { log: true }
      )
    }
  }

  async revokeJwt(token: string): Promise<void> {
    if (!token) return

    // Decode token to get the expiry
    const jwt = decode(token, { complete: true })
    const payload = jwt.payload as BlockSpacesJwtPayload

    // Create a hash of the token
    const hmac = crypto.createHmac("md5", "revoke-token")
    const hash = hmac.update(token).digest("hex")

    // Add revoked token to the mongo db
    try {
      await this.db.revokedTokens.create({ tokenId: hash, expiry: payload.exp });
    } catch (error) {
      if (error.code === 11000) {
        // "E11000 duplicate key error
      } else {
        throw (error)
      }
    }
    return
  }
}

class BaseJwtResult<T extends BaseJwtPayload> {
  /** 
   * true if JWT was retrieved successfully 
   * */
  success: boolean;

  /** 
   * the encoded JWT string 
   * */
  jwtEncoded?: string;

  /** 
   * the decoded JWT payload 
   * */
  payload?: T;

  /** 
   * if set, the reason that JWT retrieval failed
   *  */
  failureReason?: AuthFailureReason | string;

  /** 
   * error message 
   * */
  message?: string;
}

/** the result returned from {@link JwtService.getJwt} */
export class GetJwtResult extends BaseJwtResult<BlockSpacesJwtPayload> { }

/** the result returned from {@link JwtService.getJwt} */
export class Get2faJwtResult extends BaseJwtResult<BlockSpacesTwoFactorAuthJwtPayload> { }