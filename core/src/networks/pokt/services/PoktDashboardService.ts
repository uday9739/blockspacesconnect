import {
  NetworkDataByCategory,
  NetworkDataContext,
  NetworkDataInterval,
  NetworkDataSeriesDto,
  NetworkDataUnits
} from "@blockspaces/shared/dtos/networks/data-series";
import { PocketDashboardSummaryDto } from "@blockspaces/shared/dtos/networks/pokt/dashboard";
import { Timestamp } from "@blockspaces/shared/types/date-time";
import { getPoktBackingChainName, supportedChains } from '@blockspaces/shared/types/pokt-backing-chains';
import { Injectable } from "@nestjs/common";
import { DateTime, Interval } from "luxon";
import { IntervalDateFormats, PoktDashboardQueries, PoktRelayData, PoktTokenSnapshot } from "../../../node-monitoring-db";
import { CustomerNodeService } from "../../../service-catalog";
import { UPOKT_PER_POKT } from "../constants";



/**
 * Middle layer that is the intermediate between the Controller and the Data Service.
 */
@Injectable()
export class PoktDashboardService {
  constructor(
    private readonly nodeMonitoringDataService: PoktDashboardQueries,
    private readonly customerNodeService: CustomerNodeService,
  ) { }

  /**
   * Retrieve summary data for a customer's Pocket node fleet.
   *
   * If the customer does not have any Pocket nodes, `null` will be returned.
   */
  async getUserFleetSummary(customerId: number): Promise<PocketDashboardSummaryDto> {
    const nodeAddresses: string[] = await this.getCustomerNodeAddresses(customerId);

    if (!nodeAddresses?.length) {
      return {
        userFleet: {
          poktAmounts: {
            total: 0,
            unstaked: 0,
            staked: 0
          },
          nodeCounts: {
            total: 0,
            healthy: 0,
            unhealthy: 0
          }
        }
      }
    }

    const getFleetNetworkSummary = await this.nodeMonitoringDataService.getFleetPoktTokenAmounts(nodeAddresses);

    const totalNodeCount = nodeAddresses.length;
    const healthyNodeCount = getFleetNetworkSummary.nodeCount; // await this.nodeMonitoringDataService.getPoktNodeHealth(_criteria, true);

    const stakedAmount: number = getFleetNetworkSummary.staked / UPOKT_PER_POKT;
    const unstakedAmount: number = getFleetNetworkSummary.unstaked / UPOKT_PER_POKT;
    const totalAmount: number = stakedAmount + unstakedAmount;

    const summaryResponse: PocketDashboardSummaryDto = {
      userFleet: {
        poktAmounts: {
          total: totalAmount,
          staked: stakedAmount,
          unstaked: unstakedAmount
        },
        nodeCounts: {
          total: totalNodeCount,
          healthy: healthyNodeCount,
          unhealthy: totalNodeCount - healthyNodeCount,
        }
      }
    };

    return summaryResponse;
  }

  /**
   * Gets data for the POKT token chart, for a user's fleet of Pocket nodes
   *
   * @param clientId an ID for the customer
   * @param dateRange the date range to fetch data for
   * @param dataIntervals the intervals at which data should be aggregated (hourly, daily, etc)
   */
  async getUserFleetPoktChartData(
    clientId: number,
    dateRange: Interval,
    dataIntervals: NetworkDataInterval = NetworkDataInterval.DAILY
  ): Promise<NetworkDataSeriesDto> {

    const nodeAddresses = await this.getCustomerNodeAddresses(clientId);
    const rawData: PoktTokenSnapshot[] = await this.nodeMonitoringDataService.getFleetPoktTokensByInterval(
      dateRange,
      nodeAddresses,
      dataIntervals
    );

    return this.buildPoktTokenDataSeries(rawData, NetworkDataContext.USER_FLEET, dataIntervals);
  }

