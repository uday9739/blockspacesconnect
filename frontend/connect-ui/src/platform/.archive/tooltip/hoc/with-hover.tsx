import { observer } from "mobx-react-lite";
import React, { useLayoutEffect, useState } from "react";
import { PropsAreEqual } from "../services/services";

/** withHover is a HOC. Created to support the tooltip component.
 * - This is the first component of the chain.
 * - withHover(withWindowSize(withBox(withPositioning(withContent(withPortal(WithTooltip))))));
 * - The props it passes on will be available to all components of the chain.
 * - it creates the states for isReady and isHovering and the state fo the target.
 * - it listens for mouseover and mouseout events on the targets, and sets the isHovering flag.
 * - it relies on nothing.
 */
export const withHover = <P extends {}>(
  WC,
  propsAreEqual?: PropsAreEqual<P> | false,
  componentName = WC.displayName ?? WC.name ?? WC?.type?.displayName
) => {
  const WithHover = (props: P) => {
    const [isReady, setIsReady] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [target, setTarget] = useState<HTMLDivElement>();

    useLayoutEffect(() => {
      const initDebounce = (event) => {
        if (event.type === "mouseover" && isHovering === true) {
          return;
        } else if (event.type === "mouseout" && isHovering === true) {
          setIsHovering(false);
          return;
        } else if (event.type === "mouseover" && isHovering === false) {
          setIsHovering(true);
          return;
        }
      };

      if (target) {
        target.addEventListener("mouseover", initDebounce);
        target.addEventListener("mouseout", initDebounce);
      }
      return () => {
        target?.removeEventListener("mouseover", initDebounce);
        target?.removeEventListener("mouseout", initDebounce);
      };
    }, [target, isHovering]);

    return <WC isReady={isReady} setIsHovering={setIsHovering} setIsReady={setIsReady} isHovering={isHovering} target={target} setTarget={setTarget} {...props} />;
  };

  WithHover.displayName = `withHover(${componentName})`;

  return observer(WithHover);
};
