import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "../services/JwtService";
import CookieName from "@blockspaces/shared/models/CookieName";

@Injectable()
export class TwoFactorAuthJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {

    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const verifyJwtResponse = await this.jwtService.verify2faJwt(request.signedCookies[CookieName.TwoFactorConfigurationToken])

    if (verifyJwtResponse.success === false || !(request.body.email && request.body.email === verifyJwtResponse.payload.email)) {
      throw new UnauthorizedException(verifyJwtResponse.failureReason);
    }
    return verifyJwtResponse.success
  }
}
