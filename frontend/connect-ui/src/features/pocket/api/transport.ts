import { NetworkDataContext, NetworkDataInterval, NetworkDataSeriesDto } from "@blockspaces/shared/dtos/networks/data-series";
import { PocketDashboardSummaryDto, PocketTokenChartFilterDto } from "@blockspaces/shared/dtos/networks/pokt/dashboard";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { Network, NetworkId } from "@blockspaces/shared/models/networks";
import { Timestamp } from "@blockspaces/shared/types/date-time";
import { getApiUrl } from "@src/platform/utils";
import axios from "axios"

export async function fetchNetworkData(): Promise<Network> {
  const { data: apiResult } = await axios.get<ApiResult<Network>>(
    getApiUrl(`/network-catalog/${NetworkId.POCKET}`)
  );
  return apiResult.data;
}

export async function fetchSummaryData(): Promise<PocketDashboardSummaryDto> {
  const { data: apiResult } = await axios.get<ApiResult<PocketDashboardSummaryDto>>(getApiUrl("/network/pokt/dashboard/summary"));
  return apiResult.data;
}

export async function fetchPoktData(
  context: NetworkDataContext,
  interval: NetworkDataInterval,
  start?: Timestamp,
  end?: Timestamp
): Promise<NetworkDataSeriesDto> {

  let queryParams: PocketTokenChartFilterDto = undefined;

  if (start && end) {
    queryParams = new PocketTokenChartFilterDto({ start, end });
  }

  const { data: apiResult } = await axios.get<ApiResult<NetworkDataSeriesDto>>(
    getApiUrl(`/network/pokt/dashboard/tokens/${context}/${interval}`),
    { params: queryParams }
  );
  return apiResult.data;
}

export async function fetchRelayData(
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
  const { data: apiResult } = await axios.get<ApiResult<NetworkDataSeriesDto>>(
    getApiUrl(apiPath),
    { params: queryParams }
  );
  
  return apiResult.data;
}