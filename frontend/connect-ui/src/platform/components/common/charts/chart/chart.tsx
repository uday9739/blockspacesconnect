import React, { useEffect, useState } from "react";
import "chart.js/auto";
import { observer } from "mobx-react-lite";
import { ChartProps, ChartTypes } from "./";
import { ChartService } from "./service/service";
import { Line, Bar } from "./charts";
import "chartjs-adapter-date-fns";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, BarElement, Tooltip, Legend } from "chart.js";
ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, BarElement, Tooltip, Legend);
import "chart.js/auto";
import { _DeepPartialObject } from "chart.js/types/utils";
import { v4 as uuid } from "uuid";
/**
 * - chart component, a wrapper around chart.js
 * - takes chart data and interprets it into a chart.
 * - {@link ChartProps}
 * @prop type - type of chart
 * @prop  chartData
 * @prop options - optional [Chart.js options docs](https://www.chartjs.org/docs/latest/general/options.html)
 */
export const Chart: React.FC<React.PropsWithChildren<ChartProps>> = observer(({ type, data = null, chartData = null, options = {}, colors = ["#00B8F2", "#BE19F7", "#7A1AF7"] }: ChartProps) => {
  /** instantiantes a service for the chart */
  const [service, setService] = useState(new ChartService());
  const [datasetIdKey, setDatasetIdKey] = useState(uuid());
  const [optionsPrepared, setOptionsPrepared] = useState(options ?? {} as any);
  const [dataPrepared, setDataPrepared] = useState({ datasets: [], labels: [] });
  const { prepareDataForChart } = service;
  /**
   * transforms the data for the chart everytime chart gets new data
   */
  useEffect(() => {
    if (chartData) {
      const dataReady = prepareDataForChart(type, chartData, options, colors);
      dataPrepared.datasets = dataReady.data.datasets;
      dataPrepared.labels = dataReady.data.labels;
      setOptionsPrepared(dataReady.options);
      setDatasetIdKey(uuid());
    }
    return () => { };
  }, [chartData]);

  useEffect(() => {
    if (data) {
      dataPrepared.datasets = data.datasets;
      dataPrepared.labels = data.labels;
      setOptionsPrepared(options);
      setDatasetIdKey(uuid());
    }
    return () => { };
  }, [data]);

  return (
    dataPrepared &&
    {
      [ChartTypes.LINE]: <Line datasetIdKey={datasetIdKey} data={dataPrepared} options={optionsPrepared} redraw />,
      [ChartTypes.BAR]: <Bar datasetIdKey={datasetIdKey} data={dataPrepared} options={optionsPrepared} redraw />
    }[type]
  );
});
