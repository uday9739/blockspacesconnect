import styled from "styled-components";

export const PayErpInvoiceContainer = styled.div`
  display:flex;
  justify-content:center;
  align-items:center;
  width:100%;
  height:100vh;
`

export const YourBill = styled.div`
  width:36.5625rem;
  height:25rem;
  box-shadow: 0px 0px .625rem .125rem #E7EBFF;
  border-radius:1.25rem;
  color:#333654;
  display:flex;
  flex-direction:column;
  justify-content:space-around;
  align-items:center;
  padding:3rem 0;
`
  
export const YourBillHeader = styled.h1`
  font-size:2.5rem;
  text-align:center;
  letter-spacing:.1rem;
  padding-bottom:1rem;
`

export const LineItems = styled.div`
  width:31.4375rem;
  height:26rem;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  overflow:scroll;
`

export const LineItem = styled.div<{subtotal?:boolean}>`
  display:flex;
  justify-content:space-around;
  width:100%;
  padding:${p => p.subtotal ? ".25rem .5rem" : ".5rem 0"};
`

export const LineItemText = styled.p<{gray?:boolean, weight?:number, size?:number}>`
  color:${p => p.gray ? "#B3B3B3" : "#333654"};
  font-weight:${p => p.weight ? 200 : null};
  font-size:${p =>`${p.size}rem`};
  margin:0;
`

export const Total = styled.div`
  padding-bottom:1rem;
`

export const TotalText = styled.h3`
  text-align:center;
  font-size:1.375rem;
  font-weight:200;
  letter-spacing:.1rem;
  color:#B3B3B3;
`

export const Amount = styled.h4`
  font-size:2.875rem;
`

export const Sats = styled.h5`
  text-align:center;
  color:#B3B3B3;
  font-weight:200;
`

export const Spacer = styled.div<{size:number, color:string}>`
  width:100%;
  border-top:${p => `${p.size}px solid ${p.color}`};
`

export const Subtotals = styled.div`
  width:31.4375rem;
`