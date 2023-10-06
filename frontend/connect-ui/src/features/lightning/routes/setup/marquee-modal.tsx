import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Marquee from "react-fast-marquee";

import { StyledMarqueeModal, MarqueeText } from './marquee-modal.styles';

import {useWindowSize} from '@platform/hooks';

type Props = {
  text:string;
  margin?:string;
  speed?:number
  padding?:number;
  children:React.ReactNode;
}

export const MarqueeModal = observer(({
  text,
  margin = '0 auto',
  padding = 2.25,
  speed = 30,
  children
}:Props) => {

  const [modalHeight, setBodyHeight] = useState(0)
  const { rem } = useWindowSize();
  const modal = useRef<HTMLDivElement>()

  useEffect(() => {
    setBodyHeight(modal.current.offsetHeight/rem)
  },[rem])

  return (
    <StyledMarqueeModal
      padding={padding}
      margin={margin}
      ref={modal}>
      <Marquee
        style={{ position:'absolute', top:0, left:0, width:'100%' }}
        speed={speed}
        direction={'right'}
        gradient={false}>
        <MarqueeText>
          { text }
        </MarqueeText>
      </Marquee>
      <Marquee
        style={{
          position:'absolute',
          right:0,
          transform: 'rotate(90deg)',
          width:`calc(${modalHeight}rem - ${2*padding}rem)`,
          marginRight:`-${modalHeight/2 - padding}rem`,
          marginTop:`calc(${modalHeight/2 - padding}rem - .5rem)`

        }}
        speed={speed / 60}
        direction={'right'}
        gradient={false}>
        <MarqueeText>
          { text }
        </MarqueeText>
      </Marquee>
      <Marquee
        style={{
          position:'absolute',
          bottom:0,
          left:0,
          transform:'rotate(180deg)'
        }}
        speed={speed}
        direction={'right'}
        gradient={false}>
        <MarqueeText>
          { text }
        </MarqueeText>
      </Marquee>
      <Marquee
        style={{
          position:'absolute',
          left:0,
          transform: 'rotate(-90deg)',
          width:`calc(${modalHeight}rem - ${2*padding}rem)`,
          marginLeft:`-${modalHeight/2 - padding}rem`,
          marginTop:`calc(${modalHeight/2 - padding}rem - .5rem)`
        }}
        speed={speed / 60}
        direction={'right'}
        gradient={false}>
        <MarqueeText>
          { text }
        </MarqueeText>
      </Marquee>
      { children }

    </StyledMarqueeModal>
  )
});
