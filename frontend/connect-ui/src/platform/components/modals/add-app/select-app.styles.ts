import styled from "styled-components";

export const Catalog = styled.div`
  display:flex;
  align-items: center;
  justify-content:center;
  flex-wrap:wrap;
  padding: 1.25rem 0 1.75rem;
  width:64rem;
  overflow:auto;
`
export const AppLogo = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content: center;
  width:5.25rem;
  height:5.25rem;
  padding: .25rem;
  border:2px solid ${p => p.theme.lighterBlue};
  border-radius:100%;
`

export const AppLogoBG = styled.span<{ background: string }>`
  position:relative;
  display:flex;
  align-items:center;
  justify-content: center;
  position:relative;
  width:100%;
  height:100%;
  background:${p => p.background};
  border-radius:100%;
  svg {
    width:70%;
    height:70%;
  }
`

export const ChainInitials = styled.div<{ installed: boolean, background: string, color: string } >`
  position:absolute;
  display:flex;
  align-items: center;
  justify-content: center;
  ${p => p.installed ? `
    top:-.3125rem;
    right:-.3125rem;
  ` : `
    bottom:-.1875rem;
    right:-.3125rem;
  `}
  width:2.125rem;
  height:2.125rem;
  background:${p => p.background};
  border:1px solid ${p => p.theme.white};
  border-radius:100%;
  color:${p => p.color};
  z-index:1;
`

export const IsInstalledCheck = styled.div<{ background: string, color: string }>`
  position:absolute;
  display:flex;
  align-items: center;
  justify-content: center;
  bottom:-.1875rem;
  right:0;
  height:1.3125rem;
  padding: 0 .375rem 0 .125rem;
  background:${p => p.background};
  border: 1px solid ${p => p.theme.faintBlue};
  box-shadow:${p => p.theme.slightBoxShadow};
  border-radius:.5rem;
  font-size:.6125rem;
  color:${p => p.color};
  z-index:2;
  .fill-primary{ fill:${p => p.color}}
`

export const AppName = styled.h6`
  margin-top:.375rem;
  text-align:center;
  font-weight:400;
  font-size:.7125rem;
  opacity:.8;
`

export const App = styled.div<{ installed: boolean, isFeatured?: boolean }>`
  position:relative;
  display:flex;
  order:0;
  flex-direction:column;
  align-items:center;
  justify-content: flex-start;
  width:7rem;
  height:8rem;
  margin: .25rem .3875rem 0;
  transition:125ms ease-out;
  cursor:pointer;
  ${x => x.isFeatured ? `
  padding:7px;
  border-radius: .75rem;
  border: 1px solid  #FFB800;
  ` : ``}
  ${p => p.installed ? `
    order:1;
    pointer-events:none;
    opacity:.45;
    ${AppName}{ opacity:1 }
    `: `
    &:hover {
      margin-top:0;
      ${AppLogo}{
        border-color:${p.theme.bscHighlight};
      }
      ${AppName}{ opacity:1 }
    }
  `}
`

export const Connector = styled.div<{ requested?: boolean, isFeatured?: boolean }>`
position:relative;
display:flex;
order:0;
flex-direction:column;
align-items:center;
justify-content: flex-start;
width:7rem;
height:8rem;
margin: .25rem .3875rem 0;
transition:125ms ease-out;
cursor:pointer;
${x => x.isFeatured ? `
padding:7px;
border-radius: .75rem;
border: 1px solid  #FFB800;
` : ``}
${p => p.requested ? `
  order:1;
  pointer-events:none;
  opacity:.45;
  ${AppName}{ opacity:1 }
  `: `
  &:hover {
    margin-top:0;
    ${AppLogo}{
      border-color:${p.theme.bscHighlight};
    }
    ${AppName}{ opacity:1 }
  }
`}
`
export const ConnectorLogo = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content: center;
  & img{
    width:5.25rem;
    height:5.25rem;
    padding: .25rem;
    border-radius: 50%;
  }
`

export const ConnectorName = styled.h6`
  margin-top:.375rem;
  text-align:center;
  font-weight:400;
  font-size:.7125rem;
  opacity:.8;
`

export const IsInterestedCheck = styled.div<{ background: string, color: string }>`
display:flex;
align-items: center;
justify-content: center;
bottom:-.1875rem;
right:0;
height:1.3125rem;
padding: 0 .375rem 0 .125rem;
background:${p => p.background};
border: 1px solid ${p => p.theme.faintBlue};
box-shadow:${p => p.theme.slightBoxShadow};
border-radius:.5rem;
font-size:.6125rem;
color:${p => p.color};
z-index:2;
.fill-primary{ fill:${p => p.color}}
`
