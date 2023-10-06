import styled from "styled-components";

export const StyledSetPassword = styled.div`
  display:flex;
  flex-direction:column;
  position:relative;
  width:100%;
  background:#FFFFFF;
  box-shadow: 0px 0px 2.25rem #ECE7F1;
  border-radius: .875rem;
`
export const WarningBox = styled.div`
  display:flex;
  flex-direction:column;
  margin:auto;
  width:85%;
  background:#FFFFFF;
  border-radius: .875rem;
  text-align:center;
  padding-top:1rem;
  align-items:center;
  gap:0.5rem;
`
export const WarningBOX = styled.div`
  background:${p => p.theme.bscHighlight}11;
  border:1px solid ${p => p.theme.bscHighlight};
  font-size:1.125rem;
  margin:1.5rem;
  color:${p => p.theme.bscHighlight};
  color:black;
  border-radius:1.875rem;
  display:flex;
  flex-direction:column;
  padding:1rem 1rem;
  align-items:center;
`
export const WarningMessage = styled.p`
  padding:none;
  width: 8rem;
  margin:auto;
  font-size:1.2rem;
  font-weight:bold;
`
export const WarningCheck = styled.span`
  display:flex;
  flex-direction:row;
  gap: 0.5rem;
  margin:auto;
  height:3rem;
  align-items:center;
`

export const Title = styled.h2`
  width:100%;
  margin:3.25rem 0 1.5rem;
  text-align:center;
  font-family:'Roboto Mono';
  font-weight:400;
  font-size:1.75rem;
`

export const Copy = styled.p`
  width:100%;
  max-width:calc(100% - 2.25rem);
  margin: 0 auto;
  text-align:center;
  line-height:1.875rem;
  font-size:1.125rem;
  letter-spacing:.05rem;
`

export const StepButton = styled.button<{
    margin?:string; 
    width?:string;
  }>`
  margin:${p => p.margin ? p.margin : `0`};
  width:${p => p.width ? p.width : 'auto' };
  height:3.125rem;
  background:#FFFFFF;
  border:1px solid #E7E7EE;
  border-radius:2rem;
  font-family:'Roboto Mono';
  font-size:1rem;
  transition:100ms ease-out;
  &:disabled { pointer-events:none }
  &:hover {
    cursor:pointer;
    border:1px solid #7b1af7;
    color:#7b1af7;
  }
`

export const SetPasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
`