import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";

import { StyledRecoveryCopy, Title, Copy, StepButton, Phrase, Code } from "./recovery-copy.styles";

import { LightningSetup } from "@blockspaces/shared/models/lightning/Setup";
import { Loading } from "@platform/common";
import { useGenerateSeed } from "@lightning/queries";

type Props = {
  next: () => void;
  setup: LightningSetup;
  setSetup: any;
};

export const RecoveryCopy = observer(({ next, setup, setSetup }: Props) => {
  const { seed, genSeedLoading, genSeedError, generateSeed } = useGenerateSeed(setup.url);
  useEffect(() => {
    if (genSeedLoading) return;
    if (genSeedError) {
      console.log('Error generating seed', genSeedError);
    }

  }, [genSeedError, genSeedLoading])

  return (
    <StyledRecoveryCopy id="generate-seed">
      <Title>Secure Your Wallet</Title>
      {genSeedError === null ? 
        <>
          <Copy>
            We’ve already created a wallet for you to use <br />
            Using a pen and paper, copy the recovery code below
          </Copy>
          <Phrase>
            <Loading when={genSeedLoading} height="7.3125rem">
              {seed?.cipher_seed_mnemonic &&
                seed.cipher_seed_mnemonic.map((code, index) => (
                  <Code key={`bsln-${code}`} id={`${index}-${code}`}>
                    <div>{index + 1}.</div> <div>{code}</div>
                  </Code>
                ))}
            </Loading>
          </Phrase> 
          <Copy>
            With this code you'll always be able to recover your Bitcoin <br />
            For security, don’t save this on your phone or in the cloud
          </Copy>
        </>
      : <Copy>Unable to Access your node. Please try again later.</Copy>}
      <StepButton
        id="btnNextStep"
        margin={"2rem auto 3.25rem"}
        width={"16rem"}
        onClick={() => {
          setSetup({ ...setup, seed: seed["cipher_seed_mnemonic"] });
          next();
        }}
        disabled={!seed || genSeedLoading}
      >
        Ready to Confirm
      </StepButton>
    </StyledRecoveryCopy>
  );
});
