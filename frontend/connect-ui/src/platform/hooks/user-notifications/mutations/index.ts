import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteUserNotification, readUserNotification } from "@platform/api"

export const useReadNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id:string) => readUserNotification(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries(["user-notifications"]); 
    }
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUserNotification(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries(["user-notifications"])
    }
  })
}