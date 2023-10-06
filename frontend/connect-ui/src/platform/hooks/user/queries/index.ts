import { localStorageHelper } from "@src/platform/utils";
import { TOKEN_EXPIRY_KEY } from "@src/platform/utils/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FeatureFlags } from "@blockspaces/shared/models/feature-flags/FeatureFlags";
import * as api from "../../../api/user"
import { UserNetwork } from "@blockspaces/shared/models/networks";
import { useRouter } from "next/router";
import { UrlObject } from "url";
import { getTenant } from "@src/platform/api/tenant";
import { TenantPermissionsDto, TenantRole } from "@blockspaces/shared/dtos/tenants";
import { useGetTenantMemberPermissions } from "../../tenant/queries";

export const userQueryKeys = {
  currentUser: `currentUser`,
  userProfile: `user-profile`,
  connectSubscription: `connect-subscription`,
  userNetworks: `user-networks`,
  authRedirect: `redirect`,
  userTenants: 'user-tenants',
  tenant: `tenant`,
  tenantMembers: `tenant-members`,
}
export const useGetInitialLandingPage = () => {
  const { data: user, isLoading } = useGetCurrentUser();
  let defaultLanding: string | UrlObject = user?.appSettings?.defaultPage ?? "/connect";
  const redirect = useGetAuthRedirect();

  if (!user)
    defaultLanding = "/auth";

  else if (!user?.tosDate)
    defaultLanding = "/connect?modal=terms-of-service";

  else if (!user?.viewedWelcome)
    defaultLanding = "/connect?modal=welcome";
  else if (!user?.connectedNetworks?.length)
    defaultLanding = "/connect?modal=add-app";

  // Handles when a user sets a default landing page
  else if (!user?.appSettings?.defaultPage)
    defaultLanding = user?.appSettings.defaultPage;

  // Handles when an unauthenticated user tries to navigate to a protected page
  else if (redirect)
    defaultLanding = redirect as UrlObject;

  return {
    defaultLanding,
    isLoading
  };
}

export const useHasUserViewedWelcome = () => {
  const { data: user, isLoading } = useGetCurrentUser();
  const [viewedWelcome, setViewedWelcome] = useState(user?.viewedWelcome);

  useEffect(() => {
    if (viewedWelcome) return;
    setViewedWelcome(user?.viewedWelcome);
  }, [user]);

  return {
    viewedWelcome
  }
}

export const isUserAuthenticated = () => {
  const tokenExpiryValue = localStorageHelper.getItem(TOKEN_EXPIRY_KEY);
  if (!tokenExpiryValue) return false
  const tokenExpiryValueAsInt = parseInt(tokenExpiryValue);
  return tokenExpiryValueAsInt > Date.now()
}

export const useUserHasRole = () => {
  return (userId: string, role: TenantRole) => {
    const { data: user, isLoading: currentUserIsLoading } = useGetCurrentUser();
    const { data: memberPermissions, error: getTenantMemberPermissionsError, isLoading: permissionsAreLoading, refetch } = useGetTenantMemberPermissions(user?.activeTenant?.tenantId, userId);
    if (!memberPermissions || memberPermissions?.permissions?.length === 0) return false;
    return memberPermissions.permissions.find((x) => x.role === role && x.enabled === true) !== undefined;
  }
}

export const useIsUserFeatureEnabled = () => {
  return (flag: FeatureFlags) => {
    const { data: user } = useGetCurrentUser();
    return user?.featureFlags[flag]
  }
}

export const useGetAuthRedirect = () => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData([userQueryKeys.authRedirect]);
  // return useQuery([userQueryKeys.authRedirect], () => queryClient.getQueryData([userQueryKeys.authRedirect]), { enabled: !isUserAuthenticated() });
}

export const useGetCurrentUser = () => {
  const queryClient = useQueryClient();
  return useQuery([userQueryKeys.currentUser], () => api.getCurrentUser(), {
    enabled: isUserAuthenticated(),
    // user data doesn't change that often
    // if you perform an actions that needs to refresh user mark as stale
    staleTime: 60 * 1000,
  }
  );
}

export const useGetUserNetworks = () => {
  return useQuery([userQueryKeys.userNetworks], () => api.getUserNetworks(), { enabled: isUserAuthenticated(), staleTime: Infinity });
}


export const useGetConnectSubscription = () => {
  return useQuery([userQueryKeys.connectSubscription], () => api.getConnectSubscription(), { enabled: isUserAuthenticated() });
}

export const useGetUserProfile = () => {
  return useQuery([userQueryKeys.userProfile], () => api.getUserProfile(), { enabled: isUserAuthenticated() });
}



export const useGetTenantMembers = (tenantId: string) => {
  return useQuery([tenantId, userQueryKeys.tenantMembers], () => getTenant(tenantId), { enabled: isUserAuthenticated() });
}


