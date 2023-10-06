// DTO library for the POKT Dashboard

import { Allow, IsInt } from "class-validator";
import { DateTime, Interval } from "luxon";
import { Timestamp } from "../../../types/date-time";
import { IsGreaterOrEqualTo, IsLessOrEqualTo } from "../../../validation/decorators";

/**
 * Defines the parameters that can be used to filter the POKT token chart on the dashboard
 */
export class PocketTokenChartFilterDto {

  /** the max # days that the date range can span */
  static readonly MAX_DATE_RANGE_DAYS = 30;

  @Allow()
  readonly minTimestamp: Timestamp;

  @Allow()
  readonly maxTimestamp: Timestamp;

  /** the beginning of the range to filter data for (inclusive), as a timestamp */
  @IsInt()
  @IsGreaterOrEqualTo<PocketTokenChartFilterDto>("minTimestamp")
  start: Timestamp;

  /** the end of the range to filter data for (exclusive), as a timestamp */
  @IsInt()
  @IsGreaterOrEqualTo<PocketTokenChartFilterDto>("start")
  @IsLessOrEqualTo<PocketTokenChartFilterDto>("maxTimestamp")
  end: Timestamp;

  constructor(json?: Partial<PocketTokenChartFilterDto>) {
    Object.assign(this, json);

    const now = Date.now();
    this.minTimestamp = this.getMinTimestamp();
    this.maxTimestamp = now;
    this.start = json?.start ?? this.getDefaultStartTimestamp();
    this.end = json?.end ?? now;
  }

  getDateRange(): Interval {
    return Interval.fromDateTimes(
      DateTime.fromMillis(this.start).toUTC(),
      DateTime.fromMillis(this.end).toUTC()
    );
  }

  /** Returns the earliest allowable start timestamp, based on the current UTC time */
  private getMinTimestamp(): Timestamp {
    const daysToSubtract = PocketTokenChartFilterDto.MAX_DATE_RANGE_DAYS;
    return DateTime.utc().startOf("day").minus({ days: daysToSubtract }).toMillis();
  }

  /** returns the default starting timestamp, based on the current UTC time */
  private getDefaultStartTimestamp(): Timestamp {
    return DateTime.utc().startOf("day").minus({weeks: 1}).toMillis()
  }
}

// /** Defines the parameters that can be used to filter the Pocket relay chart on the dashboard */
// export class PocketRelayChartFilterDto extends BaseDto<PocketRelayChartFilterDto> {
//   // TODO use class-validator to add validation for dates (required, start <= end, etc)
//   public startDate: Date = new Date();
//   public endDate: Date = new Date();

//   public interval: PocketDataInterval;
// }

// /** the different intervals that Pocket chart data can be displayed at */
// export enum PocketDataInterval {
//   HOURLY = "hourly",
//   DAILY = "daily"
// }

/** Summary data for the Pocket Dashboard header */
export interface PocketDashboardSummaryDto {

  /** summary data for the entire Pocket Network **/
  /** this network data is not relevant for Pokt network */
  network?: {
    poktAmounts?: NetworkPoktSummary,
    nodeCounts?: NodeCountSummary
  },

  /** summary data for the user's fleet of Pocket nodes */
  userFleet: {
    poktAmounts: UserFleetPoktSummary,
    nodeCounts: NodeCountSummary
  }
}

/** POKT token amount summary data for the entire Pocket Network */
interface NetworkPoktSummary {

  /** total amount of POKT across the entire Pocket Network */
  total: number

  /** total amount of unstaked POKT */
  unstaked: number,

  /** number of tokens minted within a given timeframe (i.e. 24h) */
  minted?: number

}

/** POKT token amount summary data for a user's fleet of nodes */
interface UserFleetPoktSummary {

  /** total amount of POKT across a user's fleet (typically {@link staked} + {@link unstaked}) */
  total: number,

  /** total amount of staked POKT across a user's fleet */
  staked: number

  /**
   * total amount of unstaked POKT across a user's fleet
   *
   * unstaked amounts will only be provided for the user's fleet, and not the entire Pocket network
   */
  unstaked: number,

  /**
   * Total POKT earned by the user's fleet within a given timeframe (i.e. 24h)
   *
   * earned amounts will only be provided for the user's fleet, and not the entire Pocket network
   */
  earned?: number
}

/** Node count summary data (either for entire network or a user's node fleet) */
interface NodeCountSummary {

  /** total number of nodes */
  total: number,

  /** total number of healthy nodes
   * node is running a receiving relays */
  healthy: number,

  /** total number of unhealthy nodes
   * node is running but not receiving relays */
  unhealthy: number,

  /** total number of actively operating nodes */
  /** for Pokt total and active should be equal */
  active?: number,

  /** total number of inactive nodes */
  /** for Pokt we will not have inactive node counts */
  inactive?: number,

  /** total number of offline nodes */
  /** for Pokt this is not applicable */
  offline?: number,

  /** total jailed nodes */
  /** don't need to show if the nodes are jailed */
  jailed?: number
}
