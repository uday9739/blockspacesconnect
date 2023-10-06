import ApiResult, { AsyncApiResult } from '@blockspaces/shared/models/ApiResult';
import { IUser } from '@blockspaces/shared/models/users';
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { User } from '../../users';
import { ValidRoute } from '../../validation';
import { EndpointsService } from '../services/EndpointsService';
import { AddEndpointDto, GetEndpointsResponseDto, UpdateEndpointDto } from '@blockspaces/shared/dtos/endpoints';
import { EndpointsDashboardService } from '../services/EndpointsDashboardService';
import { NetworkDataInterval, NetworkDataSeriesDto } from '@blockspaces/shared/dtos/networks/data-series';
import { Endpoint } from '@blockspaces/shared/models/endpoints/Endpoint';
import { Timestamp } from '@blockspaces/shared/types/date-time';
import { DateTime } from "luxon";

@Controller('endpoint')
export class EndpointController {
  constructor(
    private readonly endpointsService: EndpointsService,
    private readonly endpointDashboardService: EndpointsDashboardService
  ) {

  }
  /**
   * AddEndpoint - adds an endpoint to the Protocol Router
   * 
   * @param {string} networkId - The network id for the endpoint such as poly-mainnet, eth-mainnet, etc 
   * @param {string=} alias - an optional name that can be used to track usage by the customer
   * @param {string=} token - an optional token that can be used for validation 
   * 
   * @returns {string} {@link string endpointId} - the unique id of the new endpoint added 
   * 
   */
  @Post()
  @ValidRoute()
  async addEndpoint(@User() user: IUser, @Body() data: { data: AddEndpointDto }): AsyncApiResult<void> {
    await this.endpointsService.addEndpoint(data.data, user.activeTenant?.tenantId);
    return ApiResult.success();
  }

  /**
   * UpdateEndpoint - updates an endpoint to the Protocol Router
   * 
   * @param {string} endpointId - The route id for the endpoint to be updated
   * @param {string=} alias - an optional name that can be used to track usage by the customer
   * @param {string=} token - an optional token that can be used for validation 
   * 
   */
  @Put(":endpointId")
  @ValidRoute()
  async updateEndpoint(@User() user: IUser, @Param() params, @Body() data: UpdateEndpointDto): AsyncApiResult<void> {
    await this.endpointsService.updateEndpoint(data, params.endpointId, user.activeTenant?.tenantId)
    return ApiResult.success();
  }

  /**
   * DeleteEndpoint - deletes an endpoint from the Protocol Router
   * 
   * @param {string} endpointId - The route id for the endpoint to be updated
   * 
   */
  @Delete(":endpointId")
  @ValidRoute()
  async deleteEndpoint(@User() user: IUser, @Param() params): AsyncApiResult<void> {
    await this.endpointsService.deleteEndpoint(params.endpointId, user.activeTenant?.tenantId)
    return ApiResult.success();
  }

  /**
   * GetEndpoints - retrieves a list of endpoints from the Protocol Router for the tenant of the logged in user and protocol
   * 
   * @param {string} networkId - The network id for the endpoint such as poly-mainnet, eth-mainnet, etc 
   * 
   * @returns {Endpoint[]} - An array of endpoints
   * 
   */
  @Get(":networkId")
  @ValidRoute()
  async getEndpoints(@User() user: IUser, @Param() params): AsyncApiResult<GetEndpointsResponseDto> {
    const networkId = params.networkId;
    const endpoints = await this.endpointsService.getEndpoints(user.activeTenant?.tenantId, networkId)
    return ApiResult.success(endpoints);
  }

  @Get("data/usage/:interval")
  @ValidRoute()
  async getNetworkUsage(
    @Param() params,
    @Query("startTimestamp") startTimestamp: Timestamp,
    @Query("endTimestamp") endTimestamp: Timestamp,
    @Query("endpoints") stringifiedEndpoints: string[]
  ): AsyncApiResult<NetworkDataSeriesDto> {
    const endpoints: Endpoint[] = stringifiedEndpoints?.map( stringifiedEndpoint => JSON.parse(stringifiedEndpoint) ) || [];
    const interval: NetworkDataInterval = params.interval;
    const startDateTime = DateTime.fromMillis(startTimestamp).toUTC();
    const endDateTime = DateTime.fromMillis(endTimestamp).toUTC();
    const networkUsage: NetworkDataSeriesDto = await this.endpointDashboardService.getNetworkUsageByPeriod(endpoints, startDateTime, endDateTime, interval);
    return ApiResult.success(networkUsage);
  }


}