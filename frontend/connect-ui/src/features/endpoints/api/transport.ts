import { AddEndpointDto, GetEndpointsResponseDto, UpdateEndpointDto } from "@blockspaces/shared/dtos/endpoints";
import { NetworkCuratedResourcesDto } from "@blockspaces/shared/dtos/network-catalog";
import { NetworkDataInterval, NetworkDataSeriesDto } from "@blockspaces/shared/dtos/networks/data-series";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { Endpoint } from "@blockspaces/shared/models/endpoints/Endpoint";
import { Network } from "@blockspaces/shared/models/networks";
import { Timestamp } from "@blockspaces/shared/types/date-time";
import { getApiUrl } from "@platform/utils";
import axios from "axios"
import { v4 } from "uuid";

/**
 *
 * FetchEndpoints - Get the endpoints owned by the tenant of the logged in user
 *
 * @returns {@link GetEndpointsResponseDto} - The array of endpoints
 *
 */
export async function fetchEndpoints(networkId: string): Promise<GetEndpointsResponseDto> {
  const apiPath = `/endpoint/${networkId}`;
  const { data: apiResult } = await axios.get<ApiResult<GetEndpointsResponseDto>>(
    getApiUrl(apiPath)
  );
  return apiResult.data;
}

/**
 *
 * AddEndpoint - Add an endpoint
 *
 * @param  {AddEndpointDto} endpoint
 *
 */
export async function addEndpoint(networkId:string): Promise<void> {
  const endpoint: AddEndpointDto = {
    endpointId: v4(),
    networkId: networkId,
    description: '',
    alias: "New Endpoint"
  }
  const apiPath = `/endpoint`;
  await axios.post<ApiResult<void>>(
    getApiUrl(apiPath),
    { data: endpoint }
  );
  return;
}

/**
 *
 * UpdateEndpoint - Updates an Endpoint
 *
 * @param  {@link UpdateEndpointDto} endpoint - the id of the endpoint (GUID)
 *
 */
export async function updateEndpoint(endpoint: UpdateEndpointDto, endpointId: string): Promise<void> {
  const apiPath = `/endpoint/${endpointId}`;
  await axios.put<ApiResult<void>>(
    getApiUrl(apiPath),
    endpoint
  );
  return;
}

/**
 *
 * Delete Endpoint
 *
 * @param  {string} endpointId - the Id of the endpoint (GUID)
 *
 */
export async function deleteEndpoint(endpointId: string): Promise<void> {
  const apiPath = `/endpoint/${endpointId}`;
  const apiResult = await axios.delete<ApiResult<void>>(
    getApiUrl(apiPath)
  );
  return;
}

export async function fetchNetworkData(networkId: string): Promise<Network> {
  const { data: apiResult } = await axios.get<ApiResult<Network>>(
    getApiUrl(`/network-catalog/${networkId}`)
  );
  return apiResult.data;
}

export async function fetchNetworkCuratedResources(networkId: string): Promise<NetworkCuratedResourcesDto> {
  const { data: apiResult } = await axios.get<ApiResult<NetworkCuratedResourcesDto>>(
    getApiUrl(`/network-catalog/${networkId}/resources`)
  );
  return apiResult.data;
}

export async function testEndpoint(endpointUrl: string, body: Record<any, any>): Promise<Record<any, any>> {
  const { data: apiResult } = await axios.post<ApiResult<Record<any, any>>>(
    endpointUrl,
    body
  )
  return apiResult
}

export async function fetchNetworkUsage(
  interval: NetworkDataInterval,
  endpoints: Endpoint[],
  start?: Timestamp,
  end?: Timestamp): Promise<NetworkDataSeriesDto> {
  const apiPath = `/endpoint/data/usage/${interval}`;
  const currentDate = new Date();
  const data: {
    startTimestamp: Timestamp;
    endTimestamp: Timestamp;
    endpoints: Endpoint[]
  } = {
    startTimestamp: currentDate.getTime(),
    endTimestamp: currentDate.getTime(),
    endpoints: endpoints
  };

  if (!end) {
    data.endTimestamp = currentDate.getTime();
  } else {
    data.endTimestamp = end;
  }

  if (!start) {
    const startDate = new Date(currentDate);
    if (interval === NetworkDataInterval.DAILY) {
      startDate.setDate(startDate.getDate() - 7);
    } else if (interval === NetworkDataInterval.HOURLY) {
      startDate.setDate(startDate.getHours() - 24)
    }
    data.startTimestamp = startDate.getTime();
  } else {
    data.startTimestamp = start;
  }

  data.endpoints = endpoints;
  const { data: apiResult } = await axios.get<ApiResult<NetworkDataSeriesDto>>(
    getApiUrl(apiPath),
    {
      params: { ...data },
    }
  );

  return apiResult.data;
}