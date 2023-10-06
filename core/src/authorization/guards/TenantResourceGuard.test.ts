import { TenantResourceGuard } from "./TenantResourceGuard";
import { Enforcer } from "casbin";
import { createMock } from "ts-auto-mock";
import { ExecutionContext } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { Request } from "express";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { Tenant } from "@blockspaces/shared/models/tenants";
import { IUser } from "@blockspaces/shared/models/users";
import CookieName from "@blockspaces/shared/models/CookieName";

describe(TenantResourceGuard, () => {
  let mockedLogger: ConnectLogger;
  let mockedEnforcer: Enforcer;
  let mockedExecutionContext: ExecutionContext;
  let mockedHttpArgumentHost: HttpArgumentsHost;
  let mockedRequest: Request;
  let tenantResourceGuard: TenantResourceGuard;
  beforeEach(() => {
    mockedLogger = createMock<ConnectLogger>();
    mockedEnforcer = createMock<Enforcer>();
    mockedExecutionContext = createMock<ExecutionContext>();
    mockedHttpArgumentHost = createMock<HttpArgumentsHost>();
    mockedRequest = createMock<Request>({
      cookies: {
        [CookieName.ActiveTenant]: {
          tenantId: "123"
        }
      }
    });
    tenantResourceGuard = new TenantResourceGuard(mockedLogger, mockedEnforcer);
  });
  it(`to authorize a valid request`, async () => {
    mockedRequest.user = { id: "userId", activeTenant: createMock<Tenant>({ tenantId: "1234" }) };
    mockedRequest.params.tenantId = "tenantId";
    mockedHttpArgumentHost.getRequest = jest.fn().mockReturnValue(mockedRequest);
    mockedExecutionContext.switchToHttp = jest.fn().mockReturnValue(mockedHttpArgumentHost);
    mockedEnforcer.enforce = jest.fn().mockResolvedValue(true);

    const response = await tenantResourceGuard.canActivate(mockedExecutionContext);
    expect(mockedHttpArgumentHost.getRequest).toHaveBeenCalled();
    expect(mockedExecutionContext.switchToHttp).toHaveBeenCalled();
    expect(mockedEnforcer.enforce).toHaveBeenCalled();
    expect(response).toBeTruthy();
  });
  it(`to not authorize an invalid request`, async () => {
    mockedRequest.user = { id: "userId", activeTenant: createMock<Tenant>({ tenantId: "1234" }) };
    mockedRequest.params.tenantId = "tenantId";
    mockedHttpArgumentHost.getRequest = jest.fn().mockReturnValue(mockedRequest);
    mockedExecutionContext.switchToHttp = jest.fn().mockReturnValue(mockedHttpArgumentHost);
    mockedEnforcer.enforce = jest.fn().mockResolvedValue(false);

    const response = await tenantResourceGuard.canActivate(mockedExecutionContext);
    expect(mockedHttpArgumentHost.getRequest).toHaveBeenCalled();
    expect(mockedExecutionContext.switchToHttp).toHaveBeenCalled();
    expect(mockedEnforcer.enforce).toHaveBeenCalled();
    expect(response).toBeFalsy();
  });
  it(`to throw error for unauthenticated users`, async () => {
    mockedRequest.user = <IUser>{ id: "userId", activeTenant: createMock<Tenant>({ tenantId: "" }) };
    mockedHttpArgumentHost.getRequest = jest.fn().mockReturnValue(mockedRequest);
    mockedExecutionContext.switchToHttp = jest.fn().mockReturnValue(mockedHttpArgumentHost);
    mockedEnforcer.enforce = jest.fn().mockResolvedValue(false);
    try {
      await tenantResourceGuard.canActivate(mockedExecutionContext);
    } catch (error) {
      expect(error.message).toEqual("user is not authenticated");
    }
  });
});
