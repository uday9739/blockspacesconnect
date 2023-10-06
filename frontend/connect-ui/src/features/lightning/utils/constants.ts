import numeral from "numeral";
import { DateTime } from "luxon";
import { ChartOptions } from "chart.js/auto";

import { Timestamp } from "@blockspaces/shared/types/date-time";
import { getNumberFormat } from "@platform/utils";
import { ChartType, ChartTypeRegistry, TooltipItem } from "chart.js";
import { ChartTypes } from "@platform/common";

/**
 * representation of various units in minutes
 */
export enum InMinutes {
  HOUR = 60,
  DAY = 1440,
  WEEK = 10080,
  MONTH = 43800,
  YEAR = 525600
}

// Range is a range of time expressed bu points of start and end, in milliseconds
export type Range = {
  start: Timestamp;
  end: Timestamp;
};

/**
 * Get the start and end time of a range into the past
 * @param {InMinutes} unitTime - The number of minutes in the past you want to get the range for.
 * @returns An object with two properties, start and end, in timestamps.
 */
// getRangeOfPast is a helper function
export const getRangeOfPast = (unitTime: InMinutes):Range => {
  const end = DateTime.now().endOf("day").toMillis();
  const endDate: DateTime = DateTime.fromMillis(end).plus({day: 1}).startOf('day');
  const start = endDate.minus({ minutes: unitTime }).toMillis();
  return { start, end };
};

/**
 * If the user has not specified a range, then return the range of the past week.
 * @param {InMinutes} minutesBeforeNow - InMinutes
 * @returns A Range object
 */
// INITIAL_CHART_RANGE is  a helper function
export const INITIAL_CHART_RANGE = (): Range => {
  return getRangeOfPast(InMinutes.WEEK);
};

type CustomTooltipItem<T extends TooltipItem<'line'>> = {
  [P in keyof T as Exclude<P, 'dataset'>]: T[P];
} & { dataset: T['dataset'] & { tooltipData: [{label: string, values: number[]}] } }

export const CHART_OPTIONS: ChartOptions = {
  scales: {
    x: {
      grid: { borderColor: "#f1f1f4" },
      ticks: { font: { size: 11 } }
    },
    y: {
      grid: { borderColor: "#f1f1f4" },
      ticks: {
        font: { size: 11 },
        callback: (value) => {
          return typeof value === "number" ? numeral(value).format(getNumberFormat(value)[0]).toUpperCase() : value;
        }
      }
    }
  },
  borderColor: "#f1f1f4",
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        // @ts-ignore
        footer: (tooltipItems: Array<CustomTooltipItem<TooltipItem<'line'>>>) => {
          const label = tooltipItems[0]?.dataset?.label;
          if (label !== 'BALANCE') return;
          const tooltipData = tooltipItems[0]?.dataset?.tooltipData;
          const index = tooltipItems[0]?.dataIndex
          const offchainValue = tooltipData?.find(x => x.label === 'OFFCHAIN')?.values[index];
          return `Lightning: ${numeral(offchainValue)?.format('0,0') ?? "..."}`;
        },
        // @ts-ignore
        beforeFooter: (tooltipItems: Array<CustomTooltipItem<TooltipItem<'line'>>>) => {
          const label = tooltipItems[0]?.dataset?.label;
          if (label !== 'BALANCE') return;
          const tooltipData = tooltipItems[0]?.dataset?.tooltipData;
          const index = tooltipItems[0]?.dataIndex
          const onchainValue = tooltipData?.find(x => x.label === 'ONCHAIN')?.values[index];
          return `On-Chain: ${numeral(onchainValue)?.format('0,0') ?? "..."}`;
        }
      }
    }
  },
  aspectRatio: 2,
  maintainAspectRatio: true
};