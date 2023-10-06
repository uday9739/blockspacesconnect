import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import crypto from "crypto"
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthenticatedMiddleware implements NestMiddleware {

  constructor(private readonly db: ConnectDbDataContext, private readonly reflector: Reflector) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Assume that token is not revoked
    req.user = {accessTokenRevoked: false}
    if (req.headers.authorization === undefined) return next()
    // Get the access token from the request.
    const token = req.headers.authorization.replace("Bearer ", "")
    // Hash the token to check the database
    const hmac = crypto.createHmac("md5", "revoke-token")
    const hash = hmac.update(token).digest("hex")
    const revoke = await this.db.revokedTokens.findOne({tokenId: hash})

    // If token is not revoked, continue
    if (!revoke) return next()

    // If it is revoked, don't let them in
    req.user = {accessTokenRevoked: true}
    return next()
  }
}