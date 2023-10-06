import { useMutation } from "@tanstack/react-query"
import * as api from "@lightning/api"
import { useRouter } from "next/router"

export const useResetNode = () => {
  const router = useRouter()
  return useMutation({
    mutationFn: () => api.resetNode(),
    onSuccess: () => router.push("/connect")
  })
}