import { NetworkCuratedResourcesDto } from '@blockspaces/shared/dtos/network-catalog';
import { NetworkDataInterval, NetworkDataSeriesDto } from '@blockspaces/shared/dtos/networks/data-series';
import { AddEndpointDto, GetEndpointsResponseDto, UpdateEndpointDto } from '@blockspaces/shared/dtos/endpoints';
import ApiResult, { AsyncApiResult } from '@blockspaces/shared/models/ApiResult';
import { Network } from '@blockspaces/shared/models/networks';
import { Timestamp } from '@blockspaces/shared/types/date-time';
import { BaseHttpTransport } from '@src/platform/api';
import { getApiUrl } from '@src/platform/utils';
import { Endpoint } from '@blockspaces/shared/models/endpoints/Endpoint';
import { date } from 'yup/lib/locale';

/**
 * Provides interaction with API endpoints related to Pocket Network functionality
 */
export class EndpointsTransport extends BaseHttpTransport {
  static readonly instance: EndpointsTransport = new EndpointsTransport();

  /**
   *
   * FetchEndpoints - Get the endpoints owned by the tenant of the logged in user
   *
   * @returns {@link GetEndpointsResponseDto} - The array of endpoints
   *
   */
  async fetchEndpoints(networkId: string): Promise<GetEndpointsResponseDto> {
    const apiPath = `/endpoint/${networkId}`;
    const { data: apiResult } = await this.httpService.get<ApiResult<GetEndpointsResponseDto>>(
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
  async addEndpoint(endpoint: AddEndpointDto): Promise<void> {
    const apiPath = `/endpoint`;
    await this.httpService.post<ApiResult<void>>(
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
  async updateEndpoint(endpoint: UpdateEndpointDto, endpointId: string): Promise<void> {
    const apiPath = `/endpoint/${endpointId}`;
    await this.httpService.put<ApiResult<void>>(
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
  async deleteEndpoint(endpointId: string): Promise<void> {
    const apiPath = `/endpoint/${endpointId}`;
    const apiResult = await this.httpService.delete<ApiResult<void>>(
      getApiUrl(apiPath)
    );
    return;
  }

  async fetchNetworkData(networkId: string): Promise<Network> {
    const { data: apiResult } = await this.httpService.get<ApiResult<Network>>(
      getApiUrl(`/network-catalog/${networkId}`)
    );
    return apiResult.data;
  }

  async fetchNetworkCuratedResources(networkId: string): Promise<NetworkCuratedResourcesDto> {
    const { data: apiResult } = await this.httpService.get<ApiResult<NetworkCuratedResourcesDto>>(
      getApiUrl(`/network-catalog/${networkId}/resources`)
    );
    return apiResult.data;
  }

  async testEndpoint(endpointUrl: string, body: Record<any, any>): Promise<Record<any, any>> {
    const { data: apiResult } = await this.httpService.post<ApiResult<Record<any, any>>>(
      endpointUrl,
      body
    )
    return apiResult
  }

  async fetchNetworkUsage(
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
    const { data: apiResult } = await this.httpService.get<ApiResult<NetworkDataSeriesDto>>(
      getApiUrl(apiPath),
      {
        params: { ...data },
      }
    );

    return apiResult.data;
  }

}