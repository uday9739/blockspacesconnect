import styled from 'styled-components'

export const StyledFlowStepper = styled.div`
  position:relative;
  display:flex;
  align-items: center;
  height:2.75rem;
  min-height:2.75rem;
  padding: 0 .75rem;
  background:${p => p.theme.faintBlue};
  border-bottom:1px solid ${p => p.theme.lightBlue};
`

export const FlowIcon = styled.div`
  margin: 0 .5rem;
  .fill-primary{
    fill:${p => p.theme.bscBlue}50;
  }
`

export const CloseModal = styled.div`
  position:absolute;
  right: 0.5rem;
  cursor:pointer;
  opacity:.35;
  &:hover {
    opacity:1;
  }
  svg {
    width:2.25rem;
    height:2.25rem;
  }
  .fill-primary{
    fill:${p => p.theme.bscBlue};
  }
`

export const FlowStep = styled.div<{ selected:boolean, complete:boolean }>`
  display:flex;
  align-items: center;
  justify-content:center;
  height:2.125rem;
  margin-right:.25rem;
  padding: 0 .875rem 0 0;
  border-radius:.25rem;
  font-size:.875rem;
  color:${p => p.theme.bscBlue};
  .fill-primary { fill:${p => p.theme.bscBlue} }
  cursor:default;
  ${p => p.selected ? `
    background:${p.theme.white};
    border:1px solid ${p.theme.bscBlue};
  ` : p.complete ? `
      background:${p.theme.white};
      border:1px dashed ${p.theme.bscBlue};
      opacity:.4;
      cursor:pointer;
      transition:125ms ease-out;
      &:hover {
        border-style:solid;
        opacity:.8;
      }
    ` : `
      border:1px solid ${p.theme.bscBlue}55;
      opacity:.3;
  `}
`

export const FlowStepIcon = styled.div`
  height:1.625rem;
  width:1.625rem;
  margin: 0 .125rem 0 .3125rem;
  svg {
    width:100%;
    height:100%;
  }
`

export const StepperMarquee = styled.div`
  display:flex;
  align-items: center;
  height:2.125rem;
  min-height:2.125rem;
  background:${p => p.theme.faintBlue};
  border-bottom:1px solid ${p => p.theme.lighterBlue};
`

export const MarqueeText = styled.span`
  color:${p => p.theme.bscBlue}70;
  font-family:'Roboto Mono', monospace;
  font-size:.75rem;
  letter-spacing:.07rem;
`