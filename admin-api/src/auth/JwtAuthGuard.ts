import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ALLOW_ANONYMOUS_DECORATOR_KEY } from './decorators/AllowAnonymous.decorator';
import { EnvironmentVariables, ENV_TOKEN } from '../env';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  constructor(private readonly reflector: Reflector,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables) {
    super();
  }
  canActivate(context: ExecutionContext) {


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

}