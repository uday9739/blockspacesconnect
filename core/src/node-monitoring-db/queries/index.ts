/** The interval syntax for date range database Queries. */
export enum IntervalDateFormats {
  /** Returns data by Month */
  "monthly" = "yyyy-MM",
  /** Returns data by the day */
  "daily" = "yyyy-MM-dd",
  /** Returns data by the hour */
  "hourly" = "yyyy-MM-dd HH",
  /** Down to the minute */
  "minute" = "yyyy-MM-dd HH:mm",
  /** Down to the second */
  "second" = "yyyy-MM-dd HH:mm:ss"
}

export * from './EndpointsDashboardQueries';
export * from './PoktDashboardQueries';
