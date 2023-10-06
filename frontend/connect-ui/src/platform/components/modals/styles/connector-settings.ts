import styled from 'styled-components'

export const ModalWrap = styled.div`
  position:fixed;
  display:flex;
  justify-content:center;
  align-items:flex-start;
  left:0;
  top:0;
  width:100%;
  height:100%;
  padding-top:10%;
  background:${props => props.theme.primaryBG}AA;
  z-index:10000000000;
`

export const ConnectorSettings = styled.div`
  display:flex;
  width:48rem;
  background:${props => props.theme.palette.background.default};
  border: 1px solid ${props => props.theme.heavyBorder};
  border-radius:8px;
`

export const ConnectorDetails = styled.div`
  flex:4;
  display:flex;
  flex-direction:column;
  align-items:center;
  padding: 1.5rem 0 3rem;
  border-right:1px solid ${props => props.theme.lightBorder};
`

export const ConnectorLogoWrap = styled.div`
  position:relative;
  width:70%;
`
export const ConnectorLogo = styled.img`
  position:relative;
  object-fit:contain;
  width:100%;
  height:100%;
`

export const ConnectorDescription = styled.p`
  padding: 0 1rem;
  text-align:center;
  line-height:1.5rem;
`

export const CredentialsSettings = styled.div`
  flex:5;
  display:flex;
  flex-direction:column;
  padding: 1rem 1.25rem;
`

export const ListHeader = styled.div`
  display:flex;
  align-items:center;
  height:2rem;
  margin-bottom:.5rem;
`
export const ListTitle = styled.div`
  padding: 0 .75rem;
  font-weight:500;
`

export const CredentialList = styled.div``
export const Credential = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  height:2.5rem;
  margin: .375rem 0;
  padding: 0 .75rem;
  border:1px solid ${props => props.theme.lightBorder};
  border-bottom-left-radius:8px;
  border-top-right-radius:8px;
  font-size:.875rem;
`

export const CredentialListOptions = styled.div`
  display:flex;
  margin-top:.25rem;
  padding: 0 0 .5rem;
`
export const CredentialListOption = styled.button`
  height:2.25rem;
  padding: 0 .25rem;
  color:${props => props.theme.fontColor};
  background:${props => props.theme.secondaryComponentBG};
  border:1px solid ${props => props.theme.heavyBorder};
  border-radius:4px;
  cursor:pointer;
  [data-is-saving="true"] & {
    pointer-events:none;
    opacity:.2;
  }
  &:hover {
    background:${props => props.theme.highlightBG };
    border-color:${props => props.theme.highlightBorder };
  }
`

export const Labels = styled.div`
  display:flex;
  align-items:center;
  height:1.75rem;
  padding: 0 .75rem;
  border-top:1px solid ${props => props.theme.lightBorder};
  border-bottom:1px solid ${props => props.theme.lightBorder};
`
export const Label = styled.div`
  flex:3;
  font-size:.75rem;
  &:last-of-type {
    flex:2;
  }
`
export const Key = styled.div`
  flex:3;
`
export const Environment = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  flex:2;
  height:100%;
  &:before {
    content:'';
    position:absolute;
    left:-1.125rem;
    top:-1px;
    width:1px;
    height:calc(100% + 2px);
    background:${props => props.theme.lightBorder};
    transform:rotate(-18deg);
  }
`

export const EditIcon = styled.div`
  position:absolute;
  right:.25rem;
  height:80%;
  opacity:.2;
  cursor:pointer;
  &:hover {
    opacity:.8;
  }
`