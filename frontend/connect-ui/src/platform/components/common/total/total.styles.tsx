import styled from "styled-components";

export const StyledTotal = styled.div`
  position:relative;
  display:flex;
  align-items: center;
  min-width:14rem;
  height:3.875rem;
  margin: 0 1.125rem;
  border:1px solid #E7E7EE;
  border-radius:4rem;
  pointer-events: none;
  &:after {
    display: contents;
    content:'';
    box-sizing:border-box;
    position:absolute;
    pointer-events: none;
    top:-.75rem;
    left:-.75rem;
    width:calc(100% + 1.5rem);
    height:calc(100% + 1.5rem);
    border:1px solid #fafafd;
    border-radius:4rem;
  }
`
export const Label = styled.span`
  position:absolute;
  left:1.25rem;
  top:-.4375rem;
  background:#fcfcff;
  padding:0 .5rem;
  font-size:.6875rem;
  letter-spacing:.1rem;
  text-transform: uppercase;
`

export const Amount = styled.div`
  padding:0 1.625rem;
  font-size:1.3125rem;
  font-weight:600;
  letter-spacing:.08rem;
  text-transform:uppercase;
    pointer-events:all;
  *{
    pointer-events: none;
  }
  cursor:default;
`
export const AmountCentered = styled.div`
  padding:0 1.625rem;
  font-size:1.3125rem;
  font-weight:600;
  margin: 0 auto;
  letter-spacing:.08rem;
  text-transform:uppercase;
    pointer-events:all;
  *{
    pointer-events: none;
  }
  cursor:default;
`
export const ChangeArrow = styled.div`
  min-width: 0.875rem;
  margin-right:.375rem;
  svg {
    height:100%;
    width:100%;
  }
`
export const ChangeWrap = styled.div<{increased:boolean}>`
  display:flex;
  justify-content: flex-start;
  align-items: center;
  padding-right:1.25rem;
  height:100%;
  ${p => p.increased ? `
    color:#20C996;
    .fill-primary { fill:#20C996 }
  ` : `
    color:#C92A20;
    ${ChangeArrow}{
      transform:rotate(180deg);
      .fill-primary { fill:#C92A20 }
    }
  `}
`


export const Change = styled.div`
  display:flex;
  flex-direction: column;
  align-items: flex-start;
`
export const ChangeAmt = styled.div`
  margin-bottom:.125rem;
  font-weight:500;
  font-size:1.0625rem;
`
export const ChangePct = styled.div`
  font-size:.8125rem;
`