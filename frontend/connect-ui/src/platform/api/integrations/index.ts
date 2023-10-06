import ApiResult from "@blockspaces/shared/models/ApiResult";
import { ConnectorDto, IntegrationDto } from "@blockspaces/shared/dtos/integrations"
import { getApiUrl } from "@src/platform/utils"
import axios from "axios"

export const getAvailableIntegrations = async (): Promise<ApiResult<IntegrationDto[]>> => {
  const response = await axios.get(getApiUrl("/integrations"))
  return response.data
}

export const installIntegration = async (integrationId: string): Promise<ApiResult> => {
  const response = await axios.post(getApiUrl(`/integrations/${integrationId}`))
  return response.data
}

export const uninstallIntegration = async (integrationId: string): Promise<ApiResult> => {
  const response = await axios.delete(getApiUrl(`/integrations/${integrationId}`))
  return response.data
}

export const installedConnectors = async (): Promise<ApiResult<ConnectorDto[]>> => {
  const response = await axios.get(getApiUrl("/integrations/connectors"))
  return response.data
}

export const accountConnector = async (accountConnectorId: number): Promise<ApiResult<ConnectorDto>> => {
  const response = await axios.get(getApiUrl(`/integrations/connectors/${accountConnectorId}`))
  return response.data
}

export const activateIntegration = async (integrationId: string): Promise<ApiResult> => {
  const response = await axios.put(getApiUrl(`/integrations/${integrationId}/activate`))
  return response.data
}

export const stopIntegration = async (integrationId: string): Promise<ApiResult> => {
  const response = await axios.put(getApiUrl(`/integrations/${integrationId}/stop`))
  return response.data
}


export const getIntegrationAuthUrl = async (accountConnectorId: number, callbackUrl: string): Promise<ApiResult<string>> => {
  const body = {
    accountConnectorId,
    callbackUrl
  }
  const response = await axios.post(getApiUrl("/integrations/auth-link"), body)
  return response.data
}

export const disconnectConnector = async (accountConnectorId: number): Promise<ApiResult<ConnectorDto>> => {
  const response = await axios.post(getApiUrl(`/integrations/connectors/disconnect/${accountConnectorId}`))
  return response.data
}

export const updateConnectorSettings = async (accountConnectorId: number, updates: Record<string, any>): Promise<ApiResult<void>> => {
  const parameterUpdates = Object.keys(updates).map((key) => { return { name: key, value: updates[key] } })
  const response = await axios.put(getApiUrl(`/integrations/connectors/${accountConnectorId}`), { parameterUpdates })
  return response.data
}
