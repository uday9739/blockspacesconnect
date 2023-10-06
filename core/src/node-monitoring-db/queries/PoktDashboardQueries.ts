import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { Timestamp } from "@blockspaces/shared/types/date-time";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DateTime, Interval } from "luxon";
import { QueryResult } from "pg";
import { IntervalDateFormats } from ".";
import { PostgresQueryRunner } from "../../platform/postgres";
import * as sql from "./PoktDashboardQueries.sql";

/**
 * Provides methods to run queries against node monitoring data related to the Pocket Dashboard
 */
@Injectable()
export class PoktDashboardQueries {
  constructor(private readonly queryRunner: PostgresQueryRunner) { }

  /**
   * Returns the latest POKT token totals for the entire Pocket network
   * @param qc Query Criteria
   * @returns BlockSpace Fleet Summary
   */
  async getNetworkPoktTokenAmounts(): Promise<PoktTokenAmounts> {
    try {
      let results: QueryResult<PoktTokenAmounts>;
      let query = sql.NETWORK_POKT_TOKEN_AMOUNTS;
      results = await this.queryRunner.query<PoktTokenAmounts>(query);

      if (!results.rowCount) {
        return {
          staked: 0,
          unstaked: 0,
          nodeCount: 0
        }
      } else {
        return results.rows[0];
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  /**
   * Get a breakdown of POKT token amounts, at specified intervals, for the entire Pocket network
   *
   * @param dateRange the date range to fetch data for
   * @param dataIntervals the intervals at which data should be aggregated
   */
  async getNetworkPoktTokensByInterval(dateRange: Interval, dataIntervals: NetworkDataInterval): Promise<PoktTokenSnapshot[]> {
    let result: QueryResult<PoktTokenSnapshot>;
    let query = sql.NETWORK_POKT_TOKENS_BY_INTERVAL;
    query = query.replaceAll("${interval}", IntervalDateFormats[dataIntervals]);
    result = await this.queryRunner.query<PoktTokenSnapshot>(query, [dateRange.start.toISO(), dateRange.end.toISO()]);

    return result.rowCount ? result.rows : [];
  }
  /**
   * Gets the latest POKT token amounts for a given list of nodes (fleet)
   */
  async getFleetPoktTokenAmounts(clientNodeIds: string[]): Promise<PoktTokenAmounts> {
    let results: QueryResult<PoktTokenAmounts>;
    let query = sql.FLEET_POKT_TOKEN_AMOUNTS;
    query = query.replaceAll("${clientNodes}", createSqlStringList(clientNodeIds));
    results = await this.queryRunner.query<PoktTokenAmounts>(query);

    if (!results.rowCount) {
      return {
        staked: 0,
        unstaked: 0,
        nodeCount: 0
      }
    } else {
      return results.rows[0];
    }
  }
  /**
   * Get a breakdown of POKT token amounts, at specified intervals, for a given list of nodes (fleet)
   *
   * @param dateRange the date range to fetch data for
   * @param dataIntervals the intervals at which data should be aggregated
   */
  async getFleetPoktTokensByInterval(dateRange: Interval, clientNodeIds: string[], dataIntervals: NetworkDataInterval): Promise<PoktTokenSnapshot[]> {
    let result: QueryResult<PoktTokenSnapshot>;
    let query = sql.FLEET_POKT_TOKENS_BY_INTERVAL;
    query = query.replaceAll("${clientNodes}", createSqlStringList(clientNodeIds));
    query = query.replaceAll("${interval}", IntervalDateFormats[dataIntervals]);

    result = await this.queryRunner.query<PoktTokenSnapshot>(query, [dateRange.start.toISO(), dateRange.end.toISO()]);

    return result.rowCount ? result.rows : [];
  }
  /**
   * Gets the number of healthy nodes in a given array of node addresses
   */
  async getFleetHealthyNodeCount(nodeAddresses: string[]) {
    let result: QueryResult<HealthyNodeCount>;
    let query = sql.FLEET_HEALTHY_NODE_COUNT;
    query = query.replaceAll("${clientNodes}", createSqlStringList(nodeAddresses));

    result = await this.queryRunner.query<HealthyNodeCount>(query);

    return result.rowCount ? result.rows[0].healthy : 0;
  }
  /**
   * Gets the number of healthy nodes for the whole Pocket network
   */
  async getNetworkHealthyNodeCount() {
    let result: QueryResult<HealthyNodeCount>;

    result = await this.queryRunner.query<HealthyNodeCount>(sql.NETWORK_NODE_HEALTH);
    return result.rowCount ? result.rows[0].healthy : 0;
  }

  async getNetworkPoktRelayData(startDate: DateTime, endDate: DateTime, interval: IntervalDateFormats): Promise<PoktRelayData[]> {
    let result: QueryResult<PoktRelayData>;
    let query = sql.NETWORK_POKT_RELAYS;
    query = query.replaceAll("${interval}", interval);

    result = await this.queryRunner.query<PoktRelayData>(query, [startDate.toISO(), endDate.toISO()]);

    return result.rowCount ? result.rows : [];
  }

  async getFleetPoktRelayData(clientNodeIds: string[], startDate: DateTime, endDate: DateTime, interval: IntervalDateFormats): Promise<PoktRelayData[]> {
    let result: QueryResult<PoktRelayData>;
    let query = sql.FLEET_POKT_RELAYS;
    query = query.replaceAll("${interval}", interval);
    query = query.replaceAll("${clientNodes}", createSqlStringList(clientNodeIds));

    result = await this.queryRunner.query<PoktRelayData>(query, [startDate.toISO(), endDate.toISO()]);

    return result.rowCount ? result.rows : [];
  }
}

/**
 * Transforms a string array in to a list of strings suitable for use in a SQL query (i.e. in an IN clause)
 */
function createSqlStringList(strings: string[]): string {
  if (!strings || !strings.length) return "''";

  return `'${strings.join("','")}'`;
}

interface HealthyNodeCount {
  healthy: number;
}

export interface PoktChainData {
  period: string;
  chain: string;
  relays: number;
}

/** Network Relay Raw Data from QuestDB */
export interface PoktRelayData {
  period: string;
  address: string;
  chain: string;
  relays: number;
  earned: number;
  minted: number;
}

/**
 * Total POKT token amounts.
 *
 * This may represent total for a specific group of nodes or the entire Pocket network
 */
export interface PoktTokenAmounts {
  /** amount of staked POKT */
  staked: number;

  /** amount of unstaked POKT */
  unstaked: number;

  /** the number of nodes that the POKT tokens are spread across */
  nodeCount: number;
}

/** Snapshot of POKT token amounts at a given point in time */
export interface PoktTokenSnapshot {
  /** Date the staked and unstaked amounts were recorded (in yyyy-MM-dd format). */
  aDate: string;

  /** staked amount at this specified timestamp */
  staked: number;

  /** unstaked amount at the specified timestamp */
  unstaked: number;

  /** the number of nodes that the POKT tokens are spread across */
  nodeCount?: number;
}

