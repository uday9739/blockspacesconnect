import styled from "styled-components";

export const PaymentDetails = styled.div`
  display:flex;
  flex-direction:column;
  align-items:left;
  height: 20%;
`
export const SpinnerContainer = styled.div`
  display:flex;
  justify-content:center;
  align-items:center;
  margin:auto;
`

export const DetailsRow = styled.div`
  display:flex;
  flex-direction:row;
  justify-content:space-between;
  align-items:start;
  padding:0.5rem 0 0 0;
  gap:2rem;
`
export const Text = styled.p<{size?:string, decoration?:string, weight?:string, textStyle?:string}>`
  font-size: ${p => p.size ? p.size : '1rem'};
  text-decoration: ${p => p.decoration ? p.decoration : 'default'};
  padding:0;
  margin:0;
  font-weight:${p => p.weight ? p.weight : 'normal'};
  font-style:${p => p.textStyle ? p.textStyle : 'normal'};
`
export const Description = styled.i`
  margin:0;
  text-overflow:ellipsis;
  max-width: 10rem;
  height: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow:hidden;
  line-height: 1;
`
export const Stack = styled.div`
  display:flex;
  flex-direction:column;
  justify-content:start;
  align-items:end;
  gap:0.4rem;
  cursor:default;
`
export const CondensedRow = styled.div`
  display:flex;
  flex-direction:row;
  align-items:center;
`
export const Line = styled.hr`
  height:1px;
  width: 100%;
  color:gray;
`