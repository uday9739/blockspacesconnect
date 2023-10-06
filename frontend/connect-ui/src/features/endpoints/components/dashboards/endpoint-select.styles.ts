import styled from 'styled-components'

export const StyledEndpointSelect = styled.div<{ noEndpoints: boolean }>`
  display:flex;
  justify-content:space-between;
  min-height:3.125rem;
  margin-top:.5rem;
  ${p => p.noEndpoints ? `
    order:0;
    margin-bottom:-4.75rem;
    background:white;
    z-index:1;
  ` : `
    order:1;
    border-bottom:1px solid ${p.theme.lighterBlue};
  `};
  padding: .25rem 0 0;
`

export const ActiveEndpoints = styled.div`
  display:flex;
  margin-left:2.125rem;
`

export const DeleteEndpoint = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  height:2rem;
  width:0;
  border:1px solid transparent;
  border-radius:100%;
  transition: margin 125ms ease-out;
  overflow:hidden;
  .fill-primary { fill:'#000000' }
  svg {
    min-width:2.125rem;
    opacity:0;
    cursor:pointer;
    transition:125ms ease-out;
  }

`

export const EndpointTab = styled.div<{ selected: boolean }>`
  display:flex;
  align-items:center;
  margin: 0 .0625rem;
  padding: 0 1.25rem 0 1.25rem;
  height:100%;
  background:${p => p.theme.white};
  border:1px solid ${p => p.theme.lighterBlue};
  border-bottom:none;
  border-top-right-radius:0.625rem;
  border-top-left-radius:0.625rem;
  /* transition:300ms ease-out; */
  ${p => p.selected ? `
    height:calc(100% + 1px);
    cursor:default;
    &:hover {
      padding-right:0;
      ${DeleteEndpoint}{
        width:2rem;
        margin:0 .75rem;
        border-color:${p.theme.faintBlue};
        &:hover {
          border-color:${p.theme.bscBlue};
        }
        .fill-primary { fill:${p.theme.bscBlue} }
        svg {
          opacity:.3;
          &:hover { opacity:1 }
        }
      }
    }
  ` : `
    opacity:.5;
    cursor:pointer;
    &:hover { opacity:1 }
  ` }
  z-index:1;
`

export const AddEndpointCopy = styled.span`
  flex:1;
  font-size:1.125rem;
  margin-left:1.5rem;
  color:${p => p.theme.bscHighlight};
`
export const AddEndpointButton = styled.span`
  display:flex;
  align-items:center;
  justify-content:center;
  width:12rem;
  height:3rem;
  margin: 0 .25rem;
  border:1px solid ${p => p.theme.bscHighlight}55;
  border-radius:1.5rem;
  color:${p => p.theme.bscHighlight};
  pointer-events:none;
  transition:125ms ease-out;
`

export const AddFirstEndpoint = styled.div<{ addingEndpoint: boolean }>`
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  height:4.375rem;
  margin: 1rem 1rem;
  padding: 0 .5rem;
  background:${p => p.theme.bscHighlight}11;
  border:1px solid ${p => p.theme.bscHighlight};
  border-radius:2.5rem;
  transition:125ms ease-out;
  cursor:pointer;
  ${p => p.addingEndpoint ? `
    cursor:default;
    ${AddEndpointButton}{
      background:${p.theme.bscHighlight};
      color:${p.theme.white};
    }
  `: `
    &:hover {
      box-shadow:${p.theme.highlightMediumBoxShadow};
      ${AddEndpointButton}{
        background:${p.theme.bscHighlight};
        color:${p.theme.white};
      }
    }
  `}

`