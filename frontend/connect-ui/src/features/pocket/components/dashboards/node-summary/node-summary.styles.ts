import styled from "styled-components";

const NodeSummaryStyles = styled.div`
  display:flex;
  flex-direction:column;
  align-items: center;
  justify-content: space-between;
  height:100%;
  border-right:1px dashed #f3f5fc;
`

export default NodeSummaryStyles;

export const SummaryBody = styled.div`
  flex:1;
  display:flex;
  flex-direction: column;
`

export const SummaryLabel = styled.div`
  display:flex;
  align-items:center;
  justify-content: center;
  margin-top:1rem;
  letter-spacing:.125rem;
  font-size:.875rem;
  font-weight:400;
  opacity:.4;
`

export const SummaryCount = styled.div`
  display:flex;
  align-items:center;
  justify-content: center;
  margin-top:.5625rem;
  letter-spacing:.0625rem;
  font-weight:600;
  font-size:1.5rem;
`

export const LogoWrap = styled.span`
  position:relative;
  display:inline-flex;
  align-items: center;
  height:100%;
  margin-right:.125rem;
  svg { 
    position:relative;
    height:1.75rem;
    width:1.75rem;
  }
  .fill-primary {
    fill:#333654;
  }
`

export const SummaryBar = styled.div`
  display:flex;
  position:relative;
  height:1.625rem;
  padding-top:.5rem;
  padding-right:.6875rem;
  margin-bottom:1.25rem;
  margin-left:0;
  border-top:1px dashed #f3f5fc;
  width:calc(100%);
  &:before {
    position:absolute;
    top:-3px;
    left:-5px;
    content:'';
    background:white;
    height:130%;
    width:.4375rem;
    transform:rotate(-20deg);
    z-index:10;
  }
`

export const ActiveBar = styled.div`
  position:relative;
  flex:1;
  background:#50E6B0;
  height:100%;
  border-top-left-radius:2px;
  border-bottom-left-radius:2px;
`

export const StatusBar = styled.div<{ background:string, width:number }>`
  position:relative;
  background:${p => p.background};
  height:100%;
  min-width:6%;
  &:last-of-type { 
    min-width:4%;
    border-top-right-radius:2px;
    border-bottom-right-radius:2px;
  }
  width:${p => p.width}%;
  
  &:after {
    position:absolute;
    top:-2px;
    left:-2px;
    content:'';
    background:white;
    height:140%;
    width:.3125rem;
    transform:rotate(-20deg);
    z-index:10;
  }
`