import styled from "styled-components";

const PoktDashboard = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  width:74rem;
  max-width:calc(100% - 5.5rem);
`

export default PoktDashboard;

export const Body = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items: center;
  width:100%;
  padding: 0 1rem;
  background:#FFFFFF;
  border:1px solid #D8DCF0;
  border-top:none;
  border-bottom-right-radius:.5rem;
  border-bottom-left-radius:.5rem;
  /* border-bottom:1px solid #edeff9; */
`

export const Header = styled.div`
  display:flex;
  justify-content:flex-start;
  height:3.25rem;
  width:100%;
  padding: 0 2.25rem;
  margin: 2.5rem 0 .875rem;
`

export const Title = styled.h2`
  font-weight:400;
  font-size:1.625rem;
  letter-spacing:.3rem;
`

export const Data = styled.div`
  display:flex;
  flex-direction: column;
  align-items:center;
  justify-content: center;
  width:100%;
  margin-bottom:1.5rem;
`

export const ChartWrap = styled.div`
  position:relative;
  width:calc(100% - 4rem);
  padding:0 1rem 2.25rem 0;
`

export const PoktTotals = styled.div`
  display:flex;
  align-items: center;
  justify-content: center;
  width:100%;
  padding: .75rem 3.25rem 2.75rem;
`