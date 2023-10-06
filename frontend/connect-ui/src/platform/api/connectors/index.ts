import axios from "axios";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { Network } from "@blockspaces/shared/models/networks";
import { getApiUrl } from "@platform/utils";
import { Connectors, NetworkConnectorIntegration } from "@blockspaces/shared/models/connectors";

export async function getActiveConnectors(): Promise<Connectors[]> {
  const { data: apiResult } = await axios.get<ApiResult<Connectors[]>>(getApiUrl("/connectors"))
  return apiResult.data;
}
export async function getActiveConnectorsForNetwork(networkId): Promise<NetworkConnectorIntegration[]> {
  const { data: apiResult } = await axios.get<ApiResult<NetworkConnectorIntegration[]>>(getApiUrl(`/connectors/network/${networkId}`))
  return apiResult.data;
}




export async function getConnector(id): Promise<Connectors> {
  const { data: apiResult } = await axios.get<ApiResult<Connectors>>(getApiUrl(`/connectors/${id}`))
  return apiResult.data;
}

