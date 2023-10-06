import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";

import { Copy, Step, StepButton, StepCount, StepIcon, StepLabel, Steps, StyledIntro, Title } from "./intro.styles";

import { LightningSetup } from "@blockspaces/shared/models/lightning/Setup";
import { useUIStore } from "@ui";
import { Key, Sync } from "@icons";
import { useClaimNode, useGenerateSeed } from "@lightning/queries";

type Props = {
  next: () => void;
  setup: LightningSetup;
  setSetup: any;
};

export const Intro = observer(({ next, setup, setSetup }: Props) => {
  const router = useRouter();
  const UI = useUIStore();
  const { claimedNode, claimNodeLoading, claimNodeError } = useClaimNode();
  const {seed} = useGenerateSeed(claimedNode?.apiEndpoint)
  const [nodeIsReady, setNodeIsReady] = useState(false);

  if (claimNodeError) {
    UI.showToast({
      message: "We currently do not have any Lightning nodes available. Please contact a BlockSpaces representative to request a node.",
      alertType: "error",
      position: {
        horizontal: "right",
        vertical: "top"
      },
      autoHideDuration: 15000
    });
    router.push("/connect");
  }

  if (claimedNode && seed && nodeIsReady === false) {
    const claimNode = async () => {
      setSetup({ ...setup, seed: seed["cipher_seed_mnemonic"] , url: claimedNode.apiEndpoint, nodeId: claimedNode.nodeId });
      setNodeIsReady(true);
    };
    claimNode();
  }

  return (
    <StyledIntro id="Lightning-Connect-Setup-intro">
      <Title>Start Building on the Lightning Network</Title>
      <Copy>
        You are just a few steps away from building an application <br />
        on the Lightning Network
      </Copy>
      <Steps>
        <Step>
          <StepCount>1</StepCount>
          <StepIcon>
            <Key />
          </StepIcon>
          <StepLabel>
            Set <br />
            Password
          </StepLabel>
        </Step>
        <Step>
          <StepCount>2</StepCount>
          <StepIcon>
            <Sync />
          </StepIcon>
          <StepLabel>
            Start <br />
            Building
          </StepLabel>
        </Step>
      </Steps>
      <StepButton id="btnGetStarted" disabled={!nodeIsReady} margin={"0rem auto 3.25rem"} width={"16rem"} onClick={() => next()}>
        GET STARTED
      </StepButton>
    </StyledIntro>
  );
});
