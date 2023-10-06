import { useQuery } from "@tanstack/react-query";
import { fetchRelayData, fetchSummaryData, fetchPoktData } from "@pocket/api";
import { DateTime } from "luxon";
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { useMemo } from "react";
import { chainDetail } from "@blockspaces/shared/types/pokt-backing-chains";
import { includes, isEmpty } from "lodash";
import { runInAction } from "mobx";
import { usePocketUIStore } from "../chart";

export const usePocketSummaryData = () => {
  const { data: summaryData, isLoading: summaryDataLoading, error: summaryDataError } = useQuery(["pocket-summary-data"], () => fetchSummaryData());

  return {
    summaryData,
    summaryDataLoading,
    summaryDataError
  };
};

export const usePoktData = () => {
  const { dataContext, selectedRangeOption, limitsPoktChart } = usePocketUIStore();
  const currentTime = DateTime.now().toUTC();
  const currentPeriod = DateTime.utc(currentTime.year, currentTime.month, currentTime.day, selectedRangeOption.interval === NetworkDataInterval.HOURLY ? currentTime.hour : 0);
  const { data: poktData, isLoading: poktDataLoading, error: poktDataError } = useQuery(["pokt-data"], () =>
    fetchPoktData(dataContext, selectedRangeOption.interval, selectedRangeOption.start(currentPeriod), selectedRangeOption.end(currentPeriod))
  );

  return {
    poktData,
    poktDataLoading,
    poktDataError,
    poktDatasets: useMemo(() => {
      const colors = { pokt: "#1D8AED" };

      runInAction(() => (limitsPoktChart.setMin = undefined));
      runInAction(() => (limitsPoktChart.totalsPerInterval = Array(poktData?.dataTimestamps.length)));
      runInAction(() => (limitsPoktChart.yMin = undefined));

      const datasets = poktData?.data.map((dataset) => {
        const data = dataset.values.map((value) => Math.floor(value));
        runInAction(() => {
          limitsPoktChart.setMin = Math.min(...data);
          limitsPoktChart.yMin = Math.max(limitsPoktChart.setMin, limitsPoktChart.yMin);
          data.forEach((value, i) => {
            limitsPoktChart.totalsPerInterval[i] = (limitsPoktChart.totalsPerInterval[i] || 0) + value;
          });
        });
        return {
          label: dataset.category,
          data: data,
          backgroundColor: colors[dataset.category],
          borderColor: colors[dataset.category],
          borderWidth: 1,
          hitRadius: 6
        };
      });
      return datasets;
    }, [poktData]),
    labelsPoktChart: useMemo(() => {
      const labels = poktData?.dataTimestamps.map((ts) => {
        const date = DateTime.fromSeconds(ts);
        switch (selectedRangeOption.interval) {
          case NetworkDataInterval.HOURLY:
            return `${date.hour + 1}`;
          default:
            return `${date.toUTC().month}/${date.toUTC().day}`;
        }
      });
      return labels;
    }, [poktData])
  };
};

