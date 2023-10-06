import { getActiveConnectors, getConnector, getActiveConnectorsForNetwork } from "@src/platform/api/connectors"
import { useQuery } from "@tanstack/react-query"



export const useGetActiveConnectors = () => {
  return useQuery(["active-connectors"], () => getActiveConnectors(), { staleTime: Infinity })
}

export const useGetActiveConnectorsForNetwork = (networkId) => {
  return useQuery(["active-connectors", networkId], () => getActiveConnectorsForNetwork(networkId), { staleTime: Infinity })
}

export const useGetConnector = (id) => {
  return useQuery(["connector", id], () => getConnector(id), { enabled: !!id })
}


