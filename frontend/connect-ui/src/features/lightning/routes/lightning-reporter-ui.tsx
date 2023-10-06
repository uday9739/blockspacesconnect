import React, { Suspense, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { NetworkHeader, NavOption } from '@platform/dashboards';
import { ExternalLightningOnboardingStep, LightningNodeReference, LightningOnboardingStep, StepToNum } from "@blockspaces/shared/models/lightning/Node";
import { ErrorBoundaryPlus, GenericComponentErrorFallback } from "@errors";
import { BalancePlugin, NodeStatus, TransactionChart, Connections, PaymentsTable } from "@lightning/components";
import { Network } from '@platform/routes/networks/network/network';
import { Loading } from "@platform/common";
import { useNodeDoc, useExternalHeyHowAreYa } from "@lightning/queries";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import config from "@config";
import { Settings } from "@lightning/components";
import Alert from "@mui/material/Alert";
import { useGetUserNetworks } from "@src/platform/hooks/user/queries";
import { Network as NetworkType, NetworkId, UserNetworkStatus } from "@blockspaces/shared/models/networks";
import { useNetworkCatalog } from "@platform/hooks/network-catalog/queries";

export type UIProps = {
  networkId?: string;
}

type PageData = {
  nodeHealth: ApiResult<ExternalLightningOnboardingStep>,
  nodeDoc: ApiResult<LightningNodeReference>,
  network: NetworkType,
  loading: boolean,
  error: any,
  isPendingCancelation: boolean,
  userNetworksIsLoading: boolean
}

const usePageData = (): PageData => {
  const { data: userNetworks, isLoading: userNetworksIsLoading } = useGetUserNetworks()
  const { nodeDoc } = useNodeDoc()
  const { getNetwork, catalogLoading } = useNetworkCatalog()
  const network = getNetwork(NetworkId.LIGHTNING_REPORTER)
  const { data: externalNodeHealth, isLoading: externalNodeHealthLoading, error: externalNodeHealthError } = useExternalHeyHowAreYa()
  const isPendingCancelation = userNetworks?.find(x => x.networkId === NetworkId.LIGHTNING_REPORTER)?.status === UserNetworkStatus.PendingCancelation;
  return {
    nodeHealth: externalNodeHealth,
    nodeDoc,
    network,
    loading: externalNodeHealthLoading || catalogLoading,
    error: externalNodeHealthError,
    isPendingCancelation,
    userNetworksIsLoading
  }
}

export const LightningReporterUI = (props: UIProps) => {
  const router = useRouter();
  const { nodeHealth, nodeDoc, network, loading, isPendingCancelation, userNetworksIsLoading } = usePageData()

  useEffect(() => {
    if (!nodeHealth || !doneWithOnboarding(nodeHealth.data) || userNetworksIsLoading || !nodeDoc || !network)
      return;

  }, [nodeHealth, userNetworksIsLoading, nodeDoc])

  const doneWithOnboarding = (nodeHealth: string) => {
    return StepToNum[nodeHealth] >= StepToNum[LightningOnboardingStep.NotSyncedToChain]
  }

  const navOptions: NavOption[] = [
    {
      label: "TRANSACTIONS",
      onClick: () => router.pathname !== "/multi-web-app/[nid]" && router.replace("/multi-web-app/lightning-reporter"),
      selected: router.pathname === "/multi-web-app/[nid]"
    },
    {
      label: "CONNECTIONS",
      onClick: () => router.pathname !== "/multi-web-app/lightning-reporter/connections" && router.replace("/multi-web-app/lightning-reporter/connections"),
      selected: router.pathname === "/multi-web-app/lightning-reporter/connections"
    },
    {
      label: "SETTINGS",
      onClick: () => router.pathname !== "/multi-web-app/lightning-reporter/settings" && router.replace("/multi-web-app/lightning-reporter/settings"),
      selected: router.pathname === "/multi-web-app/lightning-reporter/settings"
    }
  ];

  const body = useMemo(() => {
    switch (router.pathname) {
      case "/multi-web-app/lightning-reporter/connections":
        return (
          <>
            <Suspense><Connections /></Suspense>
          </>
        );
      case "/multi-web-app/lightning-reporter/settings":
        return <Settings />;
      default:
        return (
          <>
            <Suspense><ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}><TransactionChart chartColors={["#FF3C00", "#FF9300", "#FF3C00"]} /></ErrorBoundaryPlus></Suspense>
            <Suspense><ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}><PaymentsTable /></ErrorBoundaryPlus></Suspense>
          </>
        );
    }
  }, [router.pathname]);

  const Mode = useMemo(() => {
    // If we do not have node health or the router isn't ready, return loading
    if (!nodeHealth || !router.isReady || userNetworksIsLoading) return <Loading when={!loading || !router.isReady} height="100vh" />

    // If they have not finished onboarding take them to the step in onboarding they left with.
    if (nodeHealth.data === ExternalLightningOnboardingStep.NodeNotAssigned) { router.replace({ pathname: '/multi-web-app/lightning/setup', query: { external: true } }); return <></> }

    // If the node health returns that the wallet is locked, prompt them for password.
    // if (nodeHealth.data === LightningOnboardingStep.Locked) { router.replace({ pathname: '/multi-web-app/lightning', query: { modal: 'locked' } }); return <></> }

    // We have all the info to display dashboard!
    return (
      <Network id="Lightning-network-container">
        <NetworkHeader
          slotLL={<BalancePlugin color={network.primaryColor} />}
          slotLR={<NodeStatus color={network.secondaryColor} />}
          slotUL={<></>}
          slotUR={<></>}
          network={{ _id: "lightning-reporter", name: "Lightning Reporter", logo: `${config.HOST_URL}/images/light-lightning-reporter.png`, description: "Report Lightning transactions to your accounting software with your own Lightning node." }}
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
