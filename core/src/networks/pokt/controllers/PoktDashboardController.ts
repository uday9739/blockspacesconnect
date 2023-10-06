import { NetworkDataContext, NetworkDataInterval, NetworkDataSeriesDto } from "@blockspaces/shared/dtos/networks/data-series";
import { PocketDashboardSummaryDto, PocketTokenChartFilterDto } from "@blockspaces/shared/dtos/networks/pokt/dashboard";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { IUser } from "@blockspaces/shared/models/users";
import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { Interval } from "luxon";
import { EnvironmentVariables, ENV_TOKEN } from "../../../env";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import { User } from "../../../users";
import { ValidRoute } from "../../../validation";
import { PoktDashboardService } from "../services/PoktDashboardService";

@Controller("network/pokt/dashboard")
export class PoktDashboardController {
  constructor(
    private readonly poktDashboardService: PoktDashboardService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
  ) {
    logger.setModule(this.constructor.name); }

  /**
   * Summary data for Logged in User and Whole Network
   */
  @Get("summary")
  async getSummary(@User() user: IUser): Promise<ApiResult<PocketDashboardSummaryDto>> {

    const customerId = this.getCustomerId(user);
    const summaryDto: PocketDashboardSummaryDto = await this.poktDashboardService.getUserFleetSummary(customerId);
    return ApiResult.success(summaryDto);
  }

  /**
   * Detailed data that makes up the Summary Data Response.
   */
  @Get("tokens/:requestedContext/:interval")
  @ValidRoute()
  async getTokenData(
    @Param("requestedContext") requestedContext: NetworkDataContext,
    @Param("interval") interval: NetworkDataInterval,
    @Query() chartFilter: PocketTokenChartFilterDto,
    @User() user: IUser
  ): Promise<ApiResult<NetworkDataSeriesDto>> {

    const customerId = this.getCustomerId(user);
    const dateRange: Interval = chartFilter.getDateRange();
    let chartData: NetworkDataSeriesDto;

    if (requestedContext === NetworkDataContext.USER_FLEET) {
      chartData = await this.poktDashboardService.getUserFleetPoktChartData(customerId, dateRange, interval);
    } else {
      // We don't have Network Pokt Chart data yet, this should just receive the User Fleet Chart Data
      // chartData = await this.poktDashboardService.getNetworkPoktChartData(dateRange, interval);
      chartData = await this.poktDashboardService.getUserFleetPoktChartData(customerId, dateRange, interval);
    }

    return ApiResult.success(chartData);

  }

  @Get("relays/:context/:interval")
  @ValidRoute()
  async getRelayData(
    @Param("context") context: NetworkDataContext,
    @Param("interval") interval: NetworkDataInterval,
    @Query() chartFilter: PocketTokenChartFilterDto,
    @User() user: IUser): Promise<ApiResult> {

    const customerId = this.getCustomerId(user);
    const dateRange: Interval = chartFilter.getDateRange();
    const responseData = await this.poktDashboardService.getRelayData(
      customerId,
      dateRange.start,
      dateRange.end,
      interval || NetworkDataInterval.DAILY,
      context || NetworkDataContext.USER_FLEET
    );

    return ApiResult.success(responseData);
  }

  private getCustomerId(user: IUser) {
    return (this.env.isProduction) ? user.whmcs.clientId : 21;  // 21 is the BlockSpaces WHMCS Client ID
  }
}
