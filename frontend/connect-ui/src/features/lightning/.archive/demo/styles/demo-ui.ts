import styled from "styled-components";
const DemoUI = styled.div`
  position:fixed;
  top:0;
  left:0;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  background:#15052f;
  width:100%;
  height:100%;
  z-index:100000;
  color:#FFFFFF;
`
export default DemoUI

export const Body = styled.div`
  position:relative;
  display:flex;
  height:44rem;
  margin-bottom:4rem;
  z-index:1;
`

export const LeftPanel = styled.div`
  width:31rem;
  height:100%;
  display:flex;
  flex-direction:column;
  flex:1;
`

export const RightPanel = styled.div`
  width:54rem;
  height:100%;
  display:flex;
  flex-direction:column;
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

export const DemoBG = styled.div`
  position:absolute;
  width:100%;
  height:100%;
  z-index:0;
  opacity:.3;
`