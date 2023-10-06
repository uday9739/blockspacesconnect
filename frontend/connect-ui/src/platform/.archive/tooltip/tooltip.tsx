import React from  "react";
import { withHover } from './hoc/with-hover';
import { withBox } from './hoc/with-box';
import { TooltipProps, WithTooltip } from './hoc/with-tooltip';
import { withPositioning } from './hoc/with-positioning';
import { withWindowSize } from './hoc/with-window-size';
import { withPortal } from './hoc/with-portal';
import { withContent } from './hoc/with-content';


/** Tooltip props is the signature of the HOC in this chain.
 * a JSX Element, with props and a displayName.
 * @see {@link TooltipProps}
*/
export type TooltipType = {
  (props: TooltipProps): any;
  children?: any;
  displayName: string;
}

/** `Tooltip` is a component based on A HOC chain.
 * - It shows a text when the target is hovered by the mouse, and hides it when the mouse is out of the target.
 * - It wraps around any component.
 * - Makes the wrapped target  accessible, tabbable. Focusing on the target with the keyboard will open the tooltip.
 * - `Tooltip` shows the provided text.
 * - `Tooltip` can be placed on top/bottom/left/right of the wrapped component.
 * - Escape key closes the tooltip.
 * - `Tooltip` appears in the react portal, so it will not be affected by any overflow: hidden settings in the dom elements.
 * - By default it has an arrow.
 * - By default it will be placed at the bottom.
 * - Scrolling or resizing the window will close the tooltip.
 * - All HOC are in the ./hoc folder.
 * - withTooltip.tsx is the base of the chain. Start there.
 * @see {@link WithTooltip}
 * @see {@link TooltipProps}
*/
export const Tooltip: TooltipType = withHover(withWindowSize(withBox(withPositioning(withContent(withPortal(WithTooltip))))));