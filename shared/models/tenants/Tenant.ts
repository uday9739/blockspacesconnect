/** An organization consisting of one or more users */
export interface Tenant {
  tenantId: string;
  name: string;
  ownerId: string;
  status: TenantStatus;
  description?: string;
  tenantType: TenantType;
  whmcsClientId?: number;
  users: Array<{
    userId?: string;
    email?: string;
    memberStatus: TenantMemberStatus;
  }>;

  /** @deprecated this data is not actually used and should probably be removed from the data model until the time when it's needed */
  vault?: Object;
}

export enum TenantStatus {
  ACTIVE = "active",
  BLOCKED = "blocked"
}

export enum TenantMemberStatus {
  INACTIVE = "inactive",
  INVITED = "invited",
  ACTIVE = "active",
  SUSPENDED = "suspended",
}

export enum TenantType {
  ORGANIZATION = "organization",
  TEAM = "team",
  PERSONAL = "personal",
}