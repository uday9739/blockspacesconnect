import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { Endpoint } from "@blockspaces/shared/models/endpoints/Endpoint";
import { Timestamp } from "@blockspaces/shared/types/date-time";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DateTime, Interval } from "luxon";
import { QueryResult } from "pg";
import { IntervalDateFormats } from ".";
import { PostgresQueryRunner } from "../../platform/postgres";
import * as sql from "./EndpointsDashboardQueries.sql";

/**
 * Provides methods to run queries against node monitoring data related to the Pocket Dashboard
 */
@Injectable()
export class EndpointsDashboardQueries {
  constructor(private readonly queryRunner: PostgresQueryRunner) { }

  /**
   * Gets a breakdown of the usage by endpoint, date and 
   */
  async getNetworkUsageByInterval(startDateTime: DateTime, endDateTime: DateTime, endpoints: Endpoint[], dataIntervals: NetworkDataInterval): Promise<NetworkUsageAmounts[]> {
    let results: QueryResult<NetworkUsageAmounts>;
    let query = sql.NETWORK_USAGE_BY_INTERVAL;
    let endpointPaths: string[] = endpoints.map( endpoint => `/${endpoint.endpointId}`);
    query = query.replaceAll("${interval}", IntervalDateFormats[dataIntervals]);
    query = query.replaceAll("${endpoints}", createSqlStringList(endpointPaths));
    results = await this.queryRunner.query<NetworkUsageAmounts>(query, [startDateTime.toISO(), endDateTime.toISO()]);

    return results.rowCount > 0 ? results.rows : [];
  }
}

/**
 * Transforms a string array in to a list of strings suitable for use in a SQL query (i.e. in an IN clause)
 */
function createSqlStringList(strings: string[]): string {
  if (!strings || !strings.length) return "''";

  return `'${strings.join("','")}'`;
}

/**
 * Total network usage.
 *
 * This may represent total for a specific group of nodes or the entire Pocket network
 */
export interface NetworkUsageAmounts {
  /** Date the staked and unstaked amounts were recorded (in yyyy-MM-dd format). */
  aDate: string;

  /** amount of staked POKT */
  endpoint: string;

  /** amount of unstaked POKT */
  status_code: string;

  /** the number of nodes that the POKT tokens are spread across */
  usage: number;
}

