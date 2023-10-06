import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { Portal } from '../components/portal';
import { PropsAreEqual } from "../services/services";

/** withContent is a HOC. Created to support the tooltip component.
 * - This is the sixths and last
 * .+component of the chain.
 * - withHover(withWindowSize(withBox(withPositioning(withContent(withPortal(WithTooltip))))));
 * - It reacts to content and isOpen changes.
 * - Content prop is bound to the rendering function.
 * - When isOpen is true, show tooltip, else hide it.
 * - It establishes the isOpen state.
 */
export const withPortal = <P extends {content;}>(
  WC,
  propsAreEqual?: PropsAreEqual<P> | false,
  componentName = WC?.displayName ?? WC.name ?? WC?.type?.displayName
) => {
  const WithPortal = (props: P) => {
    const [isOpen, setIsOpen] = useState(false);
    const { content, ...rest } = props;

    return (
      <>
        <WC isOpen={isOpen} setIsOpen={setIsOpen} {...props}></WC>
        {isOpen && <Portal bubble>{content}</Portal>}
      </>
    );
  };

  WithPortal.displayName = `withPortal(${componentName})`;

  return observer(WithPortal);
};
