import { NetworkDataByCategory, NetworkDataInterval, NetworkDataSeriesDto } from "@blockspaces/shared/dtos/networks/data-series";
import { Endpoint } from "@blockspaces/shared/models/endpoints/Endpoint";
import { NetworkId } from "@blockspaces/shared/models/networks";
import { Timestamp } from "@blockspaces/shared/types/date-time";
import { DateTime } from "luxon";
import { createMock } from "ts-auto-mock";
import { EndpointsDashboardService } from ".";
import { EndpointsDashboardQueries, NetworkUsageAmounts } from "../../node-monitoring-db";

describe(EndpointsDashboardService, () => {

  let mocks: {
    endpointUsageDataService: EndpointsDashboardQueries
  };

  let endpoints: Endpoint[];

  const currentTime = DateTime.now().toUTC();
  const startDateTime: DateTime = DateTime.utc(currentTime.year, currentTime.month, currentTime.day, 0, 0, 0, 0);
  const endDateTime: DateTime = DateTime.utc(currentTime.year, currentTime.month, currentTime.day, 23, 59, 59, 999);

  mocks = {
    endpointUsageDataService: createMock<EndpointsDashboardQueries>()
  };

  const endpointDashboardService: EndpointsDashboardService = new EndpointsDashboardService(mocks.endpointUsageDataService);

  beforeEach(() => {


  });

  it("Should return an empty data series DTO", async () => {

    endpoints = [];
    const networkDataSeriesDto: NetworkDataSeriesDto = await endpointDashboardService.getNetworkUsageByPeriod(endpoints,
      startDateTime,
      endDateTime,
      NetworkDataInterval.DAILY
    );
    expect(networkDataSeriesDto.data).toEqual([]);

  });

  it("Should get Network Usage with one endpoint", async () => {
    endpoints = [
      createMock<Endpoint>({ endpointId: '1234', networkId: NetworkId.POLYGON })
    ];
    const endpointUsageDataReturn = createMock<NetworkUsageAmounts[]>([{
      aDate: '2022-10-30',
      endpoint: '/1234',
      status_code: '200',
      usage: 20
    }]);

    mocks.endpointUsageDataService.getNetworkUsageByInterval = jest.fn().mockResolvedValue(endpointUsageDataReturn);
    const NetworkDataByCategories = createMock<NetworkDataByCategory[]>([{ ...createMock<NetworkDataByCategory>({ category: '1234', values: [20] }) }]);
    const dataTimestamps: Timestamp[] = createMock<Timestamp[]>([123]);

    jest.spyOn(endpointDashboardService as any, "getChartDataByPeriod").mockReturnValue([NetworkDataByCategories, dataTimestamps]);


    const networkDataSeriesDto: NetworkDataSeriesDto = await endpointDashboardService.getNetworkUsageByPeriod(endpoints,
      startDateTime,
      endDateTime,
      NetworkDataInterval.DAILY
    );

    expect(networkDataSeriesDto).toBeDefined();
    expect(networkDataSeriesDto.categories.length).toEqual(1);
    expect(networkDataSeriesDto.categories[0]).toEqual(endpointUsageDataReturn[0].endpoint.substring(1));
    expect(networkDataSeriesDto.data[0].category).toEqual(endpointUsageDataReturn[0].endpoint.substring(1));
    expect(networkDataSeriesDto.data[0].values[0]).toEqual(endpointUsageDataReturn[0].usage)

  })

  it("Should get Network Usage with two endpoints", async () => {
    endpoints = [
      createMock<Endpoint>({ endpointId: '1234', networkId: NetworkId.POLYGON }),
      createMock<Endpoint>({ endpointId: '3456', networkId: NetworkId.POLYGON })
    ];
    const endpointUsageDataReturn = createMock<NetworkUsageAmounts[]>([{
      aDate: '2022-10-30',
      endpoint: '/1234',
      status_code: '200',
      usage: 20
    }, {
      aDate: '2022-10-30',
      endpoint: '/3456',
      status_code: '200',
      usage: 40
    }])
    const NetworkDataByCategories = createMock<NetworkDataByCategory[]>([
      { ...createMock<NetworkDataByCategory>({ category: '1234', values: [20] }) },
      { ...createMock<NetworkDataByCategory>({ category: '3456', values: [40] }) }
    ]);
    const dataTimestamps: Timestamp[] = createMock<Timestamp[]>([123, 321]);

    jest.spyOn(endpointDashboardService as any, "getChartDataByPeriod").mockReturnValue([NetworkDataByCategories, dataTimestamps]);

    mocks.endpointUsageDataService.getNetworkUsageByInterval = async (startDateTime, endDateTime, endpiontIds, string) => {
      return endpointUsageDataReturn;
    };
    const networkDataSeriesDto: NetworkDataSeriesDto = await endpointDashboardService.getNetworkUsageByPeriod(endpoints,
      startDateTime,
      endDateTime,
      NetworkDataInterval.DAILY
    )
    expect(networkDataSeriesDto.categories.length).toEqual(2);
    expect(networkDataSeriesDto.categories[0]).toEqual('1234');
    expect(networkDataSeriesDto.categories[0]).toEqual(endpointUsageDataReturn[0].endpoint.substring(1));
    expect(networkDataSeriesDto.data[1].category).toEqual('3456');
    expect(networkDataSeriesDto.data[1].category).toEqual(endpointUsageDataReturn[1].endpoint.substring(1));

  })

});