import { LightningChartData } from "@blockspaces/shared/dtos/lightning";
import { NetworkDataSeriesDto } from "@blockspaces/shared/dtos/networks/data-series";
import { ChartOptions } from "chart.js";

export { Chart } from "./chart";

export type OptionsChart = {
  scales?: {
    x?: any;
    y?: any;
  };
  borderColor?: string;
  plugins?: any;
  animations?: {
    x?: boolean;
  };
  layout?: any;
  responsive?: boolean;
  maintainAspectRatio?: any;
  aspectRatio?: 1 | 2;
  interaction?: any;
  tooltips?: any;
  datasetIdKey?: string;
  options?: any;
};

/**
 * types of charts
 */
export enum ChartTypes {
  LINE = "line",
  BAR = "bar"
}

export type NetworkData = LightningChartData | NetworkDataSeriesDto;

/**
 * - chart component, a wrapper around chart.js
 * - takes chart data and interprets it into a chart.
 * - {@link ChartProps}
 * @prop type - type of chart
 * @prop  chartData
 * @prop options - optional [Chart.js options docs](https://www.chartjs.org/docs/latest/general/options.html)
 */
export interface ChartProps {
  /**
   * ChartTypes - "line" or "bar" chart type requested
   */
  type: ChartTypes;

  /**
   * LightningChartData - raw chartData from the API
   */
  chartData?: NetworkData;

  /**
   * data thats already prepared, legacy pocket
   */
  data?: any;
  /**
   * The options object that is passed into the Chart.js chart
   * @see [Chart.js options docs](https://www.chartjs.org/docs/latest/general/options.html)
   * @default {}
   */
  options?: ChartOptions;

  colors?: string[];
}
