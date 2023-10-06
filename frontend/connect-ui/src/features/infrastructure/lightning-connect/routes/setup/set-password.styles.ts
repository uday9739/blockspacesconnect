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