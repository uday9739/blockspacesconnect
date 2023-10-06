

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TenantDto, TenantRole } from "@blockspaces/shared/dtos/tenants";
import * as api from "../../../api/tenant"
import { userQueryKeys } from "../../user/queries";


export const useAcceptInvite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { tenantId: string }) => api.acceptInvite(args.tenantId),
    onSuccess: async () => {
      await queryClient.invalidateQueries([userQueryKeys.currentUser], {})
      await queryClient.invalidateQueries([userQueryKeys.userTenants], {})
    }
  });
}

export const useSetActiveTenant = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { tenantId: string }) => api.setActiveTenant(args.tenantId),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
    }
  });
}

export const useGetTenant = () => {
  return useMutation({
    mutationFn: (id: string) => api.getTenant(id)
  });
}

export const useCreateTenant = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tenant: TenantDto) => api.createTenant(tenant),
    onSuccess: async () => {
      await queryClient.invalidateQueries([userQueryKeys.userTenants], {})
    }
  });
}

export const useInviteUserToTenant = () => {
  return useMutation({
    mutationFn: ({ tenantId, email }: { tenantId: string, email: string }) => api.inviteUserToTenant(tenantId, email)
  });
}

export const useUpdateTenantMemberPermissions = (tenantId: string, userId: string) => {
  type UpdateTenantMemberPermissionArgs = { tenantId: string, role: TenantRole, enabled: boolean }
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: UpdateTenantMemberPermissionArgs) => api.updateTenantMemberPermissions(userId, args.role, args.enabled),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries([`tenant-${tenantId}-user-${userId}-permissions`], {})
    }
  })
}