import styled from "styled-components";

// Styles is the collection of styled components for super chanel
export const Styles = {
  Superchannel: styled.div`
    display:flex;
    flex-direction:column;
    align-items: center;
    justify-content: space-between;
    height:100%;
    border-right:1px dashed #f3f5fc;
  `,
  SuperchannelBody: styled.div`
    flex:1;
    display:flex;
    flex-direction: column;
  `,
  SuperchannelLabel: styled.div`
    display:flex;
    align-items:center;
    justify-content: center;
    margin-top:1rem;
    letter-spacing:.125rem;
    font-size:.875rem;
    font-weight:400;
    opacity:.4;
  `,
  SuperchannelInfo: styled.div`
    display:flex;
    align-items:center;
    justify-content: center;
    margin-top:.7625rem;
    letter-spacing:.0625rem;
    font-weight:600;
    font-size:.9375rem;
  `,
  IconWrap: styled.span`
    position:relative;
    display:inline-flex;
    align-items: center;
    height:100%;
    margin-right:.525rem;
  `,
  Icon: styled.div`
    width: 1.7rem;
    height: 1.3125rem;
    border: 1px solid #f1f1f1;
    border-radius: 4px;
    font-size: .75rem;
    text-align: center;
    line-height: 1.3125rem;
  `,
  SummaryBar: styled.div`
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
  `,
  ActiveBar: styled.div<{color: string}>`
    position:relative;
    flex:1;
    background:${p => p.color};
    height:100%;
    border-top-left-radius:2px;
    border-bottom-left-radius:2px;
  `,
  StatusBar: styled.div<{ background:string, width:number }>`
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
}
