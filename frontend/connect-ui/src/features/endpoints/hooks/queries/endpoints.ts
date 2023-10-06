import { useQuery } from "@tanstack/react-query";
import { fetchEndpoints, fetchNetworkCuratedResources, fetchNetworkData, fetchNetworkUsage } from "@endpoints/api";
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { Endpoint } from "@blockspaces/shared/models/endpoints/Endpoint";
import { useMemo } from "react";
import { Network } from "@blockspaces/shared/models/networks";
import { DateTime } from "luxon";
import { rangeOptions } from "@src/platform/utils";

export const useEndpoints = (networkId: string) => {
  const { data: endpoints, isLoading: endpointsLoading, error: endpointsError, refetch: endpointsRefetch } = useQuery(["fetch-endpoints", networkId], () => fetchEndpoints(networkId), { enabled: networkId != null });

  return { endpoints, endpointsLoading, endpointsError, endpointsRefetch };
};

export const useNetworkData = (networkId: string) => {
  const { data: network, isLoading: networkLoading, error: networkError, refetch: networkRefetch } = useQuery(["network-data", networkId], () => fetchNetworkData(networkId), { enabled: networkId != null });

  return { network, networkLoading, networkError, networkRefetch };
};

export const useNetworkCuratedResources = (networkId: string) => {
  const { data: resources, isLoading: resourcesLoading, error: resourcesError, refetch: resourcesRefetch } = useQuery(["network-curated-resources", networkId], () =>
    fetchNetworkCuratedResources(networkId), { enabled: networkId != null }
  );

  return { resources, resourcesLoading, resourcesError, resourcesRefetch };
};

export const useNetworkUsage = (endpoints: Endpoint[], network: Network) => {
  const selectedRangeOption = rangeOptions[0];
  const currentTime = DateTime.now().toUTC();
  const currentPeriod = DateTime.utc(
    currentTime.year,
    currentTime.month,
    currentTime.day,
    selectedRangeOption.interval === NetworkDataInterval.HOURLY ? currentTime.hour : 23,
    selectedRangeOption.interval === NetworkDataInterval.HOURLY ? currentTime.minute : 59,
    selectedRangeOption.interval === NetworkDataInterval.HOURLY ? currentTime.second : 59,
    selectedRangeOption.interval === NetworkDataInterval.HOURLY ? currentTime.millisecond : 999
  );

  const { data: networkUsage, isLoading: networkUsageLoading, error: networkUsageError, refetch: networkUsageRefetch } = useQuery(["network-usage", JSON.stringify(endpoints)], () =>
    fetchNetworkUsage(selectedRangeOption.interval, endpoints, selectedRangeOption.start(currentPeriod), selectedRangeOption.end(currentPeriod))
  );

  return {
    networkUsageLoading,
    networkUsageError,
    networkUsageRefetch,
    networkUsage: networkUsage,
    networkDataset: useMemo(() => {
      const datasets = networkUsage?.data.map((dataset) => {
        return {
          endpointId: dataset.categoryId,
          label: dataset.category,
          data: dataset.values,
          backgroundColor: network.primaryColor,
          borderColor: network.primaryColor,
          borderWidth: 1,
          hitRadius: 6,
          fill: {
            target: true,
            above: `${network?.primaryColor}${dataset.category === "All" ? "11" : "33"}`
          }
        };
      });
      return datasets;
    }, [networkUsage]),
    labelsForChart: useMemo(() => {
      const labels = networkUsage?.dataTimestamps.map((ts) => {
        const date = DateTime.fromSeconds(ts);
        return `${date.toUTC().month}/${date.toUTC().day}`;
      });
      return labels;
    }, [networkUsage])
  };
};
