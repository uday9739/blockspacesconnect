import React, { Suspense, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { NetworkHeader, NavOption } from '@platform/dashboards';
import { ExternalLightningOnboardingStep, LightningNodeReference, LightningOnboardingStep, StepToNum } from "@blockspaces/shared/models/lightning/Node";
import { ErrorBoundaryPlus, GenericComponentErrorFallback } from "@errors";
import { BalancePlugin, NodeStatus, TransactionChart, Pos, Pay, Connections, PaymentsTable } from "@lightning/components";
import { Network } from '@platform/routes/networks/network/network';
import { Loading } from "@platform/common";
import { useHeyhowareya, useNodeDoc, useExternalHeyHowAreYa } from "@lightning/queries";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import config from "@config";
import { Settings } from "@lightning/components";
import Alert from "@mui/material/Alert";
import { useGetUserNetworks } from "@src/platform/hooks/user/queries";
import { Network as NetworkType, NetworkId, UserNetworkStatus } from "@blockspaces/shared/models/networks";
import { AdminMacaroon } from "../components/dashboards/admin-macaroon";
import { useRequestLiquidity } from "../hooks/mutations";
import { useNetworkCatalog } from "@src/platform/hooks/network-catalog/queries";

export type UIProps = {
  networkId?: string;
}

type PageData = {
  nodeHealth: ApiResult<LightningOnboardingStep | ExternalLightningOnboardingStep>,
  nodeDoc: ApiResult<LightningNodeReference>,
  network: NetworkType,
  loading: boolean,
  error: any,
  isPendingCancelation: boolean,
  userNetworksIsLoading: boolean
}

const usePageData = (): PageData => {
  const { data: userNetworks, isLoading: userNetworksIsLoading } = useGetUserNetworks()
  const { getNetwork } = useNetworkCatalog()
  const network = getNetwork(NetworkId.LIGHTNING)
  const { nodeDoc } = useNodeDoc()
  const { nodeHealth, nodeHealthLoading, nodeHealthError } = useHeyhowareya()
  const isPendingCancelation = userNetworks?.find(x => x.networkId === NetworkId.LIGHTNING)?.status === UserNetworkStatus.PendingCancelation;
  return {
    nodeHealth: nodeHealth,
    nodeDoc,
    network,
    loading: nodeHealthLoading,
    error: nodeHealthError,
    isPendingCancelation,
    userNetworksIsLoading
  }
}

export const LightningUI = (props: UIProps) => {
  const router = useRouter();
  const { nodeHealth, nodeDoc, network, loading, isPendingCancelation, userNetworksIsLoading } = usePageData()
  const { mutate: requestLiquidity, requestLiquidityLoading } = useRequestLiquidity();

  useEffect(() => {
    if (!nodeHealth || !doneWithOnboarding(nodeHealth.data) || userNetworksIsLoading || !nodeDoc || requestLiquidityLoading)
      return;
    if (!isPendingCancelation && nodeHealth.data === LightningOnboardingStep.NoInboundChannelOpened) {
      requestLiquidity();
    }
  }, [nodeHealth, userNetworksIsLoading, nodeDoc])

  const doneWithOnboarding = (nodeHealth: string) => {
    return StepToNum[nodeHealth] >= StepToNum[LightningOnboardingStep.NotSyncedToChain]
  }

  const navOptions: NavOption[] = [
    {
      label: "TRANSACTIONS",
      onClick: () => router.pathname !== "/multi-web-app/[nid]" && router.replace("/multi-web-app/lightning"),
      selected: router.pathname === "/multi-web-app/[nid]"
    },
    {
      label: "CONNECTIONS",
      onClick: () => router.pathname !== "/multi-web-app/lightning/connections" && router.replace("/multi-web-app/lightning/connections"),
      selected: router.pathname === "/multi-web-app/lightning/connections"
    },
    {
      label: "SETTINGS",
      onClick: () => router.pathname !== "/multi-web-app/lightning/settings" && router.replace("/multi-web-app/lightning/settings"),
      selected: router.pathname === "/multi-web-app/lightning/settings"
    }
  ];

  const body = useMemo(() => {
    switch (router.pathname) {
      case "/multi-web-app/lightning/connections":
        return (
          <>
            <Suspense><Connections /></Suspense>
          </>
        );
      case "/multi-web-app/lightning/settings":
        return <Settings />;
      default:
        return (
          <>
            <AdminMacaroon />
            <Suspense><ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}><TransactionChart /></ErrorBoundaryPlus></Suspense>
            <Suspense><ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}><PaymentsTable /></ErrorBoundaryPlus></Suspense>
          </>
        );
    }
  }, [router.pathname]);

  const Mode = useMemo(() => {

    // If we do not have node health or the router isn't ready, return loading
    if (!nodeHealth || !router.isReady || userNetworksIsLoading) return <Loading when={!loading || !router.isReady} height="100vh" />

    // If they have not finished onboarding take them to the step in onboarding they left with.
    if (!doneWithOnboarding(nodeHealth.data)) {
      router.replace({ pathname: '/multi-web-app/lightning/setup' });
      return <></>
    }

    // If the node health returns that the wallet is locked, prompt them for password.
    if (nodeHealth.data === LightningOnboardingStep.Locked) { router.replace({ pathname: '/multi-web-app/lightning', query: { modal: 'locked' } }); return <></> }

    // We have all the info to display dashboard!
    return (
      <Network id="Lightning-network-container">
        <NetworkHeader
          slotLL={<BalancePlugin color={network.primaryColor} />}
          slotLR={<NodeStatus color={network.secondaryColor} />}
          slotUL={<Pay />}
          slotUR={<Pos />}
          network={{ _id: "Lightning", name: "Bitcoin Invoicing & Payments", logo: `${config.HOST_URL}/connect/images/light-lightningnetwork.png`, description: "description" }}
          navOptions={navOptions}
        />
        {isPendingCancelation ? <Alert sx={{ marginTop: "15px", width: "74rem", maxWidth: "calc(100% - 5.5rem)" }} severity="error">Cancelation Requested.</Alert> : null}
        {body}
      </Network>
    );
  }, [nodeHealth, router.isReady, userNetworksIsLoading]);

  return (
    <>
      {Mode}
    </>
  )
}
