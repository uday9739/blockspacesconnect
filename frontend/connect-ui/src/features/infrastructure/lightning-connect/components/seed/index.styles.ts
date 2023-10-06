import styled from "styled-components";

export const ViewSeedContainer = styled.div<{show:boolean}>`
  display:${p => p.show ? "flex":"none"};
  position:absolute;
  flex-direction:column;
  left:40;
  padding:1rem 0;
  width:70rem;
  background-color:#FFF;
  z-index:999;
  box-shadow:${p => p.theme.mediumBoxShadow};
  border-radius:1.875rem
`

export const SeedPhrase = styled.div`
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
`

export const SeedWord = styled.p`
  font-family:"Roboto Mono";
  margin:.125rem .5rem;
  padding:.625rem 1rem;
  font-size:1.5rem;
  display:flex;
  box-shadow:${p => p.theme.mediumBoxShadow};
  border-radius:1.875rem; 
`

export const SeedWarning = styled.div`
  background:${p => p.theme.bscHighlight}11;
  border:1px solid ${p => p.theme.bscHighlight};
  font-size:1.125rem;
  margin:1.5rem;
  color:${p => p.theme.bscHighlight};
  border-radius:1.875rem;
  display:flex;
  flex-direction:row;
  padding:1rem 1rem;
  align-items:center;
`

export const Title = styled.h1`
  text-align:center;
  font-size:1.5rem;
  font-family:"Roboto Mono";
`

export const Close = styled.div`
  position:absolute;
  right:1%;
  top:1%;
  cursor:pointer;
`