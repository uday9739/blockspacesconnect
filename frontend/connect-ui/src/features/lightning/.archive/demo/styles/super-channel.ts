import styled from "styled-components";
const SuperChannel = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  background:#180931;
  border:1px solid #7B1AF7;
  border-radius:.75rem;
  border-top-right-radius:2rem;
  box-shadow: 0px .0625rem .625rem rgba(143, 27, 247, 0.45);
`
export default SuperChannel

export const SectionTitle = styled.h6`
  margin: 1.75rem 0 0 0;
  color:#FFFFFF88;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.875rem;
`

export const ChannelSummary = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  height:7.5rem;
`

export const AvailableWrap = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:16rem;
  height:4.125rem;
  margin: 0 1.125rem;
  background:#180931;
  border:1px solid;
  border-radius:2.5rem;
  z-index:1;
`
export const Label = styled.div`
  position:absolute;
  top:0;
  padding: 0 .75rem;
  background:#180931;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.75rem;
  color:#FFFFFF88;
  transform:translate(0, -50%);
`
export const Quantity = styled.div`
  font-size:1.4375rem;
  font-weight:500;
  letter-spacing:.0625rem;
  span {
    margin-right:.25rem;
    font-weight:400;
  }
`

export const ConversionAmt = styled.div`
  position:absolute;
  bottom:0;
  padding: 0 .75rem;
  background:#180931;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.75rem;
  color:#FFFFFF88;
  transform:translate(0, 50%);
`

export const ChannelSummaryBG = styled.img`
  position:absolute;
  width:calc(100% - 4rem);
  z-index:0;
`

export const AutoBalanceSummary = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  margin: .5rem 0 1.375rem;
  width:calc(100% - 4rem);
  border:1px dashed #2c0c59;
  border-radius:2rem;
`

export const AutoBalanceSummaryLabel = styled.div`
  position:absolute;
  top:0;
  padding: 0 .75rem;
  background:#180931;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.75rem;
  color:#FFFFFF88;
  transform:translate(0, -50%);
`

export const AutoBalance = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:30%;
  height:3.25rem;
  margin: 1.875rem .5rem 1.125rem;
  background:#180931;
  border:1px solid;
  border-radius:2.5rem;
  z-index:1;
  cursor:pointer;
  pointer-events:all;
  transition:all 100ms ease-out;
  &[data-type="SEND"]{
    border-color:#360e6c;
    &:hover {
      border-color:#7b1af7;
    }
  }
  &[data-type="RECEIVE"]{
    border-color:#470e6d;
    &:hover {
      border-color:#be1bf7;
    }
  }
  div { pointer-events:none }
`
export const AutoBalanceLabel = styled.div`
  position:absolute;
  top:0;
  padding: 0 .75rem;
  background:#180931;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.6875rem;
  color:#FFFFFF88;
  transform:translate(0, -50%);
`

export const AutoBalanceQuantity = styled.div`
  font-size:1.125rem;
  font-weight:500;
  letter-spacing:.0625rem;
  span {
    margin-right:.25rem;
  }
`
export const AutoBalanceConversionAmt = styled.div`
  position:absolute;
  bottom:0;
  padding: 0 .75rem;
  background:#180931;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.6875rem;
  color:#FFFFFF88;
  transform:translate(0, 50%);
`