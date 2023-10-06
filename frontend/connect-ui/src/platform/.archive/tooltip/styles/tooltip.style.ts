import styled, { keyframes, Keyframes } from "styled-components";
const fadeIn: Keyframes = keyframes`
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
`;

/** Frame is a styled component for the frame of the tooltip.
 * - Is utilized by `withContent`.
 * - Handles the arrow placement.
 * - Handles the sizing and positioning of the tooltip in the provided box.
 * - Arrow is created in the ::before pseudo element, by `border` method.
 * - Arrow is places by class provided by `withContent`.*/
const Frame = styled.div<{ arrow: boolean, $style }>`
  position: relative;
  width: fit-content;
  height: fit-content;
  z-index:100;
  padding: 0.375rem 1rem 0.5rem;
  border-radius: 1.2rem;
  background: #5864e5;
  animation: ${fadeIn} 0.2s forwards ease-in;
  box-shadow: 1px 1px 3px #ccc;
  &.tooltip-top {
    bottom: ${(p) => (p.arrow ? ".5rem" : 0)};
  }
  &.tooltip-bottom {
    top: ${(p) => (p.arrow ? ".5rem" : 0)};
  }

  &.tooltip-right {
    left: ${(p) => (p.arrow ? ".5rem" : 0)};
  }
  &.tooltip-left {
    right: ${(p) => (p.arrow ? ".5rem" : 0)};
  }

  &::before {
    position: absolute;
    content: ${p => (p.arrow ? "''" : undefined)};
    border: 0.5rem solid transparent;
  }

  &.tooltip-bottom::before {
    left: 50%;
    transform: translate3d(-50%, -1.24rem, 0);
    border-bottom-color: ${p => p.$style?.backgroundColor ?? p.$style?.background ?? '#5864e5'} ;
  }

  &.tooltip-right::before {
    top: 50%;
    transform: translate3d(-1.82rem, -50%, 0);
    border-right-color: ${p => p.$style?.backgroundColor ?? '#5864e5'} ;
  }
  &.tooltip-top::before {
    left: 50%;
    bottom: -1rem;
    transform: translate3d(-50%, 0, 0);
    border-top-color: ${p => p.$style?.backgroundColor ?? '#5864e5'} ;
  }
  &.tooltip-left::before {
    top: 50%;
    right: -0.84rem;
    transform: translate3d(0, -50%, 0);
    border-left-color: ${p => p.$style?.backgroundColor ?? '#5864e5'} ;
  }

  ${(props) => props.$style}
`;

/** Frame is a styled component for the text of the tooltip.
 * - Is utilized by `withContent`.
 * - Handles the font.
 * - Handles max `width` and `height`.*/
const Text = styled.div`
  position: relative;
  left: 50%;
  color: white;
  min-width: 10rem;
  font-size: 0.875rem;
  text-align: center;
  transform: translate(-50%, 0);
  overflow: hidden;
  max-height: 5rem;
  max-width: 20rem;
`;

/** SC is a container component to allow for dot syntax.
 * - `<SC.Frame/>`
 * - `<SC.Text/>` */
export const SC = Object.assign(
  {},
  {
    Frame: Frame,
    Text: Text
  }
);