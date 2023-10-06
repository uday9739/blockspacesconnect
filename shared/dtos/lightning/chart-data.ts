import { Timestamp } from "../../types/date-time";
import { NetworkDataInterval } from "../networks/data-series";
/*
{
  categories: [ "BALANCE", "MONEY IN", "MONEY OUT" ],
  dataTimestamps: [ 1654041600000, 1654128000000, 1654214400000, ],
  data: [
    { category: "BALANCE", values: [1234123, 12344123, 12412] },
    { category: "MONEY IN", values: [1234123, 12344123, 12412] },
    { category: "MONEY OUT", values: [12433123, 444123, 5312] }
  ],
  "dataRange": { "start": 13432421233, "end": 1341341323134, },
  "interval": "daily",
  "totals": [
    { "label": "STARTING BALANCE", "amount": 45849571 },
    { "label": "TOTAL MONEY IN", "amount": 22754081 },
    { "label": "TOTAL MONEY OUT", "amount": 10406459 },
    { "label": "ENDING BALANCE", "amount": 18886947 }
  ]
}
*/
export enum LightningChartCategories {
  ONCHAIN_BALANCE = "ONCHAIN BALANCE",
  OFFCHAIN_BALANCE = "OFFCHAIN BALANCE",
  BALANCE = "BALANCE",
  MONEY_IN = "MONEY IN",
  MONEY_OUT = "MONEY OUT"
}
export enum LightningChartTotalLabels {
  STARTING_BALANCE = "STARTING BALANCE",
  TOTAL_MONEY_IN = "TOTAL MONEY IN",
  TOTAL_MONEY_OUT = "TOTAL MONEY OUT",
  ENDING_BALANCE = "ENDING BALANCE"
}

export class LightningChartData {
  categories: LightningChartCategories[];
  dataTimestamps: Timestamp[];
  data: { category: string; values: any, tooltipData?: { label: string, values: any }[] }[];
  start: Timestamp;
  end: Timestamp;
  interval: NetworkDataInterval;
  timezone: string;
  totals: { label: string; amount: any }[];
}
