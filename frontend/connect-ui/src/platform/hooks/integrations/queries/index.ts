import { useQuery } from "@tanstack/react-query"
import * as api from "@platform/api/integrations"
import { useState } from "react"

export const useAvailableIntegrations = () => {
  return useQuery(["integrations-available"], () => api.getAvailableIntegrations())
}

export const useIntegrationById = (integrationId: string) => {
  const { data: integration, isLoading, isError, refetch, isFetching } = useQuery(
    [`integration-${integrationId}`],
    () => api.getAvailableIntegrations(),
  )

  return {
    integration: integration?.data?.find(int => int.integrationId === integrationId),
    isLoading: isFetching || isLoading,
    isError,
    refetch
  }
}

export const useInstalledConnectors = (isInstalled?: boolean) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const { data: installed, isLoading, isError, refetch, isFetching } = useQuery(
    ["installed-connectors"],
    () => api.installedConnectors(),
    {
      enabled: isInstalled,
      onSuccess: (data) => {
        let authenticated: boolean = true
        data.data.map(connector => {
          if (!connector.authenticated) authenticated = false
        })
        setAuthenticated(authenticated)
      }
    }
  )

  return {
    installed,
    authenticated,
    isLoading: isInstalled && (isLoading || isFetching),
    isError,
    refetch,
    getConnector: (name: string) => installed?.data?.find(conn => conn.name === name)
  }

}

export const useAccountConnector = (accountConnectorId: number) => {
  const { data: connector, isLoading, isError, isFetching } = useQuery(
    ["account-connector"],
    () => api.accountConnector(accountConnectorId),
  )
  return {
    connector: connector?.data,
    isLoading: isLoading || isFetching,
    isError
  }
}