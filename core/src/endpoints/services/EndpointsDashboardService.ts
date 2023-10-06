import { NetworkDataByCategory, NetworkDataContext, NetworkDataInterval, NetworkDataSeriesDto, NetworkDataUnits } from "@blockspaces/shared/dtos/networks/data-series";
import { Endpoint } from "@blockspaces/shared/models/endpoints/Endpoint";
import { Injectable } from "@nestjs/common";
import { EndpointsDashboardQueries, NetworkUsageAmounts } from "../../node-monitoring-db/queries/EndpointsDashboardQueries";
import { DateTime } from "luxon";
import { Timestamp } from "@blockspaces/shared/types/date-time";
import { IntervalDateFormats } from "../../node-monitoring-db";

@Injectable()
export class EndpointsDashboardService {
  constructor(
    private readonly endpointUsageDataService: EndpointsDashboardQueries,

  ) {

  }

  async getNetworkUsageByPeriod(
    endpoints: Endpoint[],
    startDateTime: DateTime,
    endDateTime: DateTime,
    interval: NetworkDataInterval
  ): Promise<NetworkDataSeriesDto> {
    if (interval !== NetworkDataInterval.DAILY && interval !== NetworkDataInterval.HOURLY) {
      interval = NetworkDataInterval.DAILY;
    }
    const networkUsageAmounts: NetworkUsageAmounts[] = await this.endpointUsageDataService.getNetworkUsageByInterval(startDateTime, endDateTime, endpoints, interval);
    const [datasets, dataTimestamps] = this.getChartDataByPeriod(networkUsageAmounts, endpoints, interval);
    const startDate: Date = new Date(startDateTime.toString());
    const endDate: Date = new Date(endDateTime.toString());
    const networkDataSeries: NetworkDataSeriesDto = {
      context: NetworkDataContext.USER_FLEET,
      filter: {
        interval: interval,
        dateRange: {
          start: startDate,
          end: endDate
        }
      },
      units: NetworkDataUnits.TRANSACTIONS,
      categories: datasets.map(dataset => dataset.category),
      data: datasets,
      dataTimestamps: dataTimestamps,
      totals: [],
    }
    return networkDataSeries;
  }

  // PRIVATE METHODS
  private getChartDataByPeriod(rawData: NetworkUsageAmounts[], endpoints: Endpoint[], interval: NetworkDataInterval): [datasets: NetworkDataByCategory[], dataTimestamps: Timestamp[]] {

    /** Creates distinct list of periods returned from Quest for Filtering */
    const distinctPeriods: NetworkUsageAmounts["aDate"][] = Array.from(new Set(rawData.map((item: any) => item.aDate)));

    /** Generate empty datasets for given periods for all supported chains */
    const datasets: NetworkDataByCategory[] = endpoints.map( endpoint => ({
      categoryId:endpoint.endpointId,
      category:endpoint.alias,
      values: Array.from({ length: distinctPeriods.length }, () => 0)
    }));

    /** Generate timestamps for each period to serve as labels for each period in the graph */
    const dataTimestamps: Timestamp[] = [];
    distinctPeriods.forEach((period) => {
      dataTimestamps.push(DateTime.fromFormat(period, IntervalDateFormats[interval], { zone: 'utc' }).toSeconds());
    });

    /** Sum data for each chain across the dataset */
    const all = datasets.find(dataset => dataset.category === 'All');
    rawData.forEach(data => {
      const dataset = datasets.find(dataset => dataset.categoryId === data.endpoint.substring(1));
      const index = distinctPeriods.indexOf(data.aDate);
      if (dataset) {
        if (all) { all.values[index] = all.values[index] + Number(data.usage) };
        dataset.values[index] = dataset.values[index] + Number(data.usage);
      }
    });

    return [datasets, dataTimestamps];
  }

}