import styled from "styled-components";

export const StyledSetup = styled.div`
  flex:1;
  position:relative;
  display:flex;
  flex-direction:column;
  justify-content:flex-start;
  align-items:center;
`

export const Header = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  width:100%;
  height:7.25rem;
  margin-bottom:3rem;
  border-bottom:1px solid #eef1f9;
`

export const Logo = styled.div`
  position:absolute;
  display:flex;
  align-items: center;
  left:1.5rem;
  height:100%;
  svg {
    width:3rem;
    height:3rem;
    .fill-primary { fill:#323656 }
  }
`

export const Back = styled.div`
  position:absolute;
  top:.75rem;
  right:1.5rem;
  display:flex;
  align-items:center;
  justify-content: center;
  margin: 1rem;
  width:3.875rem;
  height:3.875rem;
  border:1px solid #f1f4fa;
  border-radius:100%;
  cursor:pointer;
  transition:125ms ease-out;
  svg {
    opacity:.2;
    transition:125ms ease-out;
  }
  &:hover {
    svg { opacity:1 }
  }
`

export const Title = styled.div`
  flex:1;
  position:relative;
  display:flex;
  align-items: center;
  justify-content: center;
  width:34rem;
  padding-bottom:.75rem;
  margin: 0 auto;
  font-size:2rem;
  font-weight:400;
  font-family:'Roboto Mono';
  &:before {
    position:absolute;
    bottom:-1px;
    content:'';
    height:1.125rem;
    width:100%;
    border:1px solid #f1f4fa;
    border-bottom:1px solid #f8f9fc;
    border-top-right-radius: .375rem;
    border-top-left-radius: .375rem;
  }
  &:after {
    position:absolute;
    bottom:.5rem;
    content:'';
    height:1px;
    width:100%;
    background:#f8f9fc;
  }

`