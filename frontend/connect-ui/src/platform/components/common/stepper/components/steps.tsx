import React, { useContext } from 'react';
import { animated, useTransition } from '@react-spring/web'
import { observer } from 'mobx-react-lite'
import { StepperContext } from '../stepper.context';

export const Step = observer(({ id }: { id: number }) =>
{
  const { currentStepId, getContentForId } = useContext(StepperContext)
  const Content = getContentForId(id)

  const transitions = useTransition(currentStepId, {
    from: { transform: `translate3d(-100%,0%,0) scale(0.3)`, opacity: 0 },
    enter: { transform: "translate3d(0%,0,0) scale(1)", opacity: 1 },
    leave: { transform: `translate3d(100%,0%,0) scale(0.1)`, opacity: 0 },
    delay: 0,
    config: { duration: 500 }
  })
  // const props = useSpring({ to: { opacity: 1, width: '100%', translateX: 0, translateY: "-50%" }, from: { translateX: -1000, translateY: "0%", opacity: 0, width: '0%', height: '0%' }, config: { delay: 200, duration: 500, bounce: 5, velocity: 15 } })

  const stylesStageContent = {
    fontFamily: 'monospace',
    display: 'flex',
    borderRadius: '1rem',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: "absolute" as 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: "2rem",
    color: '#333',
    background: 'transparent',
    backdropFilter: 'blur(10px)',
    border: '.005rem solid #404040',
    backgroundClip: 'border-box',
  }

  return currentStepId === id ? (transitions((_styles, currentStepId) => <animated.div className={ `stage-${ currentStepId }` } style={ { transform: _styles.transform, ...stylesStageContent } }>{ Content }</animated.div>)) : null

})

const styles = {
  stagesContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'transparent',
    borderRadius: '8px'
  },
  stages: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as 'relative',
    borderRadius: '8px',
    height: '100%',
    width: '100%',
    background: 'transparent',
  }
}

export const Steps = (props?: any) =>
{

  return (
    <div className='stages-container' style={ styles.stagesContainer }>
      <div className='stages' style={ styles.stages }>
        { props.children }
      </div>
    </div>
  )
}
observer(Steps)

export default Steps
