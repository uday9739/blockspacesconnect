
import ApiResult, { AsyncApiResult, IApiResult } from '@blockspaces/shared/models/ApiResult';
import { getApiUrl } from 'src/platform/utils';
import axios from 'axios';
import { TenantDto, TenantPermissionsDto, TenantRole } from '@blockspaces/shared/dtos/tenants';

export async function acceptInvite(tenantId: string): Promise<void> {
  return await axios.patch(
    getApiUrl(`/tenant-member/${tenantId}`),
    {},
    { params: { acceptInvite: true } },
  )
}

export async function setActiveTenant(tenantId: string): Promise<void> {
  return await axios.post(
    getApiUrl(`/auth/set-active-tenant/${tenantId}`)
  )
}


export async function getUserTenants(): Promise<Array<TenantDto>> {
  const { data: apiResult } = await axios.get<IApiResult<Array<TenantDto>>>(
    getApiUrl("/tenant")
  );
  return apiResult.data;
}


export async function getTenant(id: string): Promise<TenantDto> {
  const { data: apiResult } = await axios.get<IApiResult<TenantDto>>(
    getApiUrl(`/tenant/${id}`)
  );
  return apiResult.data;
}


export async function createTenant(dto: TenantDto): Promise<TenantDto> {
  const { data: apiResult } = await axios.post<IApiResult<TenantDto>>(
    getApiUrl(`/tenant/`), dto
  );
  return apiResult.data;
}

//
export async function getTenantMemberPermissions(userId: string): Promise<TenantPermissionsDto> {
  const { data: apiResult } = await axios.get<IApiResult<TenantPermissionsDto>>(
    getApiUrl(`/tenant-member-permissions/${userId}`)
  );
  return apiResult.data;
}


export async function inviteUserToTenant(tenantId: string, email: string): Promise<void> {
  const { data: apiResult } = await axios.post<IApiResult<void>>(
    getApiUrl(`/tenant-member/${tenantId}`), { email }
  );
  return apiResult.data;
}

export async function updateTenantMemberPermissions(userId: string, role: TenantRole, enabled: boolean): Promise<void> {
  const { data: apiResult } = await axios.patch<IApiResult<void>>(
    getApiUrl(`/tenant-member-permissions/${userId}`), { role, enabled }
  );
  return apiResult.data;
}