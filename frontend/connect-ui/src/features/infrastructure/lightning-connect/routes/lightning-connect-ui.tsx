import { Header } from "@endpoints/components"
import { Network } from "@platform/routes/networks/network/network";
import { useHeyhowareya } from "@src/features/lightning/hooks/queries";
import { Loading } from "@src/platform/components/common";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { LightningOnboardingStep, StepToNum } from "@blockspaces/shared/models/lightning/Node";
import { useNetworkCuratedResources, useNetworkData } from "@endpoints/hooks/queries";
import { Authentication } from "../components/authentication";
import { NodeActivity } from "../components/node-activity";
import { NodeInfo } from "../components/node-info";
import { Information, LightningConnectStyles } from "./lightning-connect-ui.styles";
import { UnlockMac } from "../components/unlock";
import { Status } from "../components/header/status";

const usePageData = () => {
  const {nodeHealth, nodeHealthLoading, nodeHealthError} = useHeyhowareya()
  const { resources, resourcesLoading, resourcesError } = useNetworkCuratedResources("lightning-connect")
  const {network, networkLoading, networkError} = useNetworkData("lightning-connect")

  return {
    nodeHealth,
    network,
    resources,
    loading: nodeHealthLoading || resourcesLoading || networkLoading,
    error: nodeHealthError || resourcesError || networkError
  }
}

export const LightningConnectUI = () => {
  const router = useRouter()
  const {nodeHealth, resources, network, loading} = usePageData()

  const doneWithOnboarding = (nodeHealth: string) => {
    return StepToNum[nodeHealth] >= StepToNum[LightningOnboardingStep.NotSyncedToChain]
  }

  const body = (
    <Network id="lightning-connect">
      <LightningConnectStyles>
      <Header network={network} resources={resources} leftView={<Status />}/>
      <UnlockMac />
      <Information>
        <NodeInfo />
        <NodeActivity />
      </Information>
      <Authentication />
      </LightningConnectStyles>
    </Network>
  );

  const mode = useMemo(() => {
    if (!nodeHealth || !router.isReady || loading) return <Loading when={loading || !nodeHealth} />

    if (!doneWithOnboarding(nodeHealth.data)) { router.replace({pathname: "/infrastructure/lightning-connect/setup"}); return <></> };

    // If the node health returns that the wallet is locked, prompt them for password.
    if (nodeHealth.data === LightningOnboardingStep.Locked) { router.replace({ pathname: '/infrastructure/lightning-connect', query: { modal: 'locked' } }); return <></> }

    return body
  }, [nodeHealth, router.isReady])

  return (
    <>
      {mode}
    </>
  )

};