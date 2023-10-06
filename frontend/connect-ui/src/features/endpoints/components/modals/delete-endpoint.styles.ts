import styled from "styled-components";

export const StyledDeleteEndpoint = styled.div`
  position:absolute;
  display:flex;
  flex-direction:column;
  align-items: center;
  left:50%;
  top:6rem;
  width:38rem;
  max-width:calc(100% - 4rem);
  padding:0 1.125rem;
  background:${p => p.theme.white};
  border-radius:1.5rem;
  box-shadow:${p => p.theme.mediumBoxShadow};
  transform: translate(-50%, 0);
  overflow:hidden;
`

export const Title = styled.div`
  margin:2rem 0;
  text-align:center;
  font-size:1.375rem;
`

export const PromptCopy = styled.p`
  margin: 0 0 2rem;
  text-align:center;
`

export const Options = styled.div`
  display:flex;
  margin: 1.5rem 0 2rem;
`

export const DeleteConfirm = styled.input`
  width:18rem;
  height:3.25rem;
  color:${p => p.theme.black};
  padding: 0 1.875rem;
  border:1px solid;
  border-color:${p => p.theme.lightBlue};
  border-radius: 2rem;
  outline:none;
  text-align:center;
  font-size:1.125rem;
  letter-spacing:.15;
  transition:all 150ms ease-out;
  &:hover {
    box-shadow:${p => p.theme.slightBoxShadow};
  }
  &:focus {
    border-color:${p => p.theme.bscBlue}80;
    box-shadow:${p => p.theme.slightBoxShadow};
  }
  &::placeholder {
    color: #abb2f270;
    font-size: 1.0625rem;
  }
`