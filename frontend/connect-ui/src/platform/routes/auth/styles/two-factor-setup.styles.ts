import { TryOutlined } from "@mui/icons-material";
import styled from "styled-components";

const TwoFactorSetup = styled.div<{ visible:boolean, loading:boolean, showCodeEntry:boolean }>`
  position:absolute;
  left:50%;
  top:50%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  width:32rem;
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
  ${p => !p.loading && !p.showCodeEntry && `
    width:84rem;
  `}
  ${p => !p.loading && p.showCodeEntry && `
    width:38rem;
  `}
`

export default TwoFactorSetup

export const ConfirmForm = styled.form``

export const Subtitle = styled.p`
  margin: 2.375rem 0 1.75rem;
`

export const LargeSubtitle = styled.p`
  margin: 2.25rem 0 2.75rem;
  font-size:1.3125rem;
`

export const Steps = styled.div`
  display:flex;
  align-items:space-between;
  width:100%;
  padding: 0 2.125rem;
  margin: 0 0 3rem;
`
export const Step = styled.div<{ wide?:boolean }>`
  flex:${p => p.wide ? '2' :'1' };
  display: flex;
  flex-direction:column;
  margin: 0 1.125rem;
`

export const StepLabel = styled.h5`
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  height:3rem;
  color:#9395a4;
  border:1px solid #f3f5ff;
  border-radius:2rem;
  font-size:1.1875rem;
  letter-spacing:.0625rem;
  font-weight:300;
  font-style:italic;
`

export const StepDescription = styled.p`
  text-align:center;
  margin: 2.375rem 0 1.75rem;
`

export const Sections = styled.div`
  position:relative;
  display:flex;
  &:before {
    content:'';
    position:absolute;
    left:45%;
    top:.25rem;
    width:1px;
    height:10rem;
    background:#E7EBFF;
  }
`
export const Section = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  position: relative;
  margin: 0 1.125rem;
`
export const SectionDivider = styled.span`
  position:absolute;
  top:1.625rem;
  left:45%;
  font-weight:300;
  background:white;
  padding: .875rem;
  transform:translate(-50%, 0);
  font-size:.9375rem;
  font-style:italic;
  color:#36385888;
`

export const Authenticators = styled.div`
  display:flex;
  flex-direction:column;
  padding: .5rem 0;
`

export const Authenticator = styled.a`
  display:flex;
  align-items:center;
  text-decoration:none;
  position:relative;
  height:4rem;
  margin: .125rem 0;
  padding: .25rem;
  border:1px solid #E7EBFF;
  border-radius:2rem;
  outline:none;
  transition: 50ms ease-out;
  &:visited {
    color:#363858
  }
  &:hover,
  &:focus {
    border:1px solid #5864E5;

  }
`
export const AuthenticatorLogo = styled.img`
  width:3.5rem;
  height:3.5rem;
`
export const AuthenticatorLabel = styled.span`
  flex:1;
  margin-left:.75rem;
`

export const QRCode = styled.img`
  width:100%;
  margin-top:-1rem;
`

export const SecretKey = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  height:3.25rem;
  width:auto;
  margin: .75rem 0;
  padding: 0 1.5rem;
  border:1px solid #E7EBFF;
  border-radius:2rem;
  font-size:.875rem;
`

export const SecurityBox = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
 // position:absolute;
  left:-1.5rem;
  bottom:1rem;
  padding: 1.875rem 1.875rem 1.25rem;
  background:#FDFDFF;
  border:1px solid #E7EBFF;
  border-radius:.75rem;
  width:calc(100% + 1.5rem);
`

export const SecurityLabel = styled.h6`
  letter-spacing:.0625rem;
  font-size:.9375rem;
  font-style:italic;
  font-weight:400;
`

export const SecurityText = styled.p`
  text-align:center;
  line-height:1.75rem;
  font-size:.9375rem;
`

export const BackToConfigure = styled.span`
  margin-bottom:1.125rem;
  font-size:.9375rem;
  letter-spacing:.0625rem;
  cursor:pointer;
  opacity:.4;
  transition:100ms ease-out;
  &:hover {
    text-decoration:underline;
    opacity:1;
  }
`