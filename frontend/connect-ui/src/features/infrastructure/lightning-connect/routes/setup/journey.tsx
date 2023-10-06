import React from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';

import { Icon, Indicator, Step, StyledJourney } from './journey.styles';

import { SetupSteps } from '@lightning/types'
import { Key, Sync } from "@icons";
export const Journey = observer(() => {

  const router = useRouter();
  const { step } = router.query

  if (!step)
    return <></>

  return (
    <StyledJourney>
      <Step
        active={step === SetupSteps.SetPassword}>
        <Icon>
          <Key />
        </Icon>
        <Indicator/>
      </Step>
      <Step active={step === SetupSteps.Sync}>
        <Icon>
          <Sync />
        </Icon>
        <Indicator />
      </Step>
    </StyledJourney>
  )

});
