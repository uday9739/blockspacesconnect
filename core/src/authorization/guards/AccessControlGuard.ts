import {Inject, Injectable, CanActivate, ExecutionContext, InternalServerErrorException} from "@nestjs/common";
import {DEFAULT_LOGGER_TOKEN} from "../../logging/constants";
import { ConnectLogger } from "../../logging/ConnectLogger";
import {Enforcer} from "casbin";
import {Request} from "express";
import {HTTP_REQUEST_ACTIONS} from "../../constants";
import { IUser } from "@blockspaces/shared/models/users";


@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(@Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger, private readonly enforcer: Enforcer) {
    logger.setModule(this.constructor.name);
    logger.debug("Constructed AccessControlGuard object");
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const user = request.user as IUser;
    const tenantId = request.params.tenantId;
    if (user && user.id && tenantId) {
      return await this.enforcer.enforce(user.id, tenantId, tenantId, HTTP_REQUEST_ACTIONS[request.method]);
    } else {
      throw new InternalServerErrorException("user is not authenticated");
    }
  }
}
