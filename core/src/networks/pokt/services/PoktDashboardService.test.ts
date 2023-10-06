import { createMock } from "ts-auto-mock";
import { PoktDashboardService } from "./PoktDashboardService";
import { PoktDashboardQueries, PoktRelayData } from "../../../node-monitoring-db";
import { CustomerNodeService } from "../../../service-catalog";
import { NetworkDataByCategory, NetworkDataContext, NetworkDataInterval, NetworkDataSeriesDto } from "@blockspaces/shared/dtos/networks/data-series";
import { DateTime } from "luxon";
import { Timestamp } from "@blockspaces/shared/types/date-time";


describe(PoktDashboardService, () => {
  let poktDashboardService: PoktDashboardService;
  let mockResponse: {
    poktRelayData: PoktRelayData,
    networkDataSeriesDto: NetworkDataSeriesDto,
    datasets: NetworkDataByCategory[],
    dataTimestamps: Timestamp[]
  };
  let mocks: {
    nodeMonitoringDataService: PoktDashboardQueries,
    customerNodeService: CustomerNodeService,
    dateRange: { start: DateTime, end: DateTime },
    networkData: NetworkDataSeriesDto,
  };

  beforeEach(() => {
    let datasets: NetworkDataByCategory;
    let timestamp: Timestamp;
    mockResponse = {
      poktRelayData: createMock<PoktRelayData>({
        period: "daily",
        address: "string",
        chain: "01",
        relays: 10,
        earned: 12,
        minted: 33,
      }),
      networkDataSeriesDto: createMock<NetworkDataSeriesDto>(),
      datasets: createMock<NetworkDataByCategory[]>([datasets,datasets,datasets]),
      dataTimestamps: createMock<Timestamp[]>([timestamp,timestamp,timestamp]),
    };
    mocks = {
      nodeMonitoringDataService: createMock<PoktDashboardQueries>({
        getNetworkPoktRelayData(): Promise<PoktRelayData[]> {
          return Promise.resolve([mockResponse.poktRelayData,mockResponse.poktRelayData,mockResponse.poktRelayData]);
        },
        getFleetPoktRelayData(): Promise<PoktRelayData[]> {
          return Promise.resolve([mockResponse.poktRelayData,mockResponse.poktRelayData,mockResponse.poktRelayData]);
        },
      }),
      customerNodeService: createMock<CustomerNodeService>(),
      dateRange: createMock<{ start: DateTime, end: DateTime }>({
        start: "2022-06-21T00:00:59.000Z",
        end: "2022-06-27T23:59:59.000Z"
      }),
      networkData: createMock<NetworkDataSeriesDto>(),
    };
    poktDashboardService = new PoktDashboardService(mocks.nodeMonitoringDataService, mocks.customerNodeService);
    // jest.spyOn(poktDashboardService as any, 'getPoktRelayChartDataByPeriod').mockResolvedValueOnce([]);
    jest.spyOn(poktDashboardService as any, 'buildPoktTokenDataSeries').mockResolvedValueOnce(mockResponse.networkDataSeriesDto);
    jest.spyOn(poktDashboardService as any, 'getCustomerNodeAddresses').mockResolvedValueOnce(["string"]);
  });

  /**
 * User Fleet Network Relay Chart Data
 */
  it(`${PoktDashboardService.name} should respond with User Fleet Relay data`, async () => {
    const response = await poktDashboardService.getRelayData(
      21,
      mocks.dateRange.start,
      mocks.dateRange.end,
      NetworkDataInterval.DAILY,
      NetworkDataContext.USER_FLEET
    );
    expect(response).toBeDefined();
  });

  /**
 * Blockspace Client Network Relay Chart Data
 */
  it(`${PoktDashboardService.name} should respond with Blockspace client Relay data`, async () => {
    const response = await poktDashboardService.getRelayData(
      0,
      mocks.dateRange.start,
      mocks.dateRange.end,
      NetworkDataInterval.DAILY,
      NetworkDataContext.WHOLE_NETWORK
    );
    expect(response).toBeDefined();
  });

  // TODO add proper unit tests
  it.skip("add actual tests!!!", () => { });
  // it(`${PoktDashboardService} should respond with Pocket Network summary`, async () => {
  //   //mocks.testDataSource.getSummary = jest.fn().mockReturnValue(PoktDashboardServiceTestData.validGetSummaryResponse)
  //   const response = await poktDashboardService.getSummary({clientID: 1})
  //   expect(response.success).toBeTruthy()
  //   expect(response.data.userFleet.poktAmounts).toBeDefined()
  //   expect(response.data.userFleet.nodeCounts.total).toBeDefined()
  //   expect(response.data.userFleet.nodeCounts.healthy).toBeDefined()
  //   expect(response.data.userFleet.nodeCounts.unhealthy).toBeDefined()
  // });
  // it(`${PoktDashboardService} should respond with an error when Pokt Summary data is unavailable`, async () => {
  //   mocks.testDataSource.getSummary = jest.fn().mockReturnValue(PoktDashboardServiceTestData.failedGetSummaryResponse)
  //   const response = await poktDashboardService.getSummary({clientID: 1})
  //   expect(response.success).toBeFalsy()
  //   expect(response.failureReason).toEqual(PoktFailureReason.SUMMARY_DATA_UNAVAILABLE)
  // });
  // it(`${PoktDashboardService} should respond with Pokt data`, async () => {
  //   //mocks.testDataSource.getPoktData = jest.fn().mockReturnValue(PoktDashboardServiceTestData.poktNetworkDataSeriesWholeNetwork)
  //   const response = await poktDashboardService.getPoktData(NetworkDataContext.USER_FLEET, 1)
  //   expect(response.success).toBeTruthy()
  //   expect(response.networkData.context).toBeDefined()
  //   expect(response.networkData.filter).toBeDefined()
  //   expect(response.networkData.units).toBeDefined()
  //   expect(response.networkData.categories).toBeDefined()
  //   expect(response.networkData.totals).toBeDefined()
  //   expect(response.networkData.data).toBeDefined()
  // });
  // it(`${PoktDashboardService} should respond with an error when  Pokt data is unavailable`, async () => {
  //   //mocks.testDataSource.getPoktData = jest.fn().mockReturnValue(null)
  //   const response = await poktDashboardService.getPoktData(NetworkDataContext.USER_FLEET, 1)
  //   expect(response.success).toBeFalsy()
  //   expect(response.failureReason).toEqual(PoktFailureReason.POKT_DATA_UNAVAILABLE)
  // });
});
