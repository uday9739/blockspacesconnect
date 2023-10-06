import { useQuery } from "@tanstack/react-query"
import { fetchUserNotifications } from "@platform/api"

export const useNotifications = () => {
  return useQuery(["user-notifications"], () => fetchUserNotifications())
}