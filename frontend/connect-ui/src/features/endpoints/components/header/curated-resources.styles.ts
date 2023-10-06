import styled from "styled-components";

const Resources = styled.div`
  display:flex;
  flex-direction:column;
  align-items: center;
  justify-content: space-between;
  height:100%;
  border-left:1px dashed #f3f5fc;
`

export default Resources;

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
  padding-left:.6875rem;
  margin-bottom:1.25rem;
  margin-left:0;
  border-top:1px dashed #f3f5fc;
  width:calc(100%);
  pointer-events: all;
  * {
    pointer-events: none;
  }
  &:before {
    position:absolute;
    top:-3px;
    right:-5px;
    content:'';
    background:white;
    height:130%;
    width:.4375rem;
    transform:rotate(20deg);
    z-index:10;
  }
`

export const StakedBar = styled.div`
  position:relative;
  flex:1;
  background:#1D8AED;
  height:100%;
  border-top-left-radius:2px;
  border-bottom-left-radius:2px;
`

export const UnstakedBar = styled.div<{ width: number }>`
  position:relative;
  background:#1DAFED;
  height:100%;
  min-width:5%;
  width:${p => p.width}%;
  &:after {
    position:absolute;
    top:-2px;
    left:-2px;
    content:'';
    background:white;
    height:135%;
    width:.3125rem;
    transform:rotate(20deg);
    z-index:10;
  }
`