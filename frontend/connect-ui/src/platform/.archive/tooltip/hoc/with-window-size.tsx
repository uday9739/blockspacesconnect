import { observer } from "mobx-react-lite";
import React, { useLayoutEffect } from "react";

import { PropsAreEqual } from "../services/services";



/** withContent is a HOC. Created to support the tooltip component.
 * - This is the second component of the chain.
 * - withHover(withWindowSize(withBox(withPositioning(withContent(withPortal(WithTooltip))))));
 * - It reacts to window resize and scroll events.
 * - It flips the isReady flag to false in case of any events.
 * - It relies on nothing.
*/
export const withWindowSize = <P extends { setIsReady }>(
  WC,
  propsAreEqual?: PropsAreEqual<P> | false,

  componentName = WC.displayName ?? WC.name ?? WC?.type?.displayName
) => {
  const WithWindowSize = (props: P) => {

    const { setIsReady } = props;

    useLayoutEffect(() => {
      const initDebounce = () => {
        setIsReady(false);
      };
      addEventListener("resize", initDebounce);
      addEventListener("scroll", initDebounce);
      addEventListener("wheel", initDebounce);

      return () => {
        removeEventListener("resize", initDebounce);
        removeEventListener("scroll", initDebounce);
        removeEventListener("wheel", initDebounce);
      };
    }, [ setIsReady ]);

    return <WC {...props} />;
  };

  WithWindowSize.displayName = `withWindowSize(${componentName})`;

  return observer(WithWindowSize);
};