  /**
   * Gets data for the POKT token chart, for the entire Pocket network
   *
   * @param dateRange the date range to fetch data for
   * @param dataIntervals the intervals at which data should be aggregated (hourly, daily, etc)
   */
  async getNetworkPoktChartData(
    dateRange: Interval,
    dataIntervals: NetworkDataInterval = NetworkDataInterval.DAILY
  ): Promise<NetworkDataSeriesDto> {

    const rawData: PoktTokenSnapshot[] = await this.nodeMonitoringDataService.getNetworkPoktTokensByInterval(
      dateRange,
      dataIntervals
    );

    return this.buildPoktTokenDataSeries(rawData, NetworkDataContext.WHOLE_NETWORK, dataIntervals);

  }

  async getRelayData(clientId: number,
    startDate: DateTime,
    endDate: DateTime,
    interval: NetworkDataInterval,
    networkDataContext: NetworkDataContext
  ): Promise<NetworkDataSeriesDto> {

    let poktRelayData: PoktRelayData[];

    if (interval !== NetworkDataInterval.DAILY && interval !== NetworkDataInterval.HOURLY) {
      interval = NetworkDataInterval.DAILY;
    }

    if (networkDataContext === NetworkDataContext.WHOLE_NETWORK) {
      poktRelayData = await this.nodeMonitoringDataService.getNetworkPoktRelayData(
        startDate,
        endDate,
        IntervalDateFormats[interval]
      );
    } else {
      const nodeAddresses = await this.getCustomerNodeAddresses(clientId);
      poktRelayData = await this.nodeMonitoringDataService.getFleetPoktRelayData(
        nodeAddresses,
        startDate,
        endDate,
        IntervalDateFormats[interval]
      );
    }

    const [datasets, dataTimestamps] = this.getPoktRelayChartDataByPeriod(poktRelayData, interval);

    // Remove chains that have no relays in given period
    const filteredDataset = datasets.filter(dataset => dataset.values.length > 0 ? dataset.values.reduce((total, val) => total + val) > 0 : false);

    const sDate: Date = new Date(startDate.toString());
    const eDate: Date = new Date(endDate.toString());
    const all_relay_categories = filteredDataset.find(dataset => dataset.category === 'All');
    const total_relays = all_relay_categories?.values.length > 0 ? filteredDataset.find(dataset => dataset.category === 'All').values.reduce((total, amount) => total + amount) : 0;
    const total_relays_per_period = all_relay_categories?.values.length > 0 ? all_relay_categories.values.reduce((total, amount) => total + amount) / dataTimestamps.length : 0;
    const response: NetworkDataSeriesDto = {
      context: networkDataContext,
      filter: {
        interval: interval,
        dateRange: {
          start: sDate,
          end: eDate
        }
      },
      units: NetworkDataUnits.RELAYS,
      categories: filteredDataset.map(dataset => dataset.category),
      data: filteredDataset,
      dataTimestamps: dataTimestamps,
      totals: [
        {
          label: "RELAYS",
          amount: total_relays
        },
        {
          label: `RELAYS / ${{ ['daily']: 'DAY', ['hourly']: 'HOUR' }[interval]}`,
          amount: total_relays_per_period
        },
        // Commented out due to weighted stake.
        // TODO: Properly calculate POKT earned via weighted stake
        // {
        //   label:`POKT ${{ ['user-fleet']:'Earned', ['network']:'Minted'}[networkDataContext]}`,
        //   amount: filteredDataset.find(dataset => dataset.category === { [ 'user-fleet']:'Earned', ['network']:'Minted'}[networkDataContext]).values.reduce((total, amount) => total + amount)
        // },
        // {
        //   label:`POKT ${{ ['user-fleet']:'Earned', ['network']:'Minted'}[networkDataContext]} / ${{ ['daily']:'DAY', ['hourly']:'HOUR'}[interval]}`,
        //   amount: 
        //   filteredDataset.find(dataset => dataset.category === { [ 'user-fleet']:'Earned', ['network']:'Minted'}[networkDataContext]).values.reduce((total, amount) => total + amount)
        //     / dataTimestamps.length
        // },
      ]
    };

    return response;
  }

