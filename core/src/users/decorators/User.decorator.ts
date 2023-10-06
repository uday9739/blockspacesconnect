import CookieName from "@blockspaces/shared/models/CookieName";
import { Tenant } from "@blockspaces/shared/models/tenants";
import { IUser } from "@blockspaces/shared/models/users";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request, Response } from "express";

/**
 * A decorator for a route parameter that provides the current authenticated user for the request.
 * If no user is authenticated, then
 *
 * Example:
 * ```
 * getSomeData(@User() user: IUser) {
 *   // the "user" param will contain data about the current logged in user
 * }
 * ```
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IUser => {
    const request: Request = ctx.switchToHttp().getRequest();
    if (request.user && request.cookies[CookieName.ActiveTenant]) {
      (<IUser>request.user).activeTenant = <Tenant>request.cookies[CookieName.ActiveTenant]
    }
    return <IUser>request.user || null;
  },
);

export const UserFeatureFlags = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.featureFlags || null;
  },
);
