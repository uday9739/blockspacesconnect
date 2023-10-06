import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";

import { StyledSetup, Header, Title, Logo, Back } from './lightning-setup.styles';

import { Intro, Journey, MarqueeModal, NetworkSync, RecoveryConfirm, RecoveryCopy, SetPassword, ExternalConnect, ExternalNodeInfo, ExternalIntro } from "@lightning/routes/setup"
import { SetupSteps } from "@lightning/types";
import { removeMacaroonFromStorage } from "@lightning/utils";
import { Loading } from "@platform/common";
import { useUIStore } from "@ui";
import { Cancel, NetworkIcon } from "@icons"

import { LightningSetup as LightningSetupObj, ExternalLightningSetup } from '@blockspaces/shared/models/lightning/Setup';
import { LightningNodeReference, LightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";
import { useHeyhowareya, useNodeDoc } from "@lightning/queries";
import ApiResult from "@blockspaces/shared/models/ApiResult";

type PageData = {
  nodeHealth: ApiResult<LightningOnboardingStep>,
  nodeDoc: ApiResult<LightningNodeReference>,
  loading: boolean,
  error: any
}

const usePageData = (): PageData => {
  const { nodeHealth, nodeHealthLoading, nodeHealthError } = useHeyhowareya()
  const { nodeDoc, nodeDocLoading, nodeDocError } = useNodeDoc()

  return {
    nodeHealth,
    nodeDoc,
    loading: nodeDocLoading || nodeHealthLoading,
    error: nodeDocError || nodeHealthError
  }
}

export const LightningSetup = observer(() => {
  const router = useRouter();
  const UI = useUIStore();
  const { nodeHealth, nodeDoc, loading } = usePageData()
  // The persisted state throughout the `multi-web-app/lightning/setup` process.
  const [setup, setSetup] = useState<LightningSetupObj>({ url: "", nodeId: "", seed: [], password: "" });
  const [externalNodeSetup, setExternalNodeSetup] = useState<ExternalLightningSetup>({ url: "", macaroon: "", certificate: "" });

  useEffect(() => {
    if (!nodeDoc) return
    setSetup({
      ...setup,
      url: nodeDoc.data.apiEndpoint,
      nodeId: nodeDoc.data.nodeId
    })
  }, [nodeDoc])

  useEffect(() => {
    if (loading || !nodeDoc) return
    switch (nodeHealth.data) {
      case LightningOnboardingStep.NodeNotAssigned:
      case LightningOnboardingStep.NodeNotInitialized:
        removeMacaroonFromStorage(nodeDoc?.data?.nodeId); // Clears any existing admin mac
        break;
      case LightningOnboardingStep.NoAdminMacInVault:
      case LightningOnboardingStep.MismatchedAdminMac:
      case LightningOnboardingStep.NoAdminMacInNodeDoc:
        removeMacaroonFromStorage(nodeDoc?.data?.nodeId); // Clears any existing admin mac
        UI.showToast({
          message: 'Your lightning node needs to be reset. Please contact BlockSpaces.',
          alertType: "error",
          position: {
            horizontal: "right",
            vertical: "top"
          },
          autoHideDuration: 5000
        })
        router.push("/connect");
        break;
      case LightningOnboardingStep.NoReadOnlyMac:
        // router.replace({ pathname: "/multi-web-app/lightning/setup", query: { step: SetupSteps.Sync } })
        break;
      case LightningOnboardingStep.NoAdminMacInCookie:
        break;
      case LightningOnboardingStep.NodeApiIsDown:
        UI.showToast({
          message: 'Node seems to be offline, contact Blockspaces.',
          alertType: "error",
          position: {
            horizontal: "right",
            vertical: "top"
          },
          autoHideDuration: 5000
        })
        router.push({ pathname: "/connect" });
        break;
      default:
        router.replace("/multi-web-app/lightning");
        break;
    }
  }, [nodeHealth, nodeDoc])

  const SetupHeader = (
    <Header>
      <Logo>
        <NetworkIcon networkId="lightning" />
      </Logo>
      <Link href="/connect">
        <Back>
          <Cancel />
        </Back>
      </Link>
      <Title>Lightning Network Setup</Title>
    </Header>
  )

  const { step, external } = router.query;

  if (!nodeHealth) {
    return (
      <StyledSetup>
        {SetupHeader}
        <MarqueeModal key={SetupSteps.CopyRecoveryCode} text={`YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . `}>
          <Loading when={!nodeHealth} height="25rem" />
        </MarqueeModal>
        <Journey />
      </StyledSetup>
    )
  }

  if (external === "true") {
    return externalSetup()
  } else {
    return bipSetup()
  }

  function bipSetup() {
    switch (step) {
      case SetupSteps.CopyRecoveryCode:
        return (
          <StyledSetup>
            {SetupHeader}
            <MarqueeModal key={SetupSteps.CopyRecoveryCode} text={`YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . `}>
              <RecoveryCopy next={() => router.replace({ pathname: router.pathname, query: { step: SetupSteps.ConfirmRecoveryCode } })} setup={setup} setSetup={setSetup} />
            </MarqueeModal>
            <Journey />
          </StyledSetup>
        );

      case SetupSteps.ConfirmRecoveryCode:
        return (
          <StyledSetup>
            {SetupHeader}
            <MarqueeModal key={SetupSteps.ConfirmRecoveryCode} text={`YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . `}>
              <RecoveryConfirm
                back={() => router.replace({ pathname: router.pathname, query: { step: SetupSteps.CopyRecoveryCode } })}
                next={() => router.replace({ pathname: router.pathname, query: { step: SetupSteps.SetPassword } })}
                setup={setup}
                setSetup={setSetup}
              />
            </MarqueeModal>
            <Journey />
          </StyledSetup>
        );

      case SetupSteps.SetPassword:
        return (
          <StyledSetup>
            {SetupHeader}
            <MarqueeModal key={SetupSteps.SetPassword} text={`YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . YOUR KEYS, YOUR BITCOIN . `}>
              <SetPassword next={() => router.replace({ pathname: router.pathname, query: { step: SetupSteps.Sync } })} setup={setup} setSetup={setSetup} />
            </MarqueeModal>
            <Journey />
          </StyledSetup>
        );

      case SetupSteps.Sync:
        return (
          <StyledSetup>
            {SetupHeader}
            <MarqueeModal key={SetupSteps.Sync} text={`ALMOST THERE . SETTING UP YOUR NODE . ALMOST THERE . SETTING UP YOUR NODE . ALMOST THERE . SETTING UP YOUR NODE . `}>
              <NetworkSync next={() => router.replace({ pathname: "/multi-web-app/lightning" })} setup={setup} setSetup={setSetup} />
            </MarqueeModal>
            <Journey />
          </StyledSetup>
        );
      case SetupSteps.MissingPassword:
        return (
          <StyledSetup>
            {SetupHeader}
            <MarqueeModal key={SetupSteps.Sync} text={`ALMOST THERE . SETTING UP YOUR NODE . ALMOST THERE . SETTING UP YOUR NODE . ALMOST THERE . SETTING UP YOUR NODE . `}>
              <NetworkSync next={() => router.replace({ pathname: "/multi-web-app/lightning" })} setup={setup} setSetup={setSetup} />
            </MarqueeModal>
            <Journey />
          </StyledSetup>
        )

      default:
        return (
          <StyledSetup>
            {SetupHeader}
            <MarqueeModal
              key={SetupSteps.Intro}
              text={`LOW FEES . INSTANT PAYMENTS . POWERFUL INTEGRATIONS .
                LOW FEES . INSTANT PAYMENTS . POWERFUL INTEGRATIONS . `}
            >
              <Intro next={() => router.replace({ pathname: router.pathname, query: { step: SetupSteps.CopyRecoveryCode } })} setup={setup} setSetup={setSetup} />
            </MarqueeModal>
          </StyledSetup>
        );
    }
  }

  function externalSetup() {
    switch (step) {
      case SetupSteps.InputNodeInfo:
        return (
          <StyledSetup>
            {SetupHeader}
            <MarqueeModal key={SetupSteps.Sync} text={`ALMOST THERE . SETTING UP YOUR NODE . ALMOST THERE . SETTING UP YOUR NODE . ALMOST THERE . SETTING UP YOUR NODE . `}>
              <ExternalNodeInfo next={() => router.replace({ pathname: router.pathname, query: { step: SetupSteps.ExternalConnect, external: true } })} setup={externalNodeSetup} setSetup={setExternalNodeSetup} />
            </MarqueeModal>
            <Journey />
          </StyledSetup>
        );
      case SetupSteps.ExternalConnect:
        return (
          <StyledSetup>
            {SetupHeader}
            <MarqueeModal key={SetupSteps.Sync} text={`ALMOST THERE . SETTING UP YOUR NODE . ALMOST THERE . SETTING UP YOUR NODE . ALMOST THERE . SETTING UP YOUR NODE . `}>
              <ExternalConnect next={() => router.replace({ pathname: "/multi-web-app/lightning-reporter" })} setup={externalNodeSetup} />
            </MarqueeModal>
            <Journey />
          </StyledSetup>
        )

      default:
        return (
          <StyledSetup>
            {SetupHeader}
            <MarqueeModal
              key={SetupSteps.Intro}
              text={`LOW FEES . INSTANT PAYMENTS . POWERFUL INTEGRATIONS .
                LOW FEES . INSTANT PAYMENTS . POWERFUL INTEGRATIONS . `}
            >
              <ExternalIntro next={() => router.replace({ pathname: router.pathname, query: { step: SetupSteps.InputNodeInfo, external: true } })} />
            </MarqueeModal>
          </StyledSetup>
        );
    }
  }
});
