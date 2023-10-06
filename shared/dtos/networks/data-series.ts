import { DateTime } from "luxon";
import { Timestamp } from "../../types/date-time";

/**
 * A general series of data for a blockchain network.
 *
 * This could represent any type of network-related data, such as token amounts or relays
 */
export interface NetworkDataSeriesDto {

  /** the context that the data is being viewed in (i.e. whole network or user's node fleet) */
  context: NetworkDataContext,

  /** data filter parameters */
  filter?: NetworkDataFilter,

  /** the units associated with the data being displayed */
  units: NetworkDataUnits,

  /** the categories that are used to group each of the displayed values */
  categories: string[],

  /** the totals/summary for each category **/
  totals?: NetworkDataTotals[],

  /** the values to display in the chart/graph, grouped by category */
  data: NetworkDataByCategory[],

  /** the timestamps associated with each of the data points */
  dataTimestamps: Timestamp[]
}

export interface NetworkDataFilter {
  /** the interval to view data at (i.e daily, hourly, etc) */
  interval: NetworkDataInterval,

  /** date range to display data for */
  dateRange: {
    start: Date,
    end: Date
  }
}

/**
 * Blockchain network data values, grouped by category.
 */
export interface NetworkDataByCategory {

  /** the non-unique human-readable category label */
  category: string,

  /** the uuid on which this data is grouped  */
  categoryId?: string,

  /** The individual values. This array should contain 1 value per time interval (hour, day, etc) */
  values: number[];

  totalRelays?: number;
}

/** Aggregate totals associated with the data */
export interface NetworkDataTotals {
  /** label for the totals */
  label: string,

  /** the total amount */
  amount: number,

  /** the amount the total increased or decreased between the start and end of the series */
  changedBy?: number,

  /** the percentage by which the total increased or decreased between the start and end of the series */
  changedByPct?: number
}

export namespace NetworkDataTotals {

  /**
   * Create a new totals object from the given data, using the provided function to calculate the total
   */
  export function create(data: NetworkDataByCategory, calculator: (values: number[]) => number): NetworkDataTotals {
    if (!data) {
      return null;
    }

    if (!data.values.length) {
      return { label: data.category, amount: 0, changedBy: 0, changedByPct: 0 };
    }

    const values = data.values;
    const changedBy = values[0] !== 0 ? values[values.length - 1] - values[0] : null;

    return {
      label: data.category,
      amount: calculator(data.values),
      changedBy,
      changedByPct: changedBy !== null ? (changedBy / (values[0])) * 100 : null
    }
  }

  /** Create a new totals object from the given data, where the total will be the sum of the values */
  export function createForSum(data: NetworkDataByCategory) {
    return create(data, (values) => values.reduce((x, y) => x + y, 0));
  }

  /** Create a new totals object from the given data, where the total will be the value at the end of the series */
  export function createForLatestValue(data: NetworkDataByCategory) {
    return create(data, (values) => values[values.length - 1])
  }
}

export enum NetworkDataContext {
  /** data for the entire network*/
  WHOLE_NETWORK = "network",

  /** data for a user's infrastructure */
  USER_FLEET = "user-fleet"
}

/** Interval for data granularity. */
export enum NetworkDataInterval {
  /** show totals for each Month */
  MONTHLY = "monthly",
  /** show totals for each day */
  DAILY = "daily",
  /** show totals for each hour */
  HOURLY = "hourly",
  /** show totals by the minute */
  MINUTE = "minute",
  /** show totals by the second*/
  SECOND = "second"
}

export enum NetworkDataUnits {
  /** amount of POKT tokens */
  POKT = "pokt",

  /** number of relays */
  RELAYS = "relays",

  CHAINS = "chains",

  TRANSACTIONS = "transactions"
}

