import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";

import { StyledNetworkSync, Title, Copy, StepButton, LoadingBar, Nub } from "./network-sync.styles";

import { ExternalLightningSetup } from "@blockspaces/shared/models/lightning/Setup";
import { useUIStore } from "@ui";
import { useCheckMacaroonPermissions, useAddExternalNode } from "@lightning/mutations";
import { useExternalHeyHowAreYa } from "@lightning/queries";
import { ExternalLightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";

type Props = {
  next: () => void;
  setup: ExternalLightningSetup;
};

export const ExternalConnect = observer(({ next, setup }: Props) => {
  const barCount = 20;
  const barHeight = 2;
  const router = useRouter();
  const UI = useUIStore();
  const [loaded, setLoaded] = useState(false);
  const [setupError, setSetupError] = useState(false);
  const [activeBar, setActiveBar] = useState(0);
  const bars = useMemo(() => Array.from({ length: barCount }, (_, i) => <Nub selected={i === activeBar} />), [activeBar]);

  const { mutateAsync: checkMacaroonPermissions } = useCheckMacaroonPermissions()
  const { mutateAsync: addExternalNode } = useAddExternalNode()
  const { refetch: heyhowareya } = useExternalHeyHowAreYa()

  const [message, setMessage] = useState("");

  const setupErrorToast = (message: string) => {
    return UI.showToast({
      alertType: "error",
      message: message,
      position: {
        horizontal: "right",
        vertical: "top"
      }
    })
  }

  const addExternalNodeCustomer = async () => {
    setMessage("Checking macaroon permissions...");
    const macaroonPermissions = await checkMacaroonPermissions({ macaroon: setup.macaroon, endpoint: setup.url, certificate: setup.certificate });
    if (!macaroonPermissions?.data?.valid) {
      setSetupError(true);
      setupErrorToast("Macaroon permissions are invalid. Please try again.")
      return router.push("/multi-web-app/lightning/setup?step=external-node-info&external=true");
    }
    setMessage("Added macaroon! Adding your node to BlockSpaces...");
    const addExternalNodeResult = await addExternalNode({ macaroon: setup.macaroon, endpoint: setup.url, certificate: setup.certificate });
    if (addExternalNodeResult?.status === "failed") {
      setSetupError(true);
      setupErrorToast("Failed to add your node to BlockSpaces. Please try again.")
    }

    const imfeelin = await heyhowareya();

    if (imfeelin.data.data === ExternalLightningOnboardingStep.ImDoingGood) {
      setMessage("Added your node to BlockSpaces!");
      setLoaded(true);
    } else {
      setSetupError(true);
    }
  }

  useEffect(() => {
    if (loaded) return
    addExternalNodeCustomer();
  }, [loaded])

  useEffect(() => {
    if (loaded) return;
    const loadingAnimation = setTimeout(() => {
      let nextBar = activeBar + 1;
      if (nextBar > barCount - 1) nextBar = 0;
      setActiveBar(nextBar);
    }, 80);
    return () => clearTimeout(loadingAnimation);
  }, [activeBar]);

  return (
    <StyledNetworkSync>
      <Title>Syncing to Network</Title>
      <Copy>
        Almost done - we’re connecting to your Node <br />
        {message}
      </Copy>
      {loaded ?
        setupError ?
          <Title>Failed to setup Bitcoin Invoicing & Payments. Please wait and try again.</Title> :
          <Title>Finished setting up Bitcoin Invoicing & Payments!</Title> : <LoadingBar height={barHeight}>{bars.map((nub) => nub)}</LoadingBar>}
      <StepButton id="btnLncSyncing" margin={"3rem auto 3.25rem"} width={"16rem"} disabled={!loaded} onClick={() => {
        next()
      }}>
        Finish
      </StepButton>
    </StyledNetworkSync>
  );
});
