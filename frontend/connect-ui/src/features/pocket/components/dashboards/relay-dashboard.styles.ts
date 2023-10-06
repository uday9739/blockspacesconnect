import styled from "styled-components";

export const Dashboard = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  width:74rem;
  max-width:calc(100% - 5.5rem);
`

export const Body = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items: center;
  width:100%;
  padding: 0;
  background:#FFF;
  border:1px solid #D8DCF0;
  border-top:none;
  border-bottom:1px solid #edeff9;
`

export const Header = styled.div`
  display:flex;
  justify-content:flex-start;
  align-items: center;
  width:100%;
  height:4.25rem;
  padding: 0 2.25rem;
  margin: 2.5rem 0 .875rem;
`

export const ResetChainSelect = styled.div<{ active:boolean }>`
  display:flex;
  align-items:center;
  justify-content: center;
  height:3.25rem;
  width:3.25rem;
  border:1px solid #CBC8C8;
  border-radius:100%;
  cursor:pointer;
  pointer-events: none;
  opacity:.3;
  .fill-primary { fill:#CBC8C8 }
  ${p => p.active && `
    opacity:1;
    pointer-events: all;
    &:hover {
      border:1px solid #CBC8C8;
      box-shadow:0 1px 2px rgba(0,0,0,0.3);
      .fill-primary { fill:#308aed }
    }
  `}

`

export const Title = styled.h2`
  font-weight:400;
  font-size:1.625rem;
  letter-spacing:.3rem;
`

export const ChartWrap = styled.div`
  position:relative;
  width:calc(100% - 4rem);
  padding:0 1rem 2.25rem 0;
`

export const RelayTotals = styled.div`
  display:flex;
  align-items: center;
  justify-content: center;
  width:100%;
  padding: .75rem 3.25rem 1.75rem;
`

export const ChainData = styled.div`
  display:flex;
  flex-direction: row;
  flex-wrap:wrap;
  align-items:center;
  justify-content: center;
  width:100%;
  padding: 1.25rem 4rem;
  background:#FCFCFF;
  border-top:1px solid #f4f6fc;
`