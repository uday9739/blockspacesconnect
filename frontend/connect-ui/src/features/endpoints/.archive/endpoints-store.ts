import { AddEndpointDto, GetEndpointsResponseDto, UpdateEndpointDto } from "@blockspaces/shared/dtos/endpoints";
import { Network } from "@blockspaces/shared/models/networks";
import { DataStore, IDataStore } from "src/platform/api";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { EndpointsTransport } from "./endpoints-transport";
import { v4 } from "uuid";
import { NetworkCuratedResourcesDto } from "@blockspaces/shared/dtos/network-catalog";
import { NetworkDataInterval, NetworkDataSeriesDto } from "@blockspaces/shared/dtos/networks/data-series";
import { DateTime } from "luxon";
import { Timestamp } from "@blockspaces/shared/types/date-time";

type RangeOption = {
  label: string;
  interval: NetworkDataInterval;
  start: (currentDay?: DateTime, minTime?: DateTime) => Timestamp;
  end: (currentDay?: DateTime) => number;
};
const rangeOptions: RangeOption[] = [
  {
    label: "LAST 30 DAYS",
    interval: NetworkDataInterval.DAILY,
    start: (currentDay): number => currentDay.minus({ days: 30 }).toMillis(),
    end: (currentDay): number => currentDay.toMillis()
  },
  {
    label: "LAST WEEK",
    interval: NetworkDataInterval.DAILY,
    start: (currentDay) => currentDay.minus({ days: 7 }).toMillis(),
    end: (currentDay) => currentDay.toMillis()
  },
  {
    label: "LAST 24 HOURS",
    interval: NetworkDataInterval.HOURLY,
    start: (currentDay) => currentDay.minus({ day: 1 }).toMillis(),
    end: (currentDay) => currentDay.toMillis()
  }
];
type ChartParameters = {
  setMin: number;
  totalsPerInterval: number[];
  yMin: number;
  minRounding: number;
};

export class EndpointsStore implements IDataStore {
  dataStore: DataStore;
  network: Network;
  currentEndpointId: string;
  endpoints: GetEndpointsResponseDto;
  resources: NetworkCuratedResourcesDto;
  networkUsageData: NetworkDataSeriesDto;
  selectedRangeOption: RangeOption = rangeOptions[0];
  rangeOptions: RangeOption[] = rangeOptions;
  chartParameters: ChartParameters;


  constructor(
    dataStore,
    private readonly transport: EndpointsTransport = EndpointsTransport.instance
  ) {
    makeAutoObservable(this);
    this.dataStore = dataStore;
    this.chartParameters = { setMin: undefined, totalsPerInterval: undefined, yMin: undefined, minRounding: 1000000 };

    reaction(
      () => this.endpoints,
      () => {
        this.fetchNetworkUsage();
      }
    );

  }

  reset() {
  }

  async fetchNetworkData(networkId: string) {
    // const cachedNetwork = this.dataStore.networkCatalogStore.getNetwork(networkId);
    // const network = cachedNetwork || (await this.transport.fetchNetworkData(networkId));
    // runInAction(() => (this.network = network));
  }

  async fetchEndpoints(networkId: string) {
    const endpoints = await this.transport.fetchEndpoints(networkId);
    runInAction(() => {
      this.endpoints = endpoints;
      this.currentEndpointId = endpoints[0]?.endpointId
    });
  }

  async deleteEndpoint(endpointId: string, networkId: string) {
    await this.transport.deleteEndpoint(endpointId);
    await this.fetchEndpoints(networkId);
  }

  async updateEndpoint(endpoint: UpdateEndpointDto, endpointId:string, networkId: string) {
    await this.transport.updateEndpoint(endpoint, endpointId);
    await this.fetchEndpoints(networkId);
  }

  async addEndpoint(networkId: string) {
    const endpoint: AddEndpointDto = {
      endpointId: v4(),
      networkId: networkId,
      description: '',
      alias: 'New Endpoint'
    }
    await this.transport.addEndpoint(endpoint);
    await this.fetchEndpoints(networkId);
  }

  async getResources(networkId: string) {
    const resources = await this.transport.fetchNetworkCuratedResources(networkId);
    runInAction(() => (this.resources = resources));
  }

  setCurrentEndpointId = (endpointId: string): void => {
    this.currentEndpointId = endpointId;
  }

  async testEndpoint(endpointUrl: string, body: Record<any, any>) {
    const response = await this.transport.testEndpoint(endpointUrl, body);
    return response;
    // runInAction(() => (this.testResponse = JSON.stringify(response)));
  }

  async fetchNetworkUsage() {
    this.networkUsageData = null;
    const currentTime = DateTime.now().toUTC();
    const currentPeriod = DateTime.utc(currentTime.year, currentTime.month, currentTime.day, this.selectedRangeOption.interval === NetworkDataInterval.HOURLY ? currentTime.hour : 23, this.selectedRangeOption.interval === NetworkDataInterval.HOURLY ? currentTime.minute : 59, this.selectedRangeOption.interval === NetworkDataInterval.HOURLY ? currentTime.second : 59, this.selectedRangeOption.interval === NetworkDataInterval.HOURLY ? currentTime.millisecond : 999);
    const networkUsageData = await this.transport.fetchNetworkUsage(
      this.selectedRangeOption.interval,
      this.endpoints,
      this.selectedRangeOption.start(currentPeriod),
      this.selectedRangeOption.end(currentPeriod)
    );
    runInAction(() => this.networkUsageData = networkUsageData);
  }

  //RelayChart
  get labelsForChart() {
    const labels = this.networkUsageData?.dataTimestamps.map((ts) => {
      const date = DateTime.fromSeconds(ts);
      switch (this.selectedRangeOption.interval) {
        case NetworkDataInterval.HOURLY:
          return `${date.hour + 1}`;

        default:
          return `${date.toUTC().month}/${date.toUTC().day}`;
      }
    });
    return labels;
  }

  get datasetsForChart() {
    const datasets = this.networkUsageData?.data.map( dataset => {
      return {
        endpointId: dataset.categoryId,
        label: dataset.category,
        data: dataset.values,
        backgroundColor: this.network?.primaryColor,
        borderColor: this.network?.primaryColor,
        borderWidth: 1,
        hitRadius: 6,
        fill: {
          target: true,
          above: `${this.network?.primaryColor}${dataset.category === 'All' ? '11' : '33'}`
        }
      };
    });
    return datasets;
  }

  get loadingNetworkUsageData() {
    return this.networkUsageData ? true : false;
  }

}