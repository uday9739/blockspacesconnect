import CookieName from "@blockspaces/shared/models/CookieName";
import { Tenant as ITenant } from "@blockspaces/shared/models/tenants";
import { IUser } from "@blockspaces/shared/models/users";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * A decorator for a route parameter that provides the current authenticated user's active tenant for the request.
 *
 * Example:
 * ```
 * getSomeData(@Tenant() tenant: ITenant) {
 *   // the "tenant" param will contain data about the current logged in tenant
 * }
 * ```
 */
export const Tenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ITenant => {
    const request = ctx.switchToHttp().getRequest();
    const user: IUser = request.user;
    const tenant: ITenant = user.activeTenant;
    return tenant || null;
  },
);

export const TenantUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IUser => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user && request.cookies[CookieName.ActiveTenant]) {
      (<IUser>request.user).activeTenant = <ITenant>request.cookies[CookieName.ActiveTenant]
    }
    return <IUser>request.user || null;
  },
);
