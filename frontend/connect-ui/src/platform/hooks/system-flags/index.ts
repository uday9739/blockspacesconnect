import { useQuery } from "@tanstack/react-query";
import * as api from "../../api/system-flags"

export const useGetSystemFlags = () => {
  return useQuery(["system-flags"], () => api.getSystemFlags(), { staleTime: Infinity });
}