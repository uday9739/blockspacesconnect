import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react';
import { animated, useTransition, useSpring } from '@react-spring/web';
import { StepperContext } from '../stepper.context';

const calc = (x: number, y: number) => [ -(y - window.innerHeight / 2) / 20, (x - window.innerWidth / 2) / 20, 1 ]
const trans = (x: number, y: number, s: number) => `perspective(600px) rotateX(${ x }deg) rotateY(${ y }deg) scale(${ s })`

export const Header = observer(() =>
{

  const { currentStepId, header, currentStep, finished } = useContext(StepperContext);

  const transitions = useTransition(currentStepId, {
    from: { transform: `translate3d(0%,-200%,0) scale(0.4)`, opacity: 0 },
    enter: { transform: `translate3d(0%,0%,0) scale(1)`, opacity: 1 },
    leave: { transform: `translate3d(0%,-30%,0) scale(0)`, opacity: 0 },
    delay: 0,
    config: { duration: 500 }
  })

  return transitions((_styles, currentStepId) =>(<animated.div style={ {
    position: 'absolute',
    transform: _styles.transform,
    fontFamily: 'monospace',
    fontWeight: '100',
    fontSize: '1.5rem',
    width:'90%',
    WebkitFontSmoothing: 'auto',
    color: 'white',
    height: '3.125rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    backdropFilter: 'blur(10px)',
    border: '.005rem solid #404040',
    backgroundClip: 'border-box'
  } }> { currentStep?.header ?? header }</animated.div>))

})
// xys.to(trans)