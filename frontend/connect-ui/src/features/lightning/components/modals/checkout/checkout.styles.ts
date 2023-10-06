import styled from "styled-components";

export const CheckoutModal = styled.div`
  width:34.853125rem;
  height:48rem;
  background-color:#FFFFFF;
  border:1px solid #E7EBFF;
  box-shadow: 0px 0px .625rem .125rem #E7EBFF;
  border-radius:1.25rem;
  display:flex;
  flex-direction:column;
  justify-content:space-around;
  align-items:center;
  font-family:Lato;
  position:relative;
`

export const CheckoutTitle = styled.h1`
  text-align:center;
  font-size:1.75rem;
  padding-bottom:1rem;
`

export const CheckoutAmount = styled.div`
  width:12rem;
  height:12rem;
  border:1px solid #E7EBFF;
  border-radius:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
`

export const CheckoutFiat = styled.h3`
  display:flex;
  justify-content:center;
  font-size:2.875rem;
`

export const CheckoutSats = styled.h3`
  display:flex;
  justify-content:center;
  font-size:1.875rem;
  color:#B3B3B3;
`

export const CancelButton = styled.button`
  position:absolute;
  top:0;
  right:0;
  background:none;
  border:none;
  cursor:pointer;
  color:rgba(123,26,248,1);
  padding:0;
`

