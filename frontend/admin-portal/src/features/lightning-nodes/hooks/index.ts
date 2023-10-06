

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiService from "src/platform/utils/apiService";




export const useGetAllNodes = () => {
  return useQuery(['all-nodes'], () => apiService.get("lightningnode"), {});
}

export const usePingNodeInfo = (nodeUri?: string, nodeId?: string) => {
  const queryClient = useQueryClient()
  return queryClient.fetchQuery({ queryKey: ['node-info', nodeId], queryFn: () => apiService.get(`lnd/getinfo`) });
  //return queryClient.fetchQuery({ queryKey: ['node-info', nodeId], queryFn: () => apiService.get(`${nodeUri}/v1/getinfo`) });
  //https://randy.ln.blockspaces.com/v1/getinfo
  //useQuery(['node-info', nodeId], () => apiService.get(`${nodeUri}/v1/getinfo`), { enabled: nodeUri != null && nodeId != null });
}

export const useGetNodeInfo = (nodeUri: string, nodeId: string) => {
  const queryClient = useQueryClient()
  //https://randy.ln.blockspaces.com/v1/getinfo
  return queryClient.getQueryData(['node-info', nodeId]);
  //return useQuery(['node-info', nodeId], () => apiService.get(`${nodeUri}/v1/getinfo`), { enabled: nodeUri != null && nodeId != null });
}

