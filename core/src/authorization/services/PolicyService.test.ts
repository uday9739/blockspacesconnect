import { Enforcer } from "casbin";
import { createMock } from "ts-auto-mock";
import { Policy, PolicyPermission, PolicyResource } from "../types/Policy";
import { PolicyService } from "./PolicyService";

describe(PolicyService, () => {
  let policyService: PolicyService;

  let mocks: {
    enforcer: Enforcer
  };

  beforeEach(() => {
    mocks = {
      enforcer: createMock<Enforcer>()
    };

    policyService = new PolicyService(mocks.enforcer);
  });

  describe("covertToCasbinPolicies", () => {

    it('should convert policies to casbin policy arrays', () => {
      const policies: Policy[] = [
        { roleId: "123", tenantId: "abc", resource: PolicyResource.TENANT, permission: PolicyPermission.READ },
        { roleId: "345", tenantId: "xyz", resource: PolicyResource.TENANT, permission: PolicyPermission.WRITE }
      ];

      const expectedCasbinPolicyArrays: string[][] = policies.map(
        p => [p.roleId, p.tenantId, p.resource, p.permission]
      );

      const actualCasbinPolicyArrays = policyService["covertToCasbinPolicies"](policies);

      expect(actualCasbinPolicyArrays).toEqual(expectedCasbinPolicyArrays);
    });
  });
});