export const useRelayData = () => {
  const { dataContext, selectedChainOptions, limitsRelayChart, selectedRangeOption } = usePocketUIStore();
  
  const currentTime = DateTime.now().toUTC();
  const currentPeriod = DateTime.utc(currentTime.year, currentTime.month, currentTime.day, selectedRangeOption.interval === NetworkDataInterval.HOURLY ? currentTime.hour : 0);

  const { data: relayData, isLoading: relayDataLoading, error: relayDataError } = useQuery(
    ["relay-data", dataContext, selectedRangeOption.interval, selectedRangeOption.start(currentPeriod), selectedRangeOption.end(currentPeriod)],
    () => fetchRelayData(dataContext, selectedRangeOption.interval, selectedRangeOption.start(currentPeriod), selectedRangeOption.end(currentPeriod)),
  );

  const totalsForSelectedChains = selectedChainOptions?.reduce((acc, chain): number => {
    const foundChain = relayData?.data?.find((item) => item.category === chain.value);
    return acc + foundChain?.totalRelays;
  }, 0);

  return {
    relayData,
    relayDataLoading,
    relayDataError,
    datasetsRelayChart: useMemo(() => {
      runInAction(() => {
        limitsRelayChart.setMin = undefined;
        limitsRelayChart.totalsPerInterval = Array(relayData?.dataTimestamps.length);
        limitsRelayChart.yMin = undefined;
      })

      const datasets = relayData?.data.map((dataset) => {
        const data = dataset.values.map((value) => Math.floor(value));
        runInAction(() => {
          limitsRelayChart.setMin = Math.min(...data);
          if (!limitsRelayChart.yMin) limitsRelayChart.yMin = limitsRelayChart.setMin;
          limitsRelayChart.yMin = Math.min(limitsRelayChart.setMin, limitsRelayChart.yMin);
          data.forEach((value, i) => {
            limitsRelayChart.totalsPerInterval[i] = (limitsRelayChart.totalsPerInterval[i] || 0) + value;
          });
        })

        return {
          label: dataset.category,
          data: data,
          backgroundColor: chainDetail[dataset.category]?.color || "#1D8AED",
          borderColor: chainDetail[dataset.category]?.color || "#1D8AED",
          borderWidth: 1,
          hitRadius: 6,
          fill: { target: true, above: `${chainDetail[dataset.category]?.color || "#1D8AED"}11` },
          hidden: isEmpty(selectedChainOptions)
            ? dataset.category !== "All"
            : !includes(
                selectedChainOptions.map((chain) => chain.label),
                dataset.category
              )
        };
      });
      return datasets;
    }, [selectedChainOptions, relayData]),
    labelsRelayChart: useMemo(() => {
      const labels = relayData?.dataTimestamps.map((ts) => {
        const date = DateTime.fromSeconds(ts);
        switch (selectedRangeOption.interval) {
          case NetworkDataInterval.HOURLY:
            return `${date.hour + 1}`;

          default:
            return `${date.toUTC().month}/${date.toUTC().day}`;
        }
      });
      return labels;
    }, [relayData]),
    totalsForSelectedChains: useMemo(() => {return totalsForSelectedChains}, [relayData]),
    totalsRelays: useMemo(() => {
      if (!selectedChainOptions.length) {
        return relayData?.totals;
      } else {
        return [
          { label: "RELAYS", amount: totalsForSelectedChains },
          { label: `RELAYS / ${{ ["daily"]: "DAY", ["hourly"]: "HOUR" }[selectedRangeOption.interval]}`, amount: totalsForSelectedChains / relayData?.dataTimestamps?.length },
          {
            label: `POKT ${{ ["user-fleet"]: "Earned", ["network"]: "Minted" }[dataContext]}`,
            amount: ((totalsForSelectedChains * 1768) / 1000000) * (dataContext === "network" ? 1 : 0.85)
          },
          {
            label: `POKT ${{ ["user-fleet"]: "Earned", ["network"]: "Minted" }[dataContext]} / ${{ ["daily"]: "DAY", ["hourly"]: "HOUR" }[selectedRangeOption.interval]}`,
            amount: (((totalsForSelectedChains * 1768) / 1000000) * (dataContext === "network" ? 1 : 0.85)) / relayData?.dataTimestamps?.length
          }
        ];
      }
    }, [relayData]),
    chains: useMemo(() => {
      return relayData?.data
        ?.filter((dataset) => {
          return !includes(["All", "Minted", "Earned"], dataset.category);
        })
        .filter((dataset) => {
          runInAction(() => (dataset.totalRelays = dataset.values.reduce((total, val) => total + val)));
          if (dataset.totalRelays > 0) return dataset;
          return null;
        })
        .sort((a, b) => {
          if (a.totalRelays < b.totalRelays) {
            return 1;
          } else if (a.totalRelays > b.totalRelays) {
            return -1;
          }
          return 0;
        });
    }, [relayData])
  };
};
