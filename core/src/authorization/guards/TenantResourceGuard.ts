import { Inject, Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { Enforcer } from "casbin";
import { Request } from "express";
import { HTTP_REQUEST_ACTIONS } from "../../constants";
import { IUser } from "@blockspaces/shared/models/users";
import CookieName from "@blockspaces/shared/models/CookieName";

@Injectable()
export class TenantResourceGuard implements CanActivate {
  constructor(@Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger, private readonly enforcer: Enforcer) {

    logger.setModule(this.constructor.name);
    this.logger.debug("Constructed TenantControlGuard object");
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const user = request.user as IUser;
    const cookie = request?.cookies[CookieName.ActiveTenant];

    // The third slug (index=2) is the type of resource
    // /api/tenant renders ['',api,tenant]
    const resource = request.path.split('/')[2];

    const permission = HTTP_REQUEST_ACTIONS[request.method];
    if (user && user.id && cookie.tenantId) {
      return await this.enforcer.enforce(user.id, cookie.tenantId, resource, permission);
    } else {
      throw new Error("user is not authenticated");
    }
  }
}
