import { ExtractJwt, Strategy, JwtFromRequestFunction, StrategyOptions } from "passport-jwt";
import { PassportStrategy } from '@nestjs/passport';
import { Request } from "express";
import CookieName from "@blockspaces/shared/models/CookieName";
import { Injectable } from "@nestjs/common";
import { JWT_PUBLIC_KEY } from "../constants";
import { IUser } from "@blockspaces/shared/models/users";
import { BlockSpacesJwtPayload } from "../types";
import { UserDataService } from "../../users/services/UserDataService";
import { TenantService } from "../../tenants";

/**
 * Passport strategy for JWT-based authentication on the BlockSpaces platform
 *
 * This strategy will attempt to find the JWT from the following locations, in the following order:
 * 1. from the request `Authorization` header, as a bearer token (i.e. `Authorization: Bearer ...`)
 * 2. from a request cookie, matching the name specified by {@link CookieName.AccessToken}
 */
@Injectable()
export class BlockSpacesJwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    private readonly userDataService: UserDataService,
    private readonly tenantDataService: TenantService
  ) {
    super(<StrategyOptions>{
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),    // try to get JWT as bearer token
        BlockSpacesJwtStrategy.extractJwtFromCookie  // if no bearer token, try to get JWT from cookie
      ]),

      ignoreExpiration: false,
      secretOrKey: JWT_PUBLIC_KEY,
      passReqToCallback: true
    });
  }

  /**
   * Callback for Nest.js that provides the user data that will be attached to the request.
   * This method is guaranteed to only be called once the JWT has been validated
   */
  async validate(req: Request, jwtPayload: BlockSpacesJwtPayload): Promise<IUser> {
    const encodedAccessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req) || BlockSpacesJwtStrategy.extractJwtFromCookie(req);
    const results = await this.userDataService.getUserById(jwtPayload.sub);
    if (results && results.tenants.length > 0) {
      results.activeTenant = await this.tenantDataService.findByTenantId(results.tenants[0])
    }
    results.accessToken = encodedAccessToken;
    return {
      ...req.user,
      ...results
    };
  }

  /**
   * Passport.js extractor function that attempts to find the JWT from a cookie named {@link CookieName.AccessToken}
   */
  static extractJwtFromCookie: JwtFromRequestFunction = (req: Request) => {
    return req.signedCookies[CookieName.AccessToken] || null;
  };
}
