import React from "react";
import Link from "next/link";
import GettingStarted, { SectionHeader, SectionDescription, Steps, Step, StepImage, StepDescription, SelectNetwork } from "./styles/getting-started.styles";

export default function GETTING_STARTED() {
  return (
    <GettingStarted>
      <SectionHeader>Getting Started</SectionHeader>
      <SectionDescription>You're just three simple steps away from your first blockchain network</SectionDescription>
      <Steps>
        <Step>
          <StepImage />
          <StepDescription>Select a Blockchain Network</StepDescription>
        </Step>
        <Step>
          <StepImage />
          <StepDescription>We’ll guide you through Setup</StepDescription>
        </Step>
        <Step>
          <StepImage />
          <StepDescription>And help you get the most of your network</StepDescription>
        </Step>
      </Steps>
      <Link href="/connect/add-network">
        <SelectNetwork>SELECT NETWORK</SelectNetwork>
      </Link>
    </GettingStarted>
  );
}
