import styled from "styled-components"

export const StyledMarqueeModal = styled.div<{
    padding:number
    margin:string
  }>`
  position:relative;
  width:53rem;
  max-width:calc(100% - 2.25rem);
  margin: ${p => p.margin};
  padding: ${p => `${p.padding}rem ${p.padding - .5}rem`};
`

export const MarqueeText = styled.span`
  font-family: 'Roboto Mono';
  font-size:.875rem;
  letter-spacing:.25rem;
  opacity:.2;
`