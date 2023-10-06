import React from "react";
import { SC } from './loading.styles';

/**
 * #### Props for the Loading component
 *
 * @remarks The css style properties defined in this type are available to be set.
 * - Additional css style properties for the Loading component can be added to this type.
 * - All style properties will automatically propagate to the styled component in a css style object.
 *
 * @example 1 (number will be converted to pixels)  or '1px' or '1rem' or '1em'.
 *
 * @see {@link SC} for implementation.
 */
export type LoadingProps = {
  /** - A prop that takes a function returning a boolean.
   *  - It will show and hide the wrapped component based on the return value of that function. */
  when: boolean;
  /** - Sets the height of the loading container
   *  - When you like for it to take up more vertical space */
  height?: string | number;
  /** - Sets the margins around the loading container.
   *  - When you like for it to take up more space on all sides */
  margin?: string | number;
  /** - Sets the position of the top edge of the loading container.
   *  - When the standard position (0) is not working in a use case.  */
  top?: string | number;
  /** - Sets the horizontal position of the loading container.
   *  - When the standard position (0) is not working in a use case.  */
  left?: string | number;
  /** - Sets the horizontal position of the right edge loading container.
   *  - When the standard position is not working in a use case.  */
  right?: string | number;
  /** - Sets the vertical position of the loading container.
   *  - When the standard position (0) is not working in a use case.  */
  bottom?: string | number;
  /** - Sets the maximum width of the loading container.
   *  - Setting this is a way to control the width.
   *  - Don't set width directly, it will break the opening animation.  */
  maxWidth?: string | number;
  /** - Sets the maximum height of the loading container */
  maxHeight?: string | number;
  /** - Sets the minimum width of the loading container */
  minWidth?: string | number;
  /** - Sets the minimum height of the loading container */
  minHeight?: string | number;
  /** - This is the wrapped component, the children nodes.
   *  - Will be set automatically */
  children?: any;
};


/**
 * #### Loading is a component that can be wrapped around any other component and show or hide it based on the boolean value passed through the 'when' prop.
 * - If 'when' prop is \{true\} render a loading animation.
 * - Else render the wrapped component.
 *
 * @param when - A boolean value that determines whether the loading component should hide the wrapped component or not.
 * @param maxWidth - optional
 * - Sets the final width of the loading animation after expansion.
 * - Overrides the standard 100%.
 * - Type is number or string.
 * - Number will convert to px.
 * - Use string to set valid css units -\> 1rem, 1px, 1em, 1% etc.
 * - Don't set 'width' directly, it will break the expanding animation of Loading, set the width through maxWidth.
 *
 * @remarks A loading component that can be used to display a loading indicator while data is being fetched from the server.
 *
 * @example Integration of the loading component into a layout.
 * ```js
 * import {Loading} from 'components/shared/loading'
 * import {Button} from 'components/shared/button'
 * <Loading when={true}><Button label="hidden by loading"/></Loading>
 * <Loading when={false}><Button label="revealed by loading"/></Loading>
 * ```
 * @see {@link LoadingProps} for other currently supported props.
 */
export const Loading = ({ when, children, ...style }: LoadingProps) => {
  return when ? <SC.Loading role="presentation" $style={style}/> : (children || <></>);
};