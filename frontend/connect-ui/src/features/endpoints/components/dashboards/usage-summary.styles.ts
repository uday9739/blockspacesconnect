import styled from "styled-components";

export const StyledUsageSummary = styled.div`
  order:1;
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  width:100%;
`

export const Header = styled.div`
  display:flex;
  justify-content:flex-start;
  align-items: center;
  width:100%;
  height:4.25rem;
  margin-top:.5rem;
  padding: 0 2.5rem;
`

export const Title = styled.h2`
  font-weight:400;
  font-size:1.5rem;
`

export const ChartScreen = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  align-items:flex-start;
  width:calc(100% - 2rem);
  padding:2rem 0 1rem;
  border:1px solid ${p => p.theme.lighterBlue};
  border-radius:1.75rem;
  overflow:hidden;
`

export const ChartWrap = styled.div`
  position:relative;
  width:calc(100% - 4rem);
  height:20.3125rem;
`

export const LoadingChart = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  height:100%;
  font-size:2.5rem;
  font-weight:600;
`

export const EmptyChart = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  height:100%;
  font-size:2.5rem;
  font-weight:600;
  opacity:.15;
`

export const ChartTotals = styled.div`
  display:flex;
  margin: 2rem 0 1.5rem;
`