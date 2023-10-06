import { createMock } from "ts-auto-mock";
import { PoktTokenAmounts, PoktDashboardQueries } from "./PoktDashboardQueries";
import { PostgresQueryRunner } from "../../platform/postgres";
import { ResultsJSON } from "../services/NodeMonitoringPoktData.test.json";
import { QueryResult } from 'pg';
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { Interval } from "luxon";

describe(PoktDashboardQueries, () => {
  let nodeMonitoringDataService: PoktDashboardQueries;
  let mocks: {
    postgresQueryRunner: PostgresQueryRunner,
  };
  beforeEach(() => {
    mocks = {
      postgresQueryRunner: createMock<PostgresQueryRunner>(),
    };
    nodeMonitoringDataService = new PoktDashboardQueries(mocks.postgresQueryRunner);
  });

  /** getPoktFleetNetworkSummary */
  it(`getPoktFleetNetworkSummary`, async () => {
    const results: QueryResult<PoktTokenAmounts> = {
      rows: [ResultsJSON.poktNetworkSummary],
      command: "",
      rowCount: 1,
      oid: 0,
      fields: []
    };
    mocks.postgresQueryRunner.query = jest.fn().mockResolvedValue(results);
    const test = await nodeMonitoringDataService.getFleetPoktTokenAmounts(["123", "456"]);
    expect(test).toBeDefined();
    expect(test.nodeCount).toBe(163);
    expect(test.staked).toBe(2516221085094);
    expect(test.unstaked).toBe(39737623464);
  });

  /** getPoktFleetNetworkSummaryDetails */
  it(`getPoktFleetNetworkSummaryDetails`, async () => {
    const results: QueryResult<PoktTokenAmounts> = {
      rows: ResultsJSON.poktNetworkSummaryDetail,
      command: "",
      rowCount: 1,
      oid: 0,
      fields: []
    };
    mocks.postgresQueryRunner.query = jest.fn().mockResolvedValue(results);
    const dateRange = Interval.before(new Date(), {days: 1});
    const test = await nodeMonitoringDataService.getFleetPoktTokensByInterval(dateRange, [], NetworkDataInterval.DAILY);
    expect(test).toBeDefined();
    expect(test.length).toBe(8);
    expect(test[0].aDate).toBe("2022-06-13");
    expect(test[0].staked).toBe(134978659420635);
    expect(test[0].unstaked).toBe(1067709138753);
    expect(1).toBe(1);
  });

  /** getPoktNetworkSummary */
  it(`${PoktDashboardQueries.name} getPoktNetworkSummary`, async () => {
    const results: QueryResult<PoktTokenAmounts> = {
      rows: [ResultsJSON.poktNetworkSummary],
      command: "",
      rowCount: 1,
      oid: 0,
      fields: []
    };
    mocks.postgresQueryRunner.query = jest.fn().mockResolvedValue(results);
    const test = await nodeMonitoringDataService.getNetworkPoktTokenAmounts();
    expect(test).toBeDefined();
    expect(test.nodeCount).toBe(163);
    expect(test.staked).toBe(2516221085094);
    expect(test.unstaked).toBe(39737623464);
  });

  /** getPoktNetworkSummaryDetails */
  it(`getPoktNetworkSummaryDetails`, async () => {
    const results: QueryResult<PoktTokenAmounts> = {
      rows: ResultsJSON.poktNetworkSummaryDetail,
      command: "",
      rowCount: 1,
      oid: 0,
      fields: []
    };
    mocks.postgresQueryRunner.query = jest.fn().mockResolvedValue(results);
    const dateRange = Interval.before(new Date(), { days: 1 });
    const test = await nodeMonitoringDataService.getNetworkPoktTokensByInterval(dateRange, NetworkDataInterval.DAILY);
    expect(test).toBeDefined();
    expect(test.length).toBe(8);
    expect(test[0].aDate).toBe("2022-06-13");
    expect(test[0].staked).toBe(134978659420635);
    expect(test[0].unstaked).toBe(1067709138753);
    expect(test[0].nodeCount).toBe(8856);
    expect(1).toBe(1);
  });

});
