import React from "react";
import { ChartOptions } from "chart.js";
import { observer } from "mobx-react-lite";

import { StyledUsageSummary, Header, Title, ChartWrap, ChartTotals, ChartScreen, LoadingChart, EmptyChart } from "./usage-summary.styles";

import { Total, UsageChart } from "@platform/common";
import { useEndpoints, useNetworkData, useNetworkUsage } from "../../hooks/queries";
import { useRouter } from "next/router";
import { Amount, Label, StyledTotal } from "@src/platform/components/common/total/total.styles";
import { getFormattedNumber } from "@src/platform/utils";

const usePageData = () => {
  const router = useRouter();
  const { nid } = router.query;
  const { network } = useNetworkData(nid as string);
  const { endpoints } = useEndpoints(nid as string);
  const { networkDataset, labelsForChart, networkUsageLoading } = useNetworkUsage(endpoints, network);

  return {
    networkDataset,
    labelsForChart,
    loading: networkUsageLoading
  };
};

export const UsageSummary = observer(() => {
  const { networkDataset, labelsForChart, loading } = usePageData();

  let totalTXs = 0;
  let avgTXs = 0;
  if (networkDataset) {
    networkDataset.forEach((dataset) => {
      if (!dataset.data.length) return;
      totalTXs += dataset.data.reduce((value, sum) => value + sum);
    });
    avgTXs = totalTXs / labelsForChart?.length;
  }

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
        stepSize: 1
      }
    }
  };
  options.borderColor = "#f1f1f4";
  options.aspectRatio = 2.75;
  options.plugins = {
    legend: { display: false }
  };
  options.animations = { x: false };
  options.scales.y.min = 0;

  return (
    <StyledUsageSummary>
      <Header>
        <Title>Activity</Title>
      </Header>
      <ChartScreen>
        <ChartWrap>
          {labelsForChart?.length > 0 ? (
            <UsageChart labels={labelsForChart} datasets={networkDataset} options={options} />
          ) : loading ? (
            <LoadingChart>Loading...</LoadingChart>
          ) : (
            <EmptyChart>No Transactions This Period</EmptyChart>
          )}
        </ChartWrap>
      </ChartScreen>
      {totalTXs > 0 && (
        <ChartTotals>
          <StyledTotal>
            <Label>{"Total TXs"}</Label>
            <Amount> {getFormattedNumber(totalTXs)}</Amount>
          </StyledTotal>
          <StyledTotal>
            <Label>{"AVG DAILY TXs"}</Label>
            <Amount> {getFormattedNumber(avgTXs)}</Amount>
          </StyledTotal>
        </ChartTotals>
      )}
    </StyledUsageSummary>
  );
});
