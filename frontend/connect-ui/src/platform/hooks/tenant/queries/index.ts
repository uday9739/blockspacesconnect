

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { TenantDto } from "@blockspaces/shared/dtos/tenants";
import * as api from "../../../api/tenant"
import { isUserAuthenticated, userQueryKeys } from "../../user/queries";


export const useGetUsersTenants = (enabled: boolean = true) => {
  return useQuery([userQueryKeys.userTenants], () => api.getUserTenants(), { enabled: enabled && isUserAuthenticated() });
}

export const useGetTenantMemberPermissions = (tenantId, userId) => {
  return useQuery([`tenant-${tenantId}-user-${userId}-permissions`], () => api.getTenantMemberPermissions(userId), { enabled: !!userId });
}



