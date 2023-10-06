import numeral from "numeral";
import { NetworkDataContext } from "@blockspaces/shared/dtos/networks/data-series";
import { chainDetail, supportedChains } from "@blockspaces/shared/types/pokt-backing-chains";
import { makeAutoObservable } from "mobx";
import { ChartOptions } from "chart.js";
import type { IOption } from "@platform/common";
import { Network } from "@blockspaces/shared/models/networks";
import { getNumberFormat } from "src/platform/utils";
import { rangeOptions, RangeOption } from "src/platform/utils";

const chainOptions: IOption[] = supportedChains.map((chain) => ({
  label: chain,
  value: chain,
  image: chainDetail[chain].logo
}));

type LimitsChart = {
  setMin: number;
  totalsPerInterval: number[];
  yMin: number;
  minRounding: number;
};
/**
 * Defines shared state related to the Pocket Network functionality of the BlockSpaces platform
 */
export class PocketStore {
  network?: Network;
  dataContext: NetworkDataContext;

  selectedRangeOption: RangeOption = rangeOptions[0];
  rangeOptions: RangeOption[] = rangeOptions;
  selectedChainOptions: IOption[] = [];
  chainOptions: IOption[] = chainOptions;
  limitsRelayChart: LimitsChart;
  limitsPoktChart: LimitsChart;

  constructor() {
    makeAutoObservable(this);
    this.dataContext = NetworkDataContext.USER_FLEET;
    this.limitsRelayChart = { setMin: undefined, totalsPerInterval: undefined, yMin: undefined, minRounding: 1000000 };
    this.limitsPoktChart = { setMin: undefined, totalsPerInterval: undefined, yMin: undefined, minRounding: 1000000 };
  }

  reset() {
    this.network = undefined;
  }

  toggleContext = () => {
    this.dataContext === NetworkDataContext.USER_FLEET ? (this.dataContext = NetworkDataContext.WHOLE_NETWORK) : (this.dataContext = NetworkDataContext.USER_FLEET);
  };

  selectRange = (range: RangeOption) => {
    this.selectedRangeOption = range;
  };

  setSelectedChains = (chains: IOption[]) => {
    this.selectedChainOptions = chains;
  };

  get optionsRelayChart() {
    const options: ChartOptions = {};
    options.scales = {
      x: {
        grid: { borderColor: "#f1f1f4" },
        ticks: { font: { size: 11 } }
      },
      y: {
        min: 0,
        grid: { borderColor: "#f1f1f4" },
        ticks: {
          font: { size: 11 },
          callback: (value) => {
            return typeof value === "number" ? numeral(value).format(getNumberFormat(value)[0]).toUpperCase() : value;
          }
        }
      }
    };
    options.borderColor = "#f1f1f4";
    options.aspectRatio = 2.5;
    options.plugins = {
      legend: { display: false }
    };
    options.animations = { x: false };
    options.scales.y.min =
      Math.floor((this.limitsRelayChart.yMin * (this.limitsRelayChart.yMin / Math.max(...this.limitsRelayChart.totalsPerInterval))) / this.limitsRelayChart.minRounding) *
      this.limitsRelayChart.minRounding;

    return options;
  }
}
