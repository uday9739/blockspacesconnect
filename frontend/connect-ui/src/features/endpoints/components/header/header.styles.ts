import styled from 'styled-components'

export const StyledHeader = styled.div`
  width:100%;
  border-bottom:1px solid ${p => p.theme.lighterBlue};
`

export const PlatformNavigation = styled.div`
  display:flex;
  height:3.75rem;
  background: linear-gradient(270deg, #FBFCFF 20%, #FEFEFF 50%, #FBFCFF 80%);
  border-top-left-radius:1.875rem;
  border-top-right-radius:1.875rem;
`

export const NavOptions = styled.div<{ side:'left' | 'right'}>`
  display:flex;
  align-items:center;
  flex:1;
  padding: 0 1.25rem;
  ${p => p.side === 'left' ? `
    justify-content:flex-start;
  ` : `
    justify-content:flex-end;
  `}
`



export const AppUtilities = styled.div`
  position:relative;
  display:flex;
  justify-content:space-between;
  height:3.125rem;
  padding: 0 1.25rem;
  border-top:1px solid ${p => p.theme.lighterBlue};
  .header-curved-border {
    position:absolute;
    width:13.5rem;
    height:2.25rem;
    left:50%;
    transform:translate(-50%,-100%);
  }
`

export const AppLink = styled.a`
  display:flex;
  align-items:center;
  align-self:center;
  color:black;
  text-decoration:none;
  border:1px solid ${p => p.theme.lighterBlue};
  height:2.25rem;
  margin: 0 .1875rem;
  padding: 0 3.25rem;
  border-radius:1.125rem;
  font-size:.9375rem;
  cursor:pointer;
  transition:125ms ease-out;
  &:hover {
    color:${p => p.theme.bscBlue};
    border:1px solid ${p => p.theme.bscBlue};
    background:${p => p.theme.bscBlue}05;
  }
`

export const LogoWrap = styled.div`
  position:absolute;
  width:7.5rem;
  height:7.5rem;
  left:50%;
  padding: .25rem;
  background:${p => p.theme.white};
  border:1px solid ${p => p.theme.lighterBlue};
  border-radius:100%;
  transform:translate(-50%, -65%);
  z-index:1;
`

export const ChainInitials = styled.div<{ background:string, color:string } >`
  position:absolute;
  display:flex;
  align-items: center;
  justify-content: center;
  bottom:0rem;
  right:0.125rem;
  width:2.4375rem;
  height:2.4375rem;
  background:${p => p.background};
  border:2px solid ${p => p.theme.white};
  border-radius:100%;
  box-shadow: ${p => p.theme.slightBoxShadow};
  color:${p => p.color};
  font-size:1.125rem;
  z-index:1;
`

export const LogoBG = styled.div<{ background:string }>`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  height:100%;
  background:${p => p.background};
  border-radius:100%;
  svg {
    height:4.4375rem;
    width:4.4375rem;
  }
`

export const AppLogo = styled.img`
  width:100%;
  height:100%;
`

export const AppMain = styled.div`
  display:flex;
  height:6.25rem;
  border-top:1px solid ${p => p.theme.faintBlue};
`

export const AppModule = styled.div`
  display:flex;
  position:relative;
  width:16.5625rem;
  padding: .5rem .5rem;
  justify-content:center;
  align-items:center;
`

export const TXTotalModule = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
  align-items: center;
  justify-content:center;
  border-radius:.75rem;
`

export const TXTotalLabel = styled.label`
  margin: 0 0 .375rem 0;
  letter-spacing:.05rem;
  font-weight:400;
  font-size:.8125rem;
  opacity:.5;
`

export const TXTotalCount = styled.h5`
  font-family:'Roboto Mono', monospace;
  font-weight:800;
  font-size:1.1875rem;
`

export const PlanEditBox = styled.div`
  position:absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  right: 0.25rem;
  top: 0.25rem;
  height:calc(100% - .5rem);
  width:0;
  background:${p => p.theme.faintBlue};
  overflow:hidden;
  transition: 100ms ease-out;
  svg {width:2rem}
  .fill-primary { fill:${p => p.theme.bscBlue }55}
`

export const PlanModule = styled.div`
  position:relative;
  flex:1;
  width:100%;
  display:flex;
  align-items: center;
  justify-content:center;
  border-radius:.75rem;
  transition:100ms ease-out;
  cursor:pointer;
  &:hover {
    box-shadow:${p => p.theme.mediumBoxShadow};
    padding-right:2rem;
    ${PlanEditBox}{
      width:2rem;
    }
  }
`

export const PlanIcons = styled.div`
  position: relative;
  width:2.5rem;
  height:2.5rem;
  margin-right:.5rem;
`

export const PlanStatus = styled.div<{ background:string}>`
  display:flex;
  align-items: center;
  justify-content: center;
  width:100%;
  height:100%;
  background:${p => p.background};
  border-radius:100%;
  .fill-primary { fill: ${p => p.theme.white }}
`

export const PlanTXDetail = styled.div<{ networkColor:string }>`
  position:absolute;
  right: -.3125rem;
  bottom:-.3125rem;
  display:flex;
  align-items: center;
  justify-content: center;
  width:1.5rem;
  height:1.5rem;
  background:${p => p.theme.white};
  border:1px solid ${p => p.networkColor};
  border-radius:100%;
  svg {
    min-width:1.75rem;
    min-height:1.75rem;
  }
  .fill-primary { fill: ${p => p.networkColor }}
`

export const PlanDetails = styled.div`
  display:flex;
  flex-direction: column;

`

export const PlanName = styled.div`
  font-size:1.125rem;
  margin: .25rem 0;
`

export const TXDetail = styled.div`
  font-size:.875rem;
`

export const AppName = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
`
export const Name = styled.h1`
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:1.625rem;
  font-weight:600;
`

export const DividerBar = styled.span`
  position:relative;
  width:100%;
  height:1.125rem;
  border:1px solid ${p => p.theme.lighterBlue};
  border-bottom:none;
  border-top-right-radius:.25rem;
  border-top-left-radius:.25rem;
  &:before {
    content:'';
    position:absolute;
    top:calc(50% - 1px);
    width:100%;
    height:1px;
    background:${p => p.theme.lighterBlue};
  }
`

// export const AppNavigation = styled.div`
//   display:flex;
//   height:.875rem;
//   border-top:1px solid ${p => p.theme.lighterBlue};
// `