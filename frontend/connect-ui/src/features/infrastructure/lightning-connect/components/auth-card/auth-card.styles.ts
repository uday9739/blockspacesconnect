import styled from "styled-components";

export const AuthCardContainer = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:space-between;
  width:17.625rem;
  // border:1px solid #d8dcf0;
  box-shadow:${p => p.theme.mediumBoxShadow};
  border-radius:1.875rem;
  margin:.5rem;
  height:25rem;
  padding:1rem;
  font-family:"Roboto Mono";
`

export const Title = styled.h1`
  text-align:center;
  font-size:1.25rem;
`