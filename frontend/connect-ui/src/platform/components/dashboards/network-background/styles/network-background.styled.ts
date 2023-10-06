import styled, { CSSProperties } from "styled-components"

export const NetworkBackgroundStyles = styled.div`
  position:fixed;
  left:0;
  top:0;
  width:100%;
  height:100%;
  display:flex;
  background:white;
  justify-content:center;
  align-items:center;
  pointer-events:none;
  overflow:hidden;
`

export const Gradient = styled.div`
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background: linear-gradient(90deg, #F3F3FD 0%, rgba(243, 247, 253, 0.06) 50%, #F3F3FD 100%);
  opacity: 0.1;
  z-index:10;
`

export const Networks = styled.div`
  display:flex;
  flex-wrap:nowrap;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  padding: .25rem;
`

export const NetworkRow = styled.div`
  display:flex;
  flex-wrap:nowrap;
`

export const Network = styled.div`
  position:relative;
  svg {
    width:100%;
    height:100%;
    opacity:.05;
    animation-iteration-count:infinite;
  }
  &[data-glow-type="a"] svg {
    animation-name: network-glow-a;
  }
  &[data-glow-type="b"] svg {
    animation-name: network-glow-b;
  }
  &[data-glow-type="c"] svg {
    animation-name: network-glow-c;
  }
  .fill-primary {
    fill:#5864E5;
  }
`