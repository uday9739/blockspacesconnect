import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useState } from 'react';
import { StyledLoadingBar, Nub } from './loading-bar.styles';

type Props = {
  loaded:boolean,
  color:string,
  width?:number,
  barCount?:number,
  barHeight?:number,
  speed?:number
}

export const LoadingBar = observer(({
  loaded,
  color,
  width = 100,
  barCount = 20,
  barHeight = 2,
  speed = 80,
}:Props) => {

  const [activeBar, setActiveBar] = useState(0);

  const bars = useMemo(() => Array.from({ length: barCount }, (_, i) => (
    <Nub selected={i === activeBar} key={`nub-${i}`} color={color} />
  )),[activeBar])

  useEffect(() => {
    const loadingAnimation = setTimeout(() => {
      let nextBar = activeBar + 1;
      if ( nextBar > barCount - 1 )
        nextBar = 0;
      setActiveBar(nextBar);
    },speed)
    return () => clearTimeout(loadingAnimation)
  }, [activeBar])

  if (loaded) return <></>
  return (
    <StyledLoadingBar height={barHeight} width={width}>
      { bars.map(nub => nub )}
    </StyledLoadingBar>
  )
});
