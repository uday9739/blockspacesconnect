import styled from "styled-components";

export const NodeInfoContainer = styled.div`
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  // border:1px solid #d8dcf0;
  // box-shadow:${p => p.theme.mediumBoxShadow};
  // border-radius:1.875rem;
  width:36.9375rem;
  margin:1rem 1rem 1rem 0;
  padding:1rem 2rem;
`

export const Heading = styled.h1`
  text-align:center;
  font-size:1.125rem;
  font-family:"Roboto Mono";
`

export const InfoLine = styled.div`
  display:flex;
  flex-direction:row;
  justify-content:space-between;
  align-items:center;
  padding:.5rem 0;
`

export const TitleWithInfo = styled.div`
  display:flex;
  flex-direction:row;
  align-items:center;
`