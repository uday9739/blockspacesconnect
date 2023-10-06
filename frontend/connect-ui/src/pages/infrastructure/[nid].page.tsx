// framework
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
// app
import { GetNetworkUiComponent } from "@platform/routes/networks";
import { getString } from "@platform/utils";
import MainLayoutAuthenticated from "@src/platform/components/layouts/main-authenticated-layout";
import { NextPageWithLayout } from "@platform/types/base-page-props";
import { useGetCurrentUser, useGetUserNetworks } from "@src/platform/hooks/user/queries";
import { Loading } from "@src/platform/components/common";
import { NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { UserNetworkStatus } from "@blockspaces/shared/models/networks";

const InfrastructurePage: NextPageWithLayout = () => {
  const router = useRouter();
  const { nid } = router.query;
  const { data: user, isLoading } = useGetCurrentUser();
  const { data: userNetworks, isLoading: userNetworksLoading, refetch: refetchUn } = useGetUserNetworks();

  const Network = useMemo(() => {
    if (!nid || isLoading || userNetworksLoading) return;
    const networkId = getString(nid);
    const hasNetwork = userNetworks.filter(
      (x) => x.networkId === nid && x.status !== UserNetworkStatus.PendingCancelation && (x.billingCategory as any).code === NetworkPriceBillingCodes.Infrastructure
    );
    const NetworkUi = GetNetworkUiComponent(networkId);
    if (NetworkUi && hasNetwork?.length) {
      return <NetworkUi networkId={networkId} />;
    } else {
      router.push("/connect?modal=add-app");
    }
  }, [nid, user, userNetworksLoading]);

  if (!router.isReady || isLoading || userNetworksLoading) return <Loading when={true}></Loading>;

  return <>{Network}</>;
};

export default InfrastructurePage;

InfrastructurePage.getLayout = function getLayout(page) {
  return <MainLayoutAuthenticated id="network-infrastructure-page">{page}</MainLayoutAuthenticated>;
};
