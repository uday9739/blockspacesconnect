import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { Timestamp } from "@blockspaces/shared/types/date-time";
import { DateTime } from "luxon";

export type RangeOption = {
  label: string;
  interval: NetworkDataInterval;
  start: (currentDay?: DateTime, minTime?: DateTime) => Timestamp;
  end: (currentDay?: DateTime) => number;
};

export const rangeOptions: RangeOption[] = [
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
]