import { observer } from "mobx-react-lite";
import React, { useLayoutEffect, useRef, useState } from "react";

import { isEqual } from "../services/services";
import { PropsAreEqual } from "../services/services";

const handleSettingStyles = (setAssets) => (prevStyle) => {
  const { setIsReady, position, target } = setAssets;

  const box = target.getBoundingClientRect();

  let rect;

  switch (position) {
    case "bottom":
      rect = {
        top: box.top + box.height,
        left: box.left,
      };
      break;
    case "top":
      rect = {
        top: box.top - box.height,
        left: box.left,
      };
      break;
    case "left":
      rect = {
        top: box.top,
        left: box.left - box.width,
      };
      break;

    case "right":
      rect = {
        top: box.top,
        left: box.left + box.width,
      };
      break;

    default:
      rect = {
        top: box.top + box.height,
        left: box.left,
      };
      break;
  }
  rect.width = box.width;
  rect.height = box.height;

  if (!isEqual(rect, prevStyle)) {
    return rect;
  }

  return prevStyle;
};
/** withPositioning is a HOC. Created to support the tooltip component.
 * - This is the fourth component of the chain.
 * - withHover(withWindowSize(withBox(withPositioning(withContent(withPortal(WithTooltip))))));
 * - It reacts to box changes. Changes in the position or size of the target.
 * - If box changed, it will recalculate the styles for the positioning and sizing of the tooltip and set the styles for the followers.
 * - If box didn't change, it flips the isReady flag to true, nothing changed.
 * - It establishes the styles state, styles for the tooltip div.
 * - It accounts for the position prop, for tooltip placement.
 * - It relies on box, target and position props.
*/
export const withPositioning = <P extends { target; box; position; setIsReady; }>(
  WC,
  propsAreEqual?: PropsAreEqual<P> | false,
  componentName = WC.displayName ?? WC.name ?? WC?.type?.displayName
) => {
  const WithPositioning = (props: P) => {
    const [styles, setStyles] = useState({});
    const { target, box, position, setIsReady, ...rest } = props;

    useLayoutEffect(() =>
    {

      if (target) {
        setStyles(handleSettingStyles({ target, position, setIsReady }));
      }

      return () => {};
    }, [ target, box, setStyles, position, setIsReady ]);

    return <WC styles={styles} {...props}></WC>;
  };

  WithPositioning.displayName = `withPositioning(${componentName})`;
  return observer( WithPositioning);
};
