import styled from "styled-components";

export const Subscription = styled.div`
  display:flex;
  align-items: center;
  height:5rem;
  width:100%;
  border:1px solid ${p => p.theme.lighterBlue};
  border-radius:.75rem;
`

export const AppLogoBG = styled.span<{ background: string }>`
  position:relative;
  display:flex;
  align-items:center;
  justify-content: center;
  position:relative;
  width:3.5rem;
  height:3.5rem;
  margin: 0 .875rem 0 1rem;
  background:${p => p.background};
  border-radius:100%;
  svg {
    width:70%;
    height:70%;
  }
`

export const PlanDetails = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
  justify-content:center;
`

export const NetworkName = styled.div`
  margin-bottom:.3125rem;
  font-weight:600;
  font-size:1.125rem;
`

export const PlanName = styled.div``

export const Pricing = styled.div`
  display: flex;
  margin: 0 .5rem;
`

export const Price = styled.div`
  display:flex;
  flex-direction:column;
  align-items: center;
  margin: 0 .5rem;
  font-family:'Roboto Mono', monospace;
  line-height:1.375rem;
  font-size:1.125rem;
`

export const PriceLabel = styled.span`
  font-size:.75rem;
`
