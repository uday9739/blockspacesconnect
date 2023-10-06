import styled from "styled-components";
const Channels = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  margin-top:.75rem;
  background:#180931;
  border:1px solid #7B1AF7;
  border-radius:.75rem;
  box-shadow: 0px .0625rem .625rem rgba(143, 27, 247, 0.45);
`
export default Channels

export const SectionTitle = styled.h6`
  margin: 1.75rem 0 0 0;
  color:#FFFFFF88;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.875rem;
`
export const Detail = styled.div`
  display:flex;
  margin: 1.5rem 0 2.25rem;
`

export const AvailableWrap = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:16rem;
  height:4.125rem;
  margin: 0 .5rem;
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
