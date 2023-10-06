import styled from "styled-components";
const Payment = styled.div`
  display:flex;
  align-items:center;
  background:#1b0c36;
  height:4.375rem;
  margin:.125rem .25rem;
  &:first-of-type { 
    margin-top:.5rem;
    border-top-left-radius:.75rem;
    border-top-right-radius:.75rem; 
  }
  div { pointer-events:none }
  cursor:pointer;
  opacity:150ms ease-out;
  &:hover {
    background:#1E0D3D;
  }
`
export default Payment

export const Name = styled.div`
  flex:1;
  font-size:1rem;
  line-height:1.5rem;
  margin-bottom:.3125rem;
  margin-right:.75rem;
`
export const Time = styled.div`
  padding: 0 .875rem 0 .625rem;
  font-weight:300;
  font-size:.75rem;
  opacity:.5;
`

export const Details = styled.div`
  display:flex;
  height:3.25rem;
  width:7.5rem;
  margin-right:.75rem;
  border:1px solid #150729;
  border-radius:.75rem;
  overflow:hidden;
`
export const Type = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  border-right:1px solid #150729BB;
  min-width:1.625rem;
  max-width:1.625rem;
  padding-right:.125rem;
  height:100%;
  svg {
    width:60%;
  }
  .fill-primary {
    fill:#FFFFFF;
  }
`

export const Amount = styled.div`
  flex:1;
  position:relative;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  height:100%;
  background:#21133b66;
  border-top-right-radius:.75rem;
  border-bottom-right-radius:.75rem;
`
export const Quantity = styled.div`
  margin-bottom:.25rem;
  font-size:.8125rem;
  font-weight:500;
  span {
    font-size:.75rem;
    margin-right:.125rem;
    font-weight:400;
  }
`
export const ConversionAmt = styled.div`
  font-size:.75rem;
  font-weight:400;
  opacity:.6;
`