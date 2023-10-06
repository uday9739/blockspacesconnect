import styled from "styled-components";

export const StyledChainTotal = styled.div<{ selected:boolean }>`
  position:relative;
  display:flex;
  align-items: center;
  width:15.84375rem;
  height:4.5rem;
  margin: .25rem .3125rem;
  border:1px solid #F5F5F5;
  border-radius:4rem;
  cursor:pointer;
  pointer-events: all;
  transition: all 100ms ease-out;
  *{
    pointer-events: none;
  }
  &:hover {
    border:1px solid #FFFFFF;
    box-shadow:0 1px 2px rgba(0,0,0,0.3);
  }
  ${p => p.selected && `
    border:1px solid #CBC8C8;
    &:hover {
      border:1px solid #CBC8C8;
      box-shadow:0 1px 2px rgba(0,0,0,0.3);
    }
  `}
`

export const Content = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  justify-content: center;
  height:100%;
`
export const Label = styled.div`
  font-size:.9375rem;
  letter-spacing:.01rem;
  margin-bottom:.25rem;
`
export const Amount = styled.div`
  font-size:1.0625rem;
  font-weight:600;
  letter-spacing:.05rem;
  text-transform:uppercase;
`

export const Percentage = styled.span`
  font-size:.875rem;
  font-weight:400;
  margin-left:.375rem;
  opacity:.55;
`

export const LogoWrap = styled.div`
  position:relative;
  display:flex;
  min-width:3.5rem;
  width:3.5rem;
  margin: 0 .6875rem 0 .5rem;
`

export const Logo = styled.img`
  position:relative;
  width:100%;
  height:100%;
`