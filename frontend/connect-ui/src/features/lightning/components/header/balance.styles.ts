import styled from "styled-components";

export const Styles = {
  Balance: styled.div`
    display:flex;
    flex-direction:column;
    align-items: center;
    justify-content: space-between;
    height:100%;
    border-left:1px dashed #f3f5fc;
  `,
  BalanceBody: styled.div`
    flex:1;
    display:flex;
    flex-direction: column;
    `,
  BalanceLabel: styled.div`
    display:flex;
    align-items:center;
    justify-content: center;
    margin-top:1rem;
    letter-spacing:.125rem;
    font-size:.875rem;
    font-weight:400;
    opacity:.4;
    `,
  BalanceCount: styled.div`
    display:flex;
    align-items:center;
    justify-content: center;
    margin-top:.5625rem;
    letter-spacing:.0625rem;
    font-weight:600;
    font-size:1.5rem;
  `,
  LogoWrap: styled.div`
    position:relative;
    display:inline-flex;
    align-items: center;
    justify-content: center;
    height:100%;
    margin-right:.225rem;
    svg {
        width: .5625rem;
        height: 1rem;
        position:relative;
    }
    .fill-primary {
        fill:#333654;
    }
    `,
  BalanceBar: styled.div`
    display:flex;
    position:relative;
    height:1.625rem;
    padding-top:.5rem;
    padding-left:.6875rem;
    margin-bottom:1.25rem;
    margin-left:0;
    border-top:1px dashed #f3f5fc;
    width:calc(100%);
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
  `,
  FillBar: styled.div<{color: string}>`
  position:relative;
  flex:1;
  background:${props => props.color};
  height:100%;
  border-top-left-radius:2px;
  border-bottom-left-radius:2px;
`
}