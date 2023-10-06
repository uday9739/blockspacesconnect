import { useGetCurrentUser } from "@src/platform/hooks/user/queries"
import { useRouter } from "next/router"

/**
 * Checks if the current user is viewing their own tenant
 * If a logged in user is on another users checkout page, we want to show the other users tenant
 * 
 * @returns the correct tenantId to use for the current page
 */
export const extractTenantId = () => {
  const router = useRouter()
  const {data: user} = useGetCurrentUser()
  const hasQueryTenantId = router?.query?.tenantId
  const tenantId = hasQueryTenantId ? router?.query?.tenantId as string : user?.activeTenant?.tenantId
  return tenantId;
}