import React from 'react';
import { animated, ReservedEventProps , EventProp, AnimatedProps} from '@react-spring/web';
import { useTween } from './use-tween';
import { Handler, useGesture, useHover } from '@use-gesture/react';
export const Tween = ({ children, config }: { children?: React.ReactNode, config?: any }) =>
{
  const [ style, trigger ] = useTween(config);

  const bind = useHover(
    trigger as Handler<'hover'>
  ) as unknown as CallableFunction
  return (
    <animated.div { ...bind()} style={ style }>
      { children }
    </animated.div>
  );
};