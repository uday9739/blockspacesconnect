import { useContext } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { Tween } from '../animation/tween'
import { observer } from 'mobx-react-lite'
import { StepperContext } from '../stepper.context'
import { action } from 'mobx'

const styles = {
  progressContainer: {
    display: 'flex',
    margin:'1rem',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: '8px',
    flex: '1'
  },
  line: {
    width: '100%',
    background: '#404040',
    height: 1,
    margin: '1rem'
  },
  circle: {
    fontFamily: "monospace",
    WebkitFontSmoothing: 'auto',
    color: 'white',
    fontSize: '1.4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5rem',
    height: '2.5rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid white',
    backgroundClip: 'border-box',
    borderRadius: '1.25rem',
    position: 'relative' as 'relative',
    cursor: 'pointer'
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  }

}
export const Stage = observer(({ id }: { id: number }) =>
{

  const { currentStepId, goToStepId, isNotLastStep } = useContext(StepperContext)

  const { scale, opacity } = useSpring({
    config: { duration: 1000 },
    loop: { reverse: true },
    from: { scale: currentStepId === id ? 1 : 1, opacity: currentStepId === id ? 1 : 0.6 },
    to: { scale: currentStepId === id ? 1.1 : .8, opacity: currentStepId === id ? 1 : 0.4 }
  });

  const containerStyle = !isNotLastStep(id) && { flex: 0 };
  return (<div style={ { ...styles.container, ...containerStyle } }><Tween config={ { x: 2, rotation: 5, scale: 1.1 } }>
    <animated.div
      className='stage'
      style={ { scale,  opacity, ...styles.circle  } }
      onClick={ action(e =>
      {
        goToStepId(id)
        e.preventDefault()
      })} >
      { RenderIcon({ currentStepId, id }) }
    </animated.div>
  </Tween>{isNotLastStep(id) && <div style={ styles.line } />}</div>)
})

const RenderIcon = ({ currentStepId, id }: { currentStepId: number, id: number }) =>
{
  const { opacity, transform }
    = useSpring({
      opacity: currentStepId === id ? 1 : (currentStepId < id) ? .5 : .8,
      transform: `rotateZ(${ currentStepId === id ? 360 : -360 }deg) skew(${ (currentStepId > id) ? `15deg, -5deg` : `0deg, 0deg` })`
    });



  if (currentStepId === id)
  {

    return <animated.div style={ { transform, opacity } }>{ id }</animated.div>;

  } else if (currentStepId < id)
  {
    return (<animated.div style={ { opacity, transform } }>{ id }</animated.div>);
  }
  return (<animated.div style={ { opacity, transform } }>{ id }</animated.div>);
};


export const Progress = (props: any) =>
{
  return (
    <div style={ styles.progressContainer }>
      { props.children }
    </div>)
}
export default Progress