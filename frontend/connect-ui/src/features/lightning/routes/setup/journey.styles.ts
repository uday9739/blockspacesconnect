import styled from "styled-components";

export const StyledJourney = styled.div`
  display:flex;
  flex-direction:row;
  align-items: center;
  justify-content: center;
  position:relative;
  margin: 2.5rem 0;
`

export const Icon = styled.div`
  position:relative;
  border:1px solid #F4F4F4;
  margin: 0 1.3125rem;
  transform:rotate(45deg);
  svg {
    transform:rotate(-45deg);
    .fill-primary { fill:#323656 }
  }
  
`
export const Indicator = styled.div`
  width:.75rem;
  height:.75rem;
  margin-top:1.5rem;
  background:#333654;
  border-radius:100%;
`

export const Step = styled.div<{active:boolean}>`
  display:flex;
  flex-direction: column;
  align-items: center;
  ${p => !p.active && `
    ${Icon}{ opacity:.3 }
    ${Indicator}{ opacity: .1 }
  `};
`