  // PRIVATE METHODS
  private getPoktRelayChartDataByPeriod(rawData: PoktRelayData[], interval): [datasets: NetworkDataByCategory[], dataTimestamps: Timestamp[]] {

    /** Creates distinct list of periods returned from Quest for Filtering */
    const distinctPeriods: PoktRelayData["period"][] = Array.from(new Set(rawData.map((item: any) => item.period)));

    /** Generate empty datasets for given periods for all supported chains */
    const chains = ['All', ...supportedChains];
    const datasets: NetworkDataByCategory[] = chains.map(chain => ({
      category: chain,
      values: Array.from({ length: distinctPeriods.length }, () => 0)
    }));

    /** Generate timestamps for each period to serve as labels for each period in the graph */
    const dataTimestamps: Timestamp[] = [];
    distinctPeriods.forEach((period) => {
      dataTimestamps.push(DateTime.fromFormat(period, IntervalDateFormats[interval], { zone: 'utc' }).toSeconds());
    });

    /** Add earned/minted datasets */
    datasets.push({ category: 'Minted', values: Array.from({ length: distinctPeriods.length }, () => 0) });
    datasets.push({ category: 'Earned', values: Array.from({ length: distinctPeriods.length }, () => 0) });

    /** Sum data for each chain across the dataset */
    const all = datasets.find(dataset => dataset.category === 'All');
    const earned = datasets.find(dataset => dataset.category === 'Earned');
    const minted = datasets.find(dataset => dataset.category === 'Minted');
    rawData.forEach(data => {
      const chainDataset = datasets.find(dataset => dataset.category === getPoktBackingChainName(data.chain));
      const index = distinctPeriods.indexOf(data.period);
      if (chainDataset) {
        all.values[index] = all.values[index] + data.relays;
        earned.values[index] = earned.values[index] + data.earned;
        minted.values[index] = minted.values[index] + data.minted;
        chainDataset.values[index] = chainDataset.values[index] + data.relays;
      }
    });

    return [datasets, dataTimestamps];
  }

  /**
   * Creates a data series DTO from raw data
   *
   * @param rawData raw data fetched from node monitoring DB
   * @param context the context for the data (i.e. user/customer fleet vs. entire network)
   */
  buildPoktTokenDataSeries(rawData: PoktTokenSnapshot[], context: NetworkDataContext, interval: NetworkDataInterval): NetworkDataSeriesDto {
    if (!rawData || !rawData.length) {
      return null;
    }

    const dataset: NetworkDataByCategory = {
      category: "pokt",
      values: []
    };

    const dataTimestamps: Timestamp[] = [];

    for (const row of rawData) {
      dataTimestamps.push(DateTime.fromFormat(row.aDate, IntervalDateFormats[interval], { zone: 'utc' }).toSeconds());
      dataset.values.push((row.staked / UPOKT_PER_POKT) + (row.unstaked / UPOKT_PER_POKT));      // convert values from uPOKT to POKT
      // unstakedAmounts.values.push(row.unstaked / UPOKT_PER_POKT);  // convert values from uPOKT to POKT
    }

    // const total = NetworkDataTotals.createForLatestValue(dataset);

    return {
      categories: ["total"],
      context,
      units: NetworkDataUnits.POKT,
      dataTimestamps,
      data: [dataset],
      totals: []
    };

  }

  /**
   * Get a list of the Pocket Node Addresses/IDs for a given customer
   */
  async getCustomerNodeAddresses(customerId: number): Promise<string[]> {
    const customerNodeData = await this.customerNodeService.getCustomerNodes(customerId);

    if (!customerNodeData || !customerNodeData.length) {
      return [];
    }

    return customerNodeData.map(x => x.NODEKEY.toLowerCase());;
  }
}

