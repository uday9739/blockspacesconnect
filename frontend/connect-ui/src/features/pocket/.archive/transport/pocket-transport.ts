import { NetworkDataContext, NetworkDataInterval, NetworkDataSeriesDto, NetworkDataUnits } from '@blockspaces/shared/dtos/networks/data-series';
import { PocketDashboardSummaryDto, PocketTokenChartFilterDto } from '@blockspaces/shared/dtos/networks/pokt/dashboard';
import config from 'config'
import { BaseHttpTransport } from 'src/platform/api'
import { getApiUrl } from "src/platform/utils";
import ApiResult from '@blockspaces/shared/models/ApiResult';
import { Timestamp } from '@blockspaces/shared/types/date-time';
import { Network, NetworkId } from '@blockspaces/shared/models/networks';

/**
 * Provides interaction with API endpoints related to Pocket Network functionality
 */
export class PocketTransport extends BaseHttpTransport {
  static readonly instance: PocketTransport = new PocketTransport();

  /** Fetch network catalog data for Pocket Network */
  async fetchNetworkData(): Promise<Network> {
    const { data: apiResult } = await this.httpService.get<ApiResult<Network>>(
      getApiUrl(`/network-catalog/${NetworkId.POCKET}`)
    );
    return apiResult.data;
  }

  async fetchSummaryData(): Promise<PocketDashboardSummaryDto> {
    const { data: apiResult } = await this.httpService.get<ApiResult<PocketDashboardSummaryDto>>(getApiUrl("/network/pokt/dashboard/summary"));
    return apiResult.data;
  }

  async fetchPoktData(
    context: NetworkDataContext,
    interval: NetworkDataInterval,
    start?: Timestamp,
    end?: Timestamp
  ): Promise<NetworkDataSeriesDto> {

    let queryParams: PocketTokenChartFilterDto = undefined;

    if (start && end) {
      queryParams = new PocketTokenChartFilterDto({ start, end });
    }

    const { data: apiResult } = await this.httpService.get<ApiResult<NetworkDataSeriesDto>>(
      getApiUrl(`/network/pokt/dashboard/tokens/${context}/${interval}`),
      { params: queryParams }
    );
    return apiResult.data;
  }

  async fetchRelayData(
    context: NetworkDataContext,
    interval: NetworkDataInterval,
    start?: Timestamp,
    end?: Timestamp
  ): Promise<NetworkDataSeriesDto> {

    const apiPath = `/network/pokt/dashboard/relays/${context}/${interval}`;
    let queryParams: PocketTokenChartFilterDto = undefined;

    if (start && end) {
      queryParams = new PocketTokenChartFilterDto({ start, end })
    }
    const { data: apiResult } = await this.httpService.get<ApiResult<NetworkDataSeriesDto>>(
      getApiUrl(apiPath),
      { params: queryParams }
    );

    return apiResult.data;
  }
}
