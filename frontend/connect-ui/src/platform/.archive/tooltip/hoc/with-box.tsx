import { observer } from "mobx-react-lite";
import React, { useLayoutEffect, useState } from "react";
import { isEqual } from "../services/services";
import { PropsAreEqual } from "../services/services";

/** withBox is a HOC. Created to support the tooltip component.
 * - This is the third component of the chain.
 * - withHover(withWindowSize(withBox(withPositioning(withContent(withPortal(WithTooltip))))));
 * - It reacts to isHovering, isFocused flags.
 * - On flag change, its checking if the target moved or resized, since last measured.
 * - If there were changes it calculates a new box and sets the state and passes it on as a prop to the followers.
 * - If there were no changes, it flips the isReady flag, means nothing changed.
 * - Tt establishes the box and isFocused states.
 * - It relies on isHovering, is Focused and on having the target provided.
 */
export const withBox = <P extends { target; isHovering; setIsReady }>(WC, propsAreEqual?: PropsAreEqual<P> | false, componentName = WC.displayName ?? WC.name ?? WC?.type?.displayName) => {
  const WithBox = (props: P) => {
    const [box, setBox] = useState({});
    const [isFocused, setIsFocused] = useState(false);
    const { target, isHovering, setIsReady, ...rest } = props;

    useLayoutEffect(() => {
      if (!target) return;

      const { left, top, width, height } = target.getBoundingClientRect();
      const newBox = { left, top, width, height };

      if (target && !isEqual(newBox, box)) {
        setBox(newBox);
      } else {
        setIsReady(true);
      }
      return () => {};
    }, [isHovering, target, box, isFocused, setIsReady]);

    return (
      <React.StrictMode>
        <WC box={box} setIsFocused={setIsFocused} isFocused={isFocused} {...props} />
      </React.StrictMode>
    );
  };
  WithBox.displayName = `withBox(${componentName})`;

  return observer(WithBox);
};
