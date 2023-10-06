import styled from "styled-components";

export const StyledRecoveryConfirm = styled.div`
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

export const PhraseAnswer = styled.div`
  display:flex;
  flex-wrap:wrap;
  width:32rem;
  margin: 1rem auto;
`

export const PhraseEntry = styled.div`
  display:flex;
  flex-wrap:wrap;
  width:32rem;
  height:8rem;
  background:#f8f6fa55;
  margin: 0 auto;
`

export const Code = styled.span`
  text-align:center;
  line-height:2rem;
  width:16.66%;
  font-family:'Roboto Mono';
  font-size:.9375rem;
  cursor:default;
  user-select:none;
`

export const CodeAnswer = styled.span`
  text-align:center;
  line-height:2rem;
  width:16.66%;
  font-family:'Roboto Mono';
  font-size:.9375rem;
  user-select:none;
  background:#f8f6fa;
  &:hover {
    text-decoration:underline;
    cursor:pointer;
    background:#7b1af7;
    color:#FFFFFF;
  }
`

export const CodeOption = styled.span`
  display:flex;
  align-items: center;
  justify-content: center;
  text-align:center;
  line-height:1.875rem;
  width:16%;
  background:#f8f6fa;
  margin: .33%;
  font-family:'Roboto Mono';
  font-size:.9375rem;
  user-select:none;
  &:hover {
    cursor:pointer;
    background:#7b1af7;
    color:#FFFFFF;
  }
`

export const ConfirmText = styled.div`
  display:flex;
  width:100%;
  height:100%;
  align-items: center;
  justify-content: center;
  font-family:'Roboto Mono';
  font-size:1.875rem;
  font-weight:400;
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
export const Buttons = styled.div`
  display:flex;
  justify-content: center;
  align-items:center;
  margin: 2.25rem 0 3.75rem;
`