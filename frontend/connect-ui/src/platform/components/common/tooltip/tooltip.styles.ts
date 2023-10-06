import styled from "styled-components";

export const StyledTooltip = styled.div<{ placement: 'top' | 'bottom' | 'left' | 'right' }>`
  background:#5864E5;
  padding:.375rem 1rem .5rem;
  border-radius:1.5rem;
  color:white;
  box-shadow: 0px 2px 3px rgba(88, 100, 229, 0.28);
  font-size:.875rem;
  ${p => p.placement === 'top' && `
    transform:translate(-50%, -145%);
    &:before {
      top:calc(100% - .625rem);
      left:calc(50% - .5rem);
    }
  `}
  ${p => p.placement === 'bottom' && `
    transform:translate(-50%, 50%);
    &:before {
      bottom:calc(100% - .625rem);
      left:calc(50% - .5rem);
    }
  `}
  ${p => p.placement === 'left' && `
    transform:translate(-100%, -50%);
    margin-left:-.75rem;
    &:before {
      top:calc(50% - .5rem);
      right:-.125rem;
    }
  `}
  ${p => p.placement === 'right' && `
    transform:translate(0%, -50%);
    margin-left:.75rem;
    &:before {
      top:calc(50% - .5rem);
      left:-.125rem;
    }
  `}
  &:before {
    content:"";
    position:absolute;
    width:1rem;
    height:1rem;
    transform: rotate(45deg);
    background:#5864E5;
    z-index:-1;
  }
`