import styled from "styled-components";

export const StyledIntro = styled.div`
  display:flex;
  flex-direction:column;
  position:relative;
  width:100%;
  background:#FFFFFF;
  box-shadow: 0px 0px 2.25rem #ECE7F1;
  border-radius: .875rem;
  padding: 1rem;
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

export const Steps = styled.div`
  display:flex;
  margin:2.75rem 0;
  width:100%;
  justify-content: center;
  align-items:center;
`

export const Step = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items: center;
  margin: 0 .25rem;
  width:8rem;

`

export const StepCount = styled.span`
  position:absolute;
  top:-.75rem;
  right:1.5rem;
  font-family: 'Roboto Mono';
  font-weight:400;
  font-size:.875rem;
`
export const StepIcon = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:4rem;
  height:4rem;
  border:1px solid #F4F4F4;
  transform:rotate(45deg);
  svg {
    transform:rotate(-45deg);
    width:140%;
    height:140%;
    .fill-primary { fill:#323656 }
  }
`
export const StepLabel = styled.span`
  margin-top:1.5rem;
  font-family: 'Roboto Mono';
  text-align:center;
  font-size:.9375rem;
  line-height:1.375rem;
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