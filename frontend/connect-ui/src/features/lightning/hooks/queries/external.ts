import * as api from "@lightning/api"
import { useQuery } from "@tanstack/react-query"

export const useExternalHeyHowAreYa = () => {
  return useQuery(["external-howhowareya"], {
    queryFn: async () => api.externalHeyhowareya()
  })
}