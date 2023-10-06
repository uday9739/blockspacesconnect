import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { StyledTooltip } from './tooltip.styles'

type Props = {
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  forceShow?: boolean;
  disabled?:boolean;
};

export const Tooltip = ({ children, content, placement = 'top', forceShow = false, disabled = false }: Props) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [position, setPosition] = useState([0, 0]);
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);

  const showTooltip = () => setTooltipVisible(true);
  const hideTooltip = () => setTooltipVisible(false);

  const handleMouseEnter = () => {
    if (forceShow) return
    showTooltip();
    document.addEventListener('click', hideTooltip);
  };

  const handleMouseLeave = () => {
    if (forceShow) return
    hideTooltip();
    document.removeEventListener('click', hideTooltip);
  };

  useEffect(() => {
    if ( !tooltipVisible ) return

    const [xPos, yPos] = getTooltipPosition(targetRef.current, placement);
    setPosition([xPos, yPos])

    const interval = setInterval(() => {
      const [xPos, yPos] = getTooltipPosition(targetRef.current, placement);
      setPosition([xPos, yPos])
    },30)
    return () => clearInterval(interval)
  }, [tooltipVisible])

  const getTooltipPosition = (target, placement) => {
    switch (placement) {
      case 'top':
        return [
          target.getBoundingClientRect().left + target.offsetWidth / 2,
          target.getBoundingClientRect().top
        ]

      case 'right':
        return [
          target.getBoundingClientRect().left + target.offsetWidth,
          target.getBoundingClientRect().top + target.offsetHeight / 2
        ]

      case 'left':
        return [
          target.getBoundingClientRect().left,
          target.getBoundingClientRect().top + target.offsetHeight / 2
        ]

      case 'bottom':
        return [
          target.getBoundingClientRect().left + target.offsetWidth / 2,
          target.getBoundingClientRect().bottom
        ]
    }
  }

  useEffect(() => {
    if ( forceShow ) showTooltip();
  }, [forceShow])

  const renderTooltip = () => {
    if (!tooltipVisible || disabled) return <></>
    const [xPos, yPos] = position;
    if (!xPos || !yPos) return <></>
    return createPortal(
      <StyledTooltip
        placement={placement}
        className="tooltip"
        ref={tooltipRef}
        style={{
          position: 'absolute',
          top: yPos,
          left: xPos,
        }}
      >
        {content}
      </StyledTooltip>,
      document.body
    );
  }
  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {renderTooltip()}
    </>
  );
};