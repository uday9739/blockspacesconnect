import styled from "styled-components";

export const PointOfSalePage = styled.div`
  height:100%;
  width:100%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;  
`

export const PointOfSaleContainer = styled.div`
  height:40.125rem;
  width:39.0625rem;
  box-shadow: 0px 0px .625rem .125rem #E7EBFF;
  border-radius:1.25rem;
  font-family:"Roboto Mono";
`

export const CompanyName = styled.h1`
  margin-bottom:2rem;
  font-size:2rem;
  letter-spacing:.0875rem;
`

export const Footer = styled.p`
  margin-top:2rem;
  display:flex;
  align-items:center;
`

export const SalePrice = styled.div`
  height:8.1875rem;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  border-bottom:1px solid #000000;
`

export const DollarAmount = styled.h3`
  font-size:2.75rem;
`

export const SatsAmount = styled.p`
  font-size:1.125rem;
  color:#B3B3B3;
  margin:1rem 0 0 0;
`

export const KeyPadContainer = styled.div`
  width:39.0625rem;
  height:31.9375rem;
  display:flex;
  justify-content:center;
  align-items:center;
  flex-direction:row;
`

export const KeyPad = styled.div`
  width:25.3125rem;
  height:30.6875rem;
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  align-items:center;
`
export const Pin = styled.button`
  width:6.25rem;
  height:6.25rem;
  border:.0625rem solid #E7EBFF;
  background:none;
  border-radius:100%;
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:2.125rem;
  color:#000000;
  margin:0 1rem;
  cursor:pointer;
  :hover {
    color:rgba(123,26,248,1);
    border: .0625rem solid rgba(123,26,248,1);
  }
  :active {
    background: linear-gradient(180deg, rgba(123,26,248,1) 0%, rgba(190,27,247,1) 100%);
    color: #FFFFFF;
  }
`

export const ActionBar = styled.div`
  width:8.75rem;
  height:30.6875rem;
  display:flex;
  flex-direction:column;
  justify-conent:center;
  align-items:center;
`

export const Clear = styled.button`
  width:6.25rem;
  height:6.25rem;
  border:.0625rem solid #E7EBFF;
  background:none;
  border-radius:100%;
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:2.125rem;
  color:#000000;
  margin:0 1rem;
  cursor:pointer;
  margin-top:1.25rem;
  &:hover {
    background: linear-gradient(180deg, rgba(123,26,248,1) 0%, rgba(190,27,247,1) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    border: .0625rem solid rgba(123,26,248,1);
  }
  :active {
    background: linear-gradient(180deg, rgba(123,26,248,1) 0%, rgba(190,27,247,1) 100%);
    color: #FFFFFF;
  }
`

export const Charge = styled.button`
  width:6.25rem;
  height:20.6875rem;
  background:none;
  border-radius:6.25rem;
  border:none;
  background: linear-gradient(180deg, rgba(123,26,248,1) 0%, rgba(190,27,247,1) 100%);
  cursor:pointer;
  margin-top:1.25rem;
  &:hover {
    box-shadow: 0px 0px .125rem .0625rem rgba(190,27,247,.25);
  }
`