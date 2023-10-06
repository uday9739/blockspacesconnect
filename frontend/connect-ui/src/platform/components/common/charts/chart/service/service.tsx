import { makeAutoObservable } from "mobx";
import { DateTime } from "luxon";
import { ChartData, ChartOptions, ChartType } from "chart.js";
import numeral from "numeral";
import { getNumberFormat } from "@platform/utils";
import { NetworkData } from "../index";

type PreparedChartData = {
  options: ChartOptions;
  data: ChartData;
};

export type Dataset = {
  id?: number;
  category?: string;
  order?: number;
  type: "bar" | "line";
  label?: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  hitRadius?: number;
  fill?: {
    target?: boolean;
    above?: string;
  };
  hidden?: boolean;
  tooltipData?: any[];
};

type ChartAnalysis = {
  countDatasets: number;
  idsDatasets: string[];
  typesDatasets: string[];
  typesLabels: string[];
  countLabels: number;
  rangesDatasets: number[][];
};

type OptionsFinal<C extends ChartType, CO extends ChartType> = ChartOptions<C> & Omit<ChartOptions<CO>, keyof ChartOptions<C>>;

type Merge<A, B> = { [K in keyof (A | B)]: K extends keyof B ? B[K] : A[K] };

export class ChartService {
  constructor() {
    makeAutoObservable(this);
  }
  testOmit = <C extends ChartType, CO extends ChartType>(args: OptionsFinal<C, CO>) => {
    return args;
  };

  getFinalOptions = <A, B>(args: Merge<A, B>) => {
    return args;
  };

  CHART_OPTIONS: ChartOptions = {
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
      }
    },
    aspectRatio: 2,
    maintainAspectRatio: true
  };

  analyzeData = (type, chartChart, options) => {
    //  const optionsData = pickObjectKeys(options);
    return;
  };

  public prepareDataForChart = <TChartData extends NetworkData>(type: ChartType, chartData: TChartData, options: ChartOptions, colors: string[]): PreparedChartData => {
    const dataAnalysis = this.analyzeData(type, chartData, options);

    const labels: string[] = this.generateLabels(chartData);
    const chartOptions = this.generateOptions(type, chartData, options);
    const datasets: Dataset[] = this.generateDatasets(chartData.data, colors);
    return {
      data: { labels, datasets },
      options: chartOptions
    };
  };

  generateLabels = <TChartData extends NetworkData>(chartData: TChartData): string[] => {
    return chartData?.dataTimestamps?.map((ts) => DateTime.fromMillis(ts).toFormat("M/d")) ?? [];
  };

  generateOptions = <TChartData extends NetworkData>(type: ChartType, chartData: TChartData, options: ChartOptions = {}) => {

    if (options) {
      Object.assign(this.CHART_OPTIONS, options);
      return this.CHART_OPTIONS;
    } else {
      return this.CHART_OPTIONS;
    }
  };

  generateDataSetChart = (dataset: any, id: number, color: string): Dataset => {
    return {
      id,
      type: ["BALANCE", "ONCHAIN_BALANCE", "OFFCHAIN_BALANCE"].find(x => x === dataset.category) ? "line" : "bar",
      order: { "MONEY IN": 0, "MONEY OUT": 1, BALANCE: 2 }[dataset.category],
      label: dataset.category.toUpperCase(),
      data: dataset.values,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
      hitRadius: 6,
      // hidden: false
      hidden: ["ONCHAIN_BALANCE", "OFFCHAIN_BALANCE"].find(x => x === dataset.category) !== undefined,
      tooltipData: dataset.category === "BALANCE" ? dataset.tooltipData : null
    };
  };

  generateDatasets<TChartData extends NetworkData>(datasets, colors: string[]): Dataset[] {
    return datasets.map((dataset: Dataset, index: 0) => {
      const color: string = colors[index % colors.length];
      return this.generateDataSetChart(dataset, index, color);
    });
  }
}
