import React, { useLayoutEffect, useState } from "react";
import Stepper, { IStep, IStepper } from "./stepper";
import { Block } from './components/block/block'
import { Stack } from './components/stack/stack'
import { StepperContext, StepperStore } from "./stepper.context"

export const Steppy = ({ id, header, steps}) =>
{

  const [ store, setStore ] = useState((new StepperStore({ id, header, steps })))

  return (<StepperContext.Provider value={ store }>
    <Stepper id={ id } steps={ steps } >
      <Stack orientation='vertical' style={ { gridGap: '1rem', margin: '3rem', display: 'grid', grid: '4rem 4rem 1fr 4rem / 1fr', gridTemplateAreas: "'header' 'progress' 'stage' 'footer'" } }>
        <Block style={ { alignItems: 'center', justifyContent: 'center', display: 'flex' } }>
          <Stepper.Header />
        </Block>
        <Block style={ { alignItems: 'center', justifyContent: 'center', display: 'flex' } }>
          <Stepper.Progress>
            { steps.map((item: IStep) => (<Stepper.Stage key={ item.id } id={ item.id as number } />)) }
          </Stepper.Progress>
        </Block>
        <Block style={ { flex: '1', display: 'flex' } }>
          <Stepper.Steps>
            { steps.map(item => (<Stepper.Step key={ item.id } id={ item.id as number } />)) }
          </Stepper.Steps>
        </Block>
        <Block style={ { flex: '1', display: 'flex' } }>
          <Stepper.Footer />
        </Block>
      </Stack>
    </Stepper>
  </StepperContext.Provider>)
}