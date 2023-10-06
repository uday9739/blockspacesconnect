/**
 * A security policy controlling access to a particular resource
 */
export interface Policy {
  /** the role that this policy applies to (Casbin: v0) */
  roleId: string;

  /** the tenant that this policy applies to (Casbin: v1) */
  tenantId: string;

  /** the resource this policy applies to (Casbin: v2) */
  resource: PolicyResource

  /** the permission being granted (Casbin: v3) */
  permission: PolicyPermission | `${PolicyPermission}`;
}

/** The resource types available to use with authorization policies */
export enum PolicyResource {
  /** a tenant resource */
  TENANT = "tenant",
  TENANT_MEMBER = "tenant-member",
  TENANT_MEMEBER_PERMISSIONS = "tenant-member-permissions",
  PAYMENT_METHOD = "payment-methods",
  INVOICES = "invoices",
}

/** the permissions available for a policy */
export enum PolicyPermission {
  "WRITE" = "write",
  "READ" = "read"
}