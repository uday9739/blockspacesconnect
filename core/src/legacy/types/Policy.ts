import { PolicyPermission } from "../../authorization";

/** Used to create or update policies
 *  https://casbin.io/docs/policy-storage
 *
 * @deprecated should be removed when feature flags are removed
 */
type Policy = {
  /** Casbin/MongoDB Policies (v0) */
  sub: string;

  /** Casbin/MongoDB Policies (v1) */
  tenant: string;

  /** Casbin/MongoDB Policies (v3) */
  permission: PolicyPermission;
}

export type {Policy};
