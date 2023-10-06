import { TryOutlined } from "@mui/icons-material";
import styled from "styled-components";

const TwoFactorLogin = styled.div<{ visible:boolean }>`
  position:absolute;
  left:50%;
  top:50%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  width:38rem;
  max-width:calc(100% - 2.25rem);
  background:#FFFFFF;
  padding: 2.25rem 0 4rem;
  margin-top:-3.5rem;
  border: 1px solid #A9ACEB;
  box-shadow: 0px .0625rem 3rem rgba(88, 100, 229, 0.24);
  border-radius: .75rem;
  opacity:0;
  transform:translate(-50%, -50%);
  transition: 
    margin 500ms 50ms ease-out,
    opacity 500ms 50ms ease-out;
  ${p => p.visible && `
    opacity:1;
    margin-top:-3rem;
  `}
`

export default TwoFactorLogin

export const ConfirmForm = styled.form``

export const Subtitle = styled.p`
  margin: 2.375rem 0 1.75rem;
  font-size:1.25rem;
`