import React from "react";
import { observer } from "mobx-react-lite";

import { Copy, Step, StepButton, StepCount, StepIcon, StepLabel, Steps, StyledIntro, Title } from "./intro.styles";

import { Key, Sync, Wallet } from "@icons";

type Props = {
  next: () => void;
};

// User networks
export const ExternalIntro = observer(({ next }: Props) => {
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
            Node <br />
            Information
          </StepLabel>
        </Step>
        <Step>
          <StepCount>3</StepCount>
          <StepIcon>
            <Sync />
          </StepIcon>
          <StepLabel>
            Connect <br />
            Node
          </StepLabel>
        </Step>
      </Steps>
      <StepButton id="btnGetStarted" margin={"0rem auto 3.25rem"} width={"16rem"} onClick={() => next()}>
        GET STARTED
      </StepButton>
    </StyledIntro>
  );
});
