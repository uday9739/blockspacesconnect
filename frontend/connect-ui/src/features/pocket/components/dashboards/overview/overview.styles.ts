import styled from "styled-components";

export const StyledOverview = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  width:74rem;
  max-width:calc(100% - 5.5rem);
  margin-top:.75rem;
`

export const Body = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items: center;
  width:100%;
  background:white;
  border:1px solid #D8DCF0;
  border-top-left-radius:.5rem;
  border-top-right-radius:.5rem;
`

export const ToggleWrap = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  width: calc(100% - 1rem);
  height: 4rem;
  margin: 0 .5rem;
  border-bottom:1px solid #f5f7fb;
`

export const Toggle = styled.div`
  display:flex;
  align-items: center;
`

export const Label = styled.div<{ selected?:boolean }>`
  letter-spacing:.15rem;
  font-size:1rem;
  opacity:.3;
  cursor:pointer;
  &:hover { opacity: .7 }
  ${p => p.selected && `
    opacity:1;
    cursor:default;
    &:hover { opacity: 1 }
  `}
`

export const Track = styled.div`
  position:relative;
  background:#1D8AED;
  width:3.125rem;
  height:1.5rem;
  margin: 0 .875rem;
  border-radius:1rem;
  &:hover { 
    box-shadow: 0px 2px 12px rgba(29, 138, 237, 0.25);
  }
  cursor:pointer;
`


export const Nub = styled.div<{right?:boolean}>`
  position:absolute;
  top:-.125rem;
  height:1.75rem;
  width:1.75rem;
  background:white;
  border:1px solid #D8DCF0;
  border-radius: 100%;
  transition:all 150ms ease-out;
  ${p => p.right ? `
    left:calc(100% + .0625rem);
    transform:translate(-100%, 0);
    ` : `
    left:-.0625rem;
  `}
`

export const DailyTotals = styled.div`
  position:relative;
  display:flex;
  flex-direction: column;
  align-items:center;
  justify-content:center;
  width:calc(100% - 1rem);
  height:11.75rem;
`

export const DailyTotalsTitle = styled.h4`
  display:flex;
  align-items: center;
  justify-content: center;
  font-weight:400;
  letter-spacing:.23rem;
  font-size:1.0625rem;
  margin-bottom:2.0625rem;
`

export const Totals = styled.div`
  display:flex;
  position:relative;
  justify-content: center;
  align-items: center;
  width:100%;
  margin-bottom:.4375rem;
`

export const DateSelect = styled.div`
  position: relative;
  display:flex;
  align-items:flex-start;
  height:3.5rem;
  width:100%;
  padding: .5rem .875rem 0;
  border-top:1px dashed #f5f7fb;
`

export const Date = styled.div<{ selected?:boolean }>`
  position:relative;
  display:flex;
  align-items:center;
  height:100%;
  padding: 0 1.125rem;
  margin: 0 .125rem;
  background:#FFFFFF;
  border:1px solid #D8DCF0;
  border-bottom:none;
  border-top-left-radius:.75rem;
  border-top-right-radius:.75rem;
  opacity:.4;
  &:hover { opacity: .8 }
  letter-spacing:.12rem;
  font-size:.875rem;
  cursor:pointer;
  ${p => p.selected && `
    height:calc(100% + 1px);
    background:#FFFFFF;
    opacity:1;
    &:hover { opacity: 1 };
    cursor:default;
    height:
  `}
`