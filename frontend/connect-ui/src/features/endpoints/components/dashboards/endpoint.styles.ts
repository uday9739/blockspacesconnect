import styled from 'styled-components'

export const StyledEndpoint = styled.div`
  order:1;
  display:flex;
  flex-direction:column;
  margin: 2rem 2.125rem;
`

export const EndpointTotals = styled.div`
  display:flex;
  margin: 2rem 0;
`

export const TestEndpoint = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  padding: 1.875rem 1.25rem 1rem;
  border:1px solid ${p => p.theme.lighterBlue};
  border-radius:1.5rem;
`

export const TestLabel = styled.label`
  position:absolute;
  top:0;
  padding:0 1.25rem;
  background:white;
  transform:translate(0, -50%);
  font-size:.875rem;
  letter-spacing:.07rem;
`

export const Test = styled.div`
  display:flex;
`

export const TestRequest = styled.textarea`
  flex:1;
  margin: 0 .5rem;
  font-family:'Roboto Mono', monospace;
  line-height:1.375rem;
  font-size:1rem;
  padding: 1rem;
  background:${p => p.theme.faintBlue};
  border:none;
  border-radius:1rem;
`

export const TestResponse = styled.code<{ empty:boolean }>`
  flex:1;
  height:100%;
  font-family:'Roboto Mono', monospace;
  margin: 0 .5rem;
  padding: 1rem;
  background:${p => p.theme.faintBlue};
  border-radius:1rem;
  ${p => p.empty && `
    display:flex;
    align-items:center;
    justify-content:center;
    font-style:italic;
    letter-spacing:.25rem;
    font-size:3rem;
    color:${p.theme.lighterBlue};
  `}
`