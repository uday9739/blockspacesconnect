import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { StyledEndpointsUI } from "./endpoints-ui.styles";
import { Network } from "@platform/routes/networks/network/network";
import { Header, Endpoint, UsageSummary, EndpointSelect } from "@endpoints/components";
import { EndpointWithUrl } from "@blockspaces/shared/models/endpoints/Endpoint";
import { GetEndpointsResponseDto } from "@blockspaces/shared/dtos/endpoints";
import { QueryObserverResult } from "@tanstack/react-query";
import { useEndpoints, useNetworkCuratedResources, useNetworkData } from "@endpoints/queries";
import { Network as TNetwork, UserNetworkStatus } from "@blockspaces/shared/models/networks";
import { NetworkCuratedResourcesDto } from "@blockspaces/shared/dtos/network-catalog";
import { Loading } from "@src/platform/components/common";
import { useGetUserNetworks } from "@src/platform/hooks/user/queries";
import { NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { BillingTier, BillingTierCode } from "@blockspaces/shared/models/network-catalog/Tier";
import Alert from "@mui/material/Alert";

type PageData = {
  endpoints: GetEndpointsResponseDto;
  endpointsRefetch: () => Promise<QueryObserverResult<GetEndpointsResponseDto, unknown>>;
  network: TNetwork;
  networkRefetch: () => Promise<QueryObserverResult<TNetwork, unknown>>;
  resources: NetworkCuratedResourcesDto;
  loading: boolean;
  error: any;
};

const usePageData = (): PageData => {
  const router = useRouter();
  const { nid } = router.query;
  const { endpoints, endpointsLoading, endpointsError, endpointsRefetch } = useEndpoints(nid as string);
  const { network, networkLoading, networkError, networkRefetch } = useNetworkData(nid as string);
  const { resources, resourcesLoading, resourcesError } = useNetworkCuratedResources(nid as string);
  return {
    endpoints,
    endpointsRefetch,
    network,
    networkRefetch,
    resources,
    loading: endpointsLoading || networkLoading || resourcesLoading,
    error: endpointsError || networkError || resourcesError
  };
};

export const EndpointsUI = () => {
  const router = useRouter();
  const { nid } = router.query;
  const { endpoints, network, resources, loading } = usePageData();
  const { data: userNetworks, isLoading: userNetworksIsLoading } = useGetUserNetworks();
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointWithUrl>();
  const userNetworkData = userNetworks?.find((x) => (x.billingCategory as NetworkPriceBillingCategory)?.code === NetworkPriceBillingCodes.Infrastructure && x.networkId === nid);
  const isFreeTier = (userNetworkData?.billingTier as BillingTier)?.code === BillingTierCode.Free;
  useEffect(() => {
    if (!endpoints?.length || !network) {
      setSelectedEndpoint(null);
      return;
    }

    if (!selectedEndpoint || selectedEndpoint.networkId !== network._id) {
      setSelectedEndpoint(endpoints[0]);
      return;
    }

    if (selectedEndpoint && !endpoints.find((endpoint) => endpoint.endpointId === selectedEndpoint.endpointId)) {
      setSelectedEndpoint(endpoints[0]);
      return;
    }

    if (selectedEndpoint) {
      setSelectedEndpoint(endpoints.find((endpoint) => endpoint.endpointId === selectedEndpoint.endpointId));
      return;
    }
  }, [endpoints, network]);

  const Status = () => {
    switch (userNetworkData?.status) {
      case UserNetworkStatus.TemporarilyPaused:
        return (
          <Alert  severity="error" sx={{ margin: "10px" }}>
            Service limits reached. Temporarily paused
          </Alert>
        );
      default:
        return <></>;
    }
  };

  if (loading || userNetworksIsLoading) return <Loading when={true}>oooooo look at me loading!</Loading>;

  return (
    <Network id={`${network._id}-network-container`}>
      <StyledEndpointsUI>
        <Header network={network} resources={resources} userNetworkData={userNetworkData} />
        <UsageSummary />
        <Status />
        <EndpointSelect userNetworkData={userNetworkData} endpoints={endpoints} selectedEndpoint={selectedEndpoint} setSelectedEndpoint={setSelectedEndpoint} />
        {selectedEndpoint && <Endpoint key={selectedEndpoint.endpointId} userNetworkData={userNetworkData} endpoint={selectedEndpoint} />}
      </StyledEndpointsUI>
    </Network>
  );
};
