import styled from "styled-components";

export const StyledAddSuccess = styled.div`
  position:absolute;
  display:flex;
  flex-direction:column;
  align-items: center;
  left:50%;
  top:6rem;
  width:28rem;
  max-width:calc(100% - 4rem);
  background:${p => p.theme.white};
  border-radius:1.5rem;
  box-shadow:${p => p.theme.mediumBoxShadow};
  transform: translate(-50%, 0);
  overflow:auto;
`

export const AddSuccessTitle = styled.h4`
  margin: 2.5rem 0 0;
  font-size:1.5rem;
`

export const AddSuccessText = styled.p`
  margin: 2.25rem 0 0;
  font-size:1.5rem;
`

export const CheckWrap = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:9.5rem;
  height:9.5rem;
  margin: 1.5rem 0;
  padding: .125rem;
  &:before {
    content:'';
    position:absolute;
    left:-1px;
    top:-1px;
    width:100%;
    height:100%;
    border: 1px dashed ${p => p.theme.bscBlue};
    border-radius:100%;
    animation-name:spinning-checkbox-border;
    animation-duration:12s;
    animation-timing-function:linear;
    animation-iteration-count:infinite;
  }
`

export const SuccessCheck = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  width:100%;
  height:100%;
  background: ${p => p.theme.bscBlue};
  border-radius:100%;
  box-shadow: ${p => p.theme.mediumBoxShadow};
  .fill-primary { fill:#FFFFFF }
  svg {
    width:7rem;
    height:7rem;
  }
  animation-name:pulsing-success-check;
  animation-duration:4s;
  animation-iteration-count:infinite;
`