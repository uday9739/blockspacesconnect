import styled from "styled-components"

export const IntegrationStyles = styled.div`
  display:flex;
  position:relative ;
  justify-content:center; 
  min-width:609px;
  max-width:819px;
  min-height:200px;
  background-color:#FFFFFF;
  border:1px solid #E4E0E5;
  border-radius:1.25rem;
`

export const AuthenticateConnector = styled.div`
  display:flex;
  flex-direction:row;
  width:30rem;
  justify-content:space-between;
  align-items:center;
`

export const ConnectorAuthLogoWithName = styled.div`
  display:flex;
  flex-direction:row;
  align-items:center;
`

export const ConnectorAuthName = styled.p`
  font-size:1.25rem;
  margin-left:.5rem;
`

export const Logo = styled.img<{ size: string }>`
  height:${p => p.size}rem;
  width:${p => p.size}rem;
  padding: 3px;
  border: 1px solid #E4E0E5;
  border-radius:100%;
  z-index:1;
  :nth-child(n+2) {
    margin-left:-2rem;
    z-index:0
  }
`

export const Title = styled.h1`
  font-size:1.5rem;
`

export const Name = styled.p`
  margin:0;
  color:#AAA;
`

export const IntegrationContent = styled.div<{ canProceed?: boolean }>`
  display:flex;
  flex-direction:column;
  justify-content:${p => p.canProceed ? "space-around" : "start"};
  align-items:center;
  padding-top:${p => p.canProceed ? "0" : "2rem"}
`

export const StepWithName = styled.div`
  text-align:center;
`

export const LogoContainer = styled.div`
  display:flex;
  flex-direction:row;
`

export const ConfirmUninstall = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  background-color:#FFF;
  border:1px solid #E4E0E5;
  border-radius:1.25rem;  
  padding:3rem;
`
