import React from 'react';
import { useSpring } from '@react-spring/web';
// UPDATE this path to your copy of the hook!
// Source here: https://joshwcomeau.com/snippets/react-hooks/use-prefers-reduced-motion
import {usePrefersReducedMotion} from './use-prefers-reduced-motion.hook';
export function useTween({
  x = 0,
  y = 0,
  rotation = 0,
  scale = 1,
  timing = 150,
  springConfig = {
    tension: 300,
    friction: 10,
  },
})
{
  const prefersReducedMotion = usePrefersReducedMotion();
  const [ isTweened, setIsTweened ] = React.useState(false);
  const style = useSpring({
    transform: isTweened
      ? `translate(${ x }px, ${ y }px)
         rotate(${ rotation }deg)
         scale(${ scale })`
      : `translate(0px, 0px)
         rotate(0deg)
         scale(1)`,
    config: springConfig,
  });
  React.useEffect(() =>
  {
    if (!isTweened)
    {
      return;
    }
    const timeoutId = window.setTimeout(() =>
    {
      setIsTweened(false);
    }, timing);
    return () =>
    {
      window.clearTimeout(timeoutId);
    };
  }, [ isTweened ]);
  const trigger = React.useCallback(() =>
  {
    setIsTweened(true);
  }, []);
  let appliedStyle = prefersReducedMotion ? {} : style;
  return [ appliedStyle, trigger ];
}
export default useTween;