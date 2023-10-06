export enum TenantRole {
  TENANT_USER = 'tenant-user',
  TENANT_USER_ADMIN = 'tenant-user-admin',
  BILLING_ADMIN = 'billing-admin',
  SUBSCRIBE_TO_SERVICES = 'subscribe-to-services',
}



export type TenantPermission = {
  role: TenantRole,
  enabled: boolean,
}

export type UserValueObj = {
  userId: string;
  fullName: string;
  email: string
}
export type TenantPermissionsDto = {
  tenantId: string;
  userId: string;
  user?: UserValueObj;
  permissions: TenantPermission[];
}