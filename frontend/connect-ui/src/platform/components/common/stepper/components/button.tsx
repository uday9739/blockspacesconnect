import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { Tween } from '../animation/tween';
import { StepperContext } from '../stepper.context';

const styles = {
  button: {
    fontFamily: 'monospace',
    fontSize: '1.1rem',
    fontWeight: 'thin',
    background: 'transparent',
    borderRadius: '6px',
    border: '1px solid white',
    color: 'white',
    cursor: 'pointer',
    padding: '5px 15px 5px 15px',
    height: '2.5rem',
  }
}


export const Button = observer(() =>
{
  const { handleClick, finished } = useContext(StepperContext)
  return (<Tween config={ { scale: 1.03, rotation: 3 } }>
    <button
      style={ {
        ...styles.button,
      } }
      onClick={ handleClick }>
      { !finished ? 'Continue' : 'Restart' }
    </button>
  </Tween>);
})

export default Button
