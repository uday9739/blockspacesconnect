import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ALLOW_ANONYMOUS_DECORATOR_KEY } from '../decorators/AllowAnonymous.decorator';
import { ADMIN_ONLY_DECORATOR_KEY } from '../decorators/AdminOnly.decorator';
import { EnvironmentVariables, ENV_TOKEN } from "../../env"

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables) {
    super();
  }

  canActivate(context: ExecutionContext) {

    /**
     * For the following Checks Order is important . 
     */

    // #region check if @AdminOnly() has been applied 
    const adminOnlyApplied = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_DECORATOR_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (adminOnlyApplied) {
      // Let this pass through to the jwt authentication 
      // this will populate the user object that is then checked in the `handleRequest` method below
      return super.canActivate(context);
    }
    // #endregion

    // #region  Check if @AllowAnonymous()  has been applied 
    const shouldAllowAnonymous = this.reflector.getAllAndOverride<boolean>(ALLOW_ANONYMOUS_DECORATOR_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (shouldAllowAnonymous) {
      return true;
    }
    // #endregion 

    return super.canActivate(context);
  }

  handleRequest(err, user, info, context, status) {
    // #region check if @AdminOnly() has been applied 
    const adminOnlyApplied = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_DECORATOR_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (adminOnlyApplied) {

      if (this.env.isProduction && user?.email !== this.env.backend.adminEmail) {
        throw new UnauthorizedException('Unauthorized');
      }
    }
    // #endregion

    // Check if the middleware has flagged that accessToken is revoked.
    // or if account has been locked
    if (user.accessTokenRevoked || user.accountLocked === true) {
      throw new UnauthorizedException("Unauthorized")
    }

    return super.handleRequest(err, user, info, context, status);;
  }
}
