import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";

import { Copy, Step, StepButton, StepCount, StepIcon, StepLabel, Steps, StyledIntro, Title } from "./intro.styles";

import { LightningSetup } from "@blockspaces/shared/models/lightning/Setup";
import { useUIStore } from "@ui";
import { Key, Sync, Wallet } from "@icons";
import { useClaimNode } from "@lightning/queries";

type Props = {
  next: () => void;
  setup: LightningSetup;
  setSetup: any;
};

// User networks
export const Intro = observer(({ next, setup, setSetup }: Props) => {
  const router = useRouter();
  const UI = useUIStore();
  const { claimedNode, claimNodeLoading, claimNodeError } = useClaimNode();
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

  if (claimedNode && nodeIsReady === false) {
    const claimNode = async () => {
      setSetup({ ...setup, url: claimedNode.apiEndpoint, nodeId: claimedNode.nodeId });
      setNodeIsReady(true);
    };
    claimNode();
  }

  return (
    <StyledIntro id="Lightning-Network-Setup-intro">
      <Title>The Future of Finance is Here</Title>
      <Copy>
        <span style={{ color: "#F00" }}>ATTENTION:</span> Before you begin, it’s very important you proceed next few steps with your <u>full attention</u>! Each step is critical to ensuring the security of your account and protecting your wallet.
      </Copy>
      <Steps>
        <Step>
          <StepCount>1</StepCount>
          <StepIcon>
            <Wallet />
          </StepIcon>
          <StepLabel>
            Secure <br />
            Wallet
          </StepLabel>
        </Step>
        <Step>
          <StepCount>2</StepCount>
          <StepIcon>
            <Key />
          </StepIcon>
          <StepLabel>
            Set <br />
            Password
          </StepLabel>
        </Step>
        <Step>
          <StepCount>3</StepCount>
          <StepIcon>
            <Sync />
          </StepIcon>
          <StepLabel>
            Sync to <br />
            Network
          </StepLabel>
        </Step>
      </Steps>
      <StepButton id="btnGetStarted" disabled={!nodeIsReady} margin={"0rem auto 3.25rem"} width={"16rem"} onClick={() => next()}>
        GET STARTED
      </StepButton>
    </StyledIntro>
  );
});
