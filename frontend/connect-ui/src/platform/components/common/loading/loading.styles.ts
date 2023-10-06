import styled, { Keyframes, keyframes } from "styled-components";

/** Shimmer is an animation, moves the background with a gradient from left to right over a long distance in a short period of time. */
const shimmer: Keyframes = keyframes`
      0% {
        background-position: -1000px 0; width: 80%;
      }
      50%{
        width: 78%;
      }
      100% {
        background-position: 1000px 0; width: 80%
      }
`;

/**
 * #### SC is an animated styled component for the Loading component.
 *
 * @param $style
 * - An optional css style object.
 * - It is auto generated when any supported style attributes are passed to the Loading component.
 * - It has a '$' prefix, which makes it a transient attribute and it will not show up on the DOM.
 * - Its values will overwrite the default values.
 *
 * @remarks has two animations:
 * - Expands from 0 to 100% width.
 * - Takes 100% of the available space by default.
 * - Second animation is in the ::after pseudo element.
 * - Is a thin horizontal panel, height: 10px, width: 80% of the main div.
 * - Has a background with gradient thats moving side to side to create an effect of a shimmer.
 *
 * @example
 * ```js
 *  import {SC} from './';
 *  const Loading = ({ when, children, ...style }:LoadingProps) => {
 *    return when ? <SC.Loading role="presentation" $style={style}/> : children || null;
 *  };
 * ```
 * @see maxWidth prop passed to Loading component:
 * - Don't set 'width' directly, it will break the expand effect of Loading, set the width through maxWidth.
 * - maxWidth controls how wide it can stretch, the default is 100%, which means it will take 100% of the width the parent allows.
 * - All use cases are working with it now. if there is any exotic configuration we can set the dimensions and the position of the loader explicitly.
 * - Height, top, left, right, maxWidth, maxHeight, minWidth and maxHight can be set explicitly.
 * - The props can be set as numbers, then they default to pixels.
 * - If you want to use any other valid CSS unit, set them as strings.
 */
// SC is an animated styled component for the Loading component.
export const SC = {
  Loading: styled.div<{ $style?}>`
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    min-height: 1rem;
    margin: 0 auto;
    margin-bottom: 1.5rem;
    margin-top: 1.5rem;
    user-select: none;
    pointer-events: none;
    animation: expand 0.5s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94);
    @keyframes expand {
      0% {
        width: 0;
      }
      100% {
        width: 100%;
      }
    }
    &::after {
      opacity: 0.8;
      position: absolute;
      width: 80%;
      height: 0.625rem;
      margin: 0 auto;
      border-radius: 0.525rem;
      content: "";
      background: linear-gradient(to right, #eff1f3 4%, #e2e2e2 25%, #eff1f3 36%);
      background-size: 62.5rem 100%;
      animation: ${shimmer} 2s infinite linear;
    }
    ${(props) => props.$style}
  `
};
