import React from "react";
import { observer } from "mobx-react-lite";

import { Dashboard, Body, Title, ChainData, ChartWrap, RelayTotals, Header, ResetChainSelect } from "./relay-dashboard.styles";

import { Chart, ChartTypes, Total, Loading } from "@platform/common";
import { ChainTotal } from "./chain-total";
import { ChainSelect } from "./chain-select";
import { useRelayData } from "@pocket/queries";
import { usePocketUIStore } from "@pocket/providers";

const usePageData = () => {
  const { relayData, datasetsRelayChart, labelsRelayChart, chains, totalsRelays, relayDataLoading, relayDataError } = useRelayData();
  const { optionsRelayChart } = usePocketUIStore();
  return {
    relayData,
    datasetsRelayChart,
    labelsRelayChart,
    chains,
    totalsRelays,
    optionsRelayChart,
    loading: relayDataLoading,
    error: relayDataError
  };
};

export const RelayDashboard = observer(() => {
  const { relayData, datasetsRelayChart, labelsRelayChart, chains, totalsRelays, optionsRelayChart, loading } = usePageData();
  
  return (
    <Dashboard>
      <Body>
        <Header>
          <Title>RELAYS</Title>
          <ChainSelect />
        </Header>
        <ChartWrap>
          <Loading when={loading}>
            <Chart type={ChartTypes.LINE} data={{ labels: labelsRelayChart, datasets: datasetsRelayChart }} options={optionsRelayChart} />
          </Loading>
        </ChartWrap>
        <Loading when={!totalsRelays}>
          <RelayTotals>
            {totalsRelays?.map((total) => (
              <Total key={`${total.label}-tooltip-relay`} {...total} variation="centered" />
            ))}
          </RelayTotals>
        </Loading>
        <Loading when={loading}>
          <ChainData>
            {chains?.map((dataset, index) => (
              <ChainTotal
                key={`${dataset?.category}-chain-total-${index}`}
                label={dataset?.category}
                amount={dataset?.totalRelays}
                totalRelays={relayData.totals.find((total) => total.label === "RELAYS")?.amount}
              />
            ))}
          </ChainData>
        </Loading>
      </Body>
    </Dashboard>
  );
});
