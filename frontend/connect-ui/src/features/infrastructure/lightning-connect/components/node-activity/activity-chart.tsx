import React, { useState } from "react";

import { Styles } from "./activity-chart.styles";

import { Range, Loading, Total, ChartTypes, Chart } from "@platform/common";
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { INITIAL_CHART_RANGE, CHART_OPTIONS } from "@lightning/utils";
import { useChartData } from "@lightning/queries";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { formatChartData } from "@lightning/utils/chart";

type ToggleChart = {
  label: string;
  value: string;
  color: string;
  selected: boolean;
};

export const CATEGORY_TOGGLES = (category: string, color: string): ToggleChart => {
  return {
    label: category.toUpperCase(),
    value: category.toUpperCase(),
    color: color,
    selected: true
  };
};

type Props = {};


const usePageData = (interval: NetworkDataInterval, start?: number, end?: number) => {
  const { chartData, chartLoading, chartError } = useChartData(interval, start, end);
  const { data: user } = useGetCurrentUser()
  return {
    chart: formatChartData(chartData?.data),
    displayFiat: user?.appSettings?.bip?.displayFiat,
    loading: chartLoading,
    error: chartError
  };
};

export const ActivityChart = ({}: Props) => {
  const [chartRange, setChartRange] = useState(INITIAL_CHART_RANGE());

  const { Dashboard, Body, ChartWrap, Header, Title, SummaryTotals } = Styles;

  const { chart, loading, error, displayFiat } = usePageData(NetworkDataInterval.DAILY, chartRange.start, chartRange.end);
  return (
    <Dashboard>
      <Body>
        <ChartWrap>
          <Loading when={loading} height="10rem">
            <Chart chartData={chart} type={ChartTypes.BAR} options={CHART_OPTIONS} />
          </Loading>
        </ChartWrap>
      </Body>
    </Dashboard>
  );
};
