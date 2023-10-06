import { createMock } from "ts-auto-mock";
import { PoktDashboardController } from "./PoktDashboardController";
import { PoktDashboardService } from "../services/PoktDashboardService";
import { NetworkDataContext, NetworkDataInterval, NetworkDataSeriesDto } from "@blockspaces/shared/dtos/networks/data-series";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { EnvironmentVariables } from "../../../env";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { PocketDashboardSummaryDto, PocketTokenChartFilterDto } from "@blockspaces/shared/dtos/networks/pokt/dashboard";
import { IUser } from "@blockspaces/shared/models/users";

describe(PoktDashboardController, () => {
  let poktDashboardController: PoktDashboardController;
  let mocks: {
    poktService: PoktDashboardService;
    logger: ConnectLogger,
    env: EnvironmentVariables,
    user: IUser,
    chartFilter: PocketTokenChartFilterDto,
    networkData: NetworkDataSeriesDto,
  }
  beforeEach(() => {
    mocks = {
      poktService: createMock<PoktDashboardService>(),
      logger: createMock<ConnectLogger>(),
      env: createMock<EnvironmentVariables>(),
      user: createMock<IUser>({
        email: "joe@shmo.com",
        id: "123456",
        whmcs: { clientId: 1 }
      }),
      chartFilter: createMock<PocketTokenChartFilterDto>({
        start: 1655841034000,
        end: 1656349166000,
      }),
      networkData: createMock<NetworkDataSeriesDto>()
    };
    poktDashboardController = new PoktDashboardController(mocks.poktService, mocks.env, mocks.logger);
  });

  /*
   * #####################
   * # getTokenData()
   * #####################
   */
  describe(PoktDashboardController.prototype.getTokenData, () => {

    it(`should return data for whole network when context is ${NetworkDataContext.WHOLE_NETWORK}`, async () => {
      const filterDto = new PocketTokenChartFilterDto();
      const networkTokenData = createMock<NetworkDataSeriesDto>();

      mocks.poktService.getNetworkPoktChartData = async () => networkTokenData;

      const result = await poktDashboardController.getTokenData(NetworkDataContext.WHOLE_NETWORK, NetworkDataInterval.DAILY, filterDto, mocks.user);
      expect(result.data).toStrictEqual(networkTokenData);
    });

    it(`should return data for user's fleet when context is ${NetworkDataContext.USER_FLEET}`, async () => {
      const filterDto = new PocketTokenChartFilterDto();
      const networkTokenData = createMock<NetworkDataSeriesDto>();

      mocks.poktService.getUserFleetPoktChartData = async () => networkTokenData;

      const result = await poktDashboardController.getTokenData(NetworkDataContext.USER_FLEET, NetworkDataInterval.DAILY, filterDto, mocks.user);
      expect(result.data).toStrictEqual(networkTokenData);
    });
  });


  /*
   * #####################
   * # getSummary()
   * #####################
   */
  describe(PoktDashboardController.prototype.getSummary, () => {

    it(`${PoktDashboardController.name} should respond with summary`, async () => {
      const summaryDto = createMock<PocketDashboardSummaryDto>();
      mocks.poktService.getUserFleetSummary = async () => summaryDto;
      const response = await poktDashboardController.getSummary(mocks.user);
      expect(response.status).toBe(ApiResultStatus.Success);
      expect(response.data).toBe(summaryDto);
    });

  });

  /**
   * User Fleet Network Relay Chart Data
   */
  it(`${PoktDashboardController.name} should respond with User Fleet Relay data`, async () => {
    mocks.poktService.getRelayData = jest.fn().mockReturnValue(mocks.networkData);
    const response = await poktDashboardController.getRelayData(
      NetworkDataContext.USER_FLEET,
      NetworkDataInterval.HOURLY,
      mocks.chartFilter,
      mocks.user
    );
    expect(response.data).toBe(mocks.networkData);
  });

  /**
   * Blockspace Client Network Relay Chart Data
   */
  it(`${PoktDashboardController.name} should respond with Blockspace network Relay data`, async () => {
    mocks.poktService.getRelayData = jest.fn().mockReturnValue(mocks.networkData);
    const response = await poktDashboardController.getRelayData(
      NetworkDataContext.WHOLE_NETWORK,
      NetworkDataInterval.HOURLY,
      mocks.chartFilter,
      mocks.user
    );
    expect(response.data).toBe(mocks.networkData);
  });

});
