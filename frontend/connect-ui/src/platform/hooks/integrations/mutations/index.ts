import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "@platform/api/integrations"
import { ConstructionOutlined } from "@mui/icons-material"

export const useInstallIntegration = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (integrationId: string) => api.installIntegration(integrationId),
    onSuccess: async (data, variables, context) => {
      const queries = ["installed-connectors", "integrations-available", `integration-${variables}`]
      await Promise.all(queries.map((query) => {
        queryClient.refetchQueries([query])
      }))
    }
  })
}

export const useUninstallIntegration = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (integrationId: string) => api.uninstallIntegration(integrationId),
    onSuccess: async (data, variables, context) => {
      const queries = ["installed-connectors", "account-connector", "integrations-available", `integration-${variables}`]
      await Promise.all(queries.map((query) => {
        queryClient.refetchQueries([query])
      }))
    }
  })
}

type UseIntegrationAuthUrl = { accountConnectorId: number, callbackUrl: string }
export const useIntegrationAuthUrl = () => {
  return useMutation({
    mutationFn: (args: UseIntegrationAuthUrl) => api.getIntegrationAuthUrl(args.accountConnectorId, args.callbackUrl)
  })
}

type UseActivateIntegration = { integrationId: string }
export const useActivateIntegration = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: UseActivateIntegration) => api.activateIntegration(args.integrationId),
    onSuccess: async (data, variables, context) => {
      const queries = ["installed-connectors", "account-connector", "integrations-available", `integration-${variables.integrationId}`]
      await Promise.all(queries.map((query) => {
        queryClient.refetchQueries([query])
      }))
    }
  })
}

export const useStopIntegration = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: UseActivateIntegration) => api.stopIntegration(args.integrationId),
    onSuccess: async (data, variables, context) => {
      const queries = ["account-connector", "integrations-available", `integration-${variables.integrationId}`]
      await Promise.all(queries.map((query) => {
        queryClient.refetchQueries([query])
      }))
    }
  })
}


type UseDisconnectConnector = { integrationId: string, accountConnectorId: number }
export const useDisconnectConnector = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: UseDisconnectConnector) => api.disconnectConnector(args.accountConnectorId),
    onSuccess: async (data, variables, context) => {
      const queries = ["installed-connectors", "account-connector", "integrations-available", `integration-${variables.integrationId}`]
      await Promise.all(queries.map((query) => {
        queryClient.refetchQueries([query])
      }))
    }
  })
}

type UseUpdateConnectorSettings = { integrationId: string, accountConnectorId: number, updates: Record<string, any> }
export const useUpdateConnectorSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: UseUpdateConnectorSettings) => api.updateConnectorSettings(args.accountConnectorId, args.updates),
    onSuccess: async (data, variables, context) => {
      const queries = ["installed-connectors", "account-connector", "integrations-available", `integration-${variables.integrationId}`]
      await Promise.all(queries.map((query) => {
        queryClient.refetchQueries([query])
      }))
    }

  })
}

