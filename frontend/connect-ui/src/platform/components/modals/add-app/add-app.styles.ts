import styled from "styled-components";

export const StyledAddAppModal = styled.div`
  position:absolute;
  display:flex;
  flex-direction:column;
  left:50%;
  top:3rem;
  width:calc(100% - 5rem);
  max-width:1300px;
  max-height:calc(100% - 6rem);
  background:${p => p.theme.white};
  border-radius:1.5rem;
  box-shadow:${p => p.theme.mediumBoxShadow};
  transform: translate(-50%, 0);
  overflow:hidden;
`

export const Error = styled.div`
position:relative;
display:flex;
flex-direction:column;
align-items:center;
margin-top:1rem;
margin-bottom: 1rem;
color: #721c24;
background-color: #f8d7da;
border-color: #f5c6cb;
padding: 0.75rem 1.25rem;

border: 1px solid transparent;
border-radius: 0.25rem;
`