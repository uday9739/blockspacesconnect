import { Cancel } from "@icons";
import { indexOf } from "lodash";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import Marquee from "react-fast-marquee";
import { StyledFlowStepper, FlowStep, FlowStepIcon, CloseModal, StepperMarquee, MarqueeText } from "./flow-stepper.styles";


export type Step = {
  label:string,
  icon:JSX.Element,
  Component:JSX.Element,
  onClick:() => void,
  marqueeText?:string,
}

type Props = {
  steps:Step[]
  activeStep:Step
}

export const FlowStepper = observer(({ steps, activeStep }:Props) => {
  const router = useRouter();
  const Steps = steps.map(( step, i ) => (
    <FlowStep
      key={`flowstepper-${step.label}`}
      selected={ step === activeStep }
      onClick={() => indexOf(steps, activeStep) > i && step.onClick()}
      complete={ indexOf(steps, activeStep) > i }>
      <FlowStepIcon>
        {step.icon}
      </FlowStepIcon>
      { step.label }
    </FlowStep>
  ))
  return (
    <>
      <StepperMarquee>
        <Marquee gradient={false} speed={15}>
          <MarqueeText>
            { activeStep?.marqueeText}
          </MarqueeText>
        </Marquee>
      </StepperMarquee>
      <StyledFlowStepper>
        { Steps }
        <CloseModal id="btnCancel" onClick={() => router.push('/connect')}>
          <Cancel />
        </CloseModal>
      </StyledFlowStepper>
    </>
  )
})