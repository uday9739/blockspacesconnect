import styled from 'styled-components'
const Header = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  width:100%;
  height:4.125rem;
  min-height:4.125rem;
  background: linear-gradient(90deg, #F3F3FD 0%, #FFFFFF 25%, #FFFFFF 75%, #F3F3FD 100%);
  border-bottom:1px solid #f0f0f5;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
`
export default Header

export const OptionsBar = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  position:absolute;
  left:0;
  width:100%;
  height:100%;
  padding: 0 .25rem;
  pointer-events:none;
  z-index:100;
`

export const Options = styled.div`
  display:flex;
  align-items:center;
  height:100%;
  pointer-events:all;
`

export const ToggleSidebar = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  width:2rem;
  height:calc(100% - .75rem);
  margin: 0 .125rem;
  border:1px solid #e9ebf8;
  border-radius:.5rem;
  cursor:pointer;
  transition:100ms ease-out;
  svg {
    pointer-events:none;
    min-width:130%;
    .fill-primary {
      transition:100ms ease-out;
      fill:#d4d6f8
    }
  }
  &:hover {
    border-color:#bdc2e4;
    svg {
      .fill-primary { fill:#303252 }
    }
  }
`

export const UserSettings = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  height:calc(100% - .75rem);
  margin: 0 .125rem;
  border:1px solid #e9ebf8;
  border-radius:.5rem;
  cursor:pointer;
  transition:100ms ease-out;
  &:hover {
    border-color:#bdc2e4;
  }
`

export const UserName = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  width:2.625rem;
  height:2.625rem;
  margin: 0 .5rem;
  background:#d5d6f8;
  border-radius:100%;
  font-weight:600;
`
export const DropdownDots = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  width:1.75rem;
  height:calc(100% - .5rem);
  border-left:1px solid #eeeffc;
  svg {
    max-height: 50%;
    .fill-primary {
      fill:#d5d6f8;
    }
  }
`

export const UserDropdown = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  position:absolute;
  top:-1px;
  right:-1px;
  width:16rem;
  background:#FFFFFF;
  border: 1px solid #696FE2;
  border-radius:.5rem;
  box-shadow: 0px 4px 4px rgba(105, 111, 226, 0.12);
  opacity:0;
  pointer-events:none;
  cursor:default;
  &[data-visible="true"]{
    opacity:1;
    pointer-events:all;
  }
`

export const DropdownUserName = styled.div`
  margin: .875rem 0 0;
  font-size:1.125rem;
  font-weight:600;
  letter-spacing:.0625rem;
`
export const UserSummary = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  height:7rem;
  margin-bottom:.5rem;
`
export const SummaryIcon = styled.div`
  position:relative;
  width:3.125rem;
  height:3.125rem;
  margin-top:1.5rem;
  border:1px solid #f9f9fd;
  border-radius:100%;
  transition:100ms ease-out;
  svg {
    width:100%;
    height:100%;
    transition:100ms ease-out;
    .fill-primary {
      fill:#e3e4f3;
    }
  }
`
export const SummaryLabel = styled.div`
  margin: .25rem 0 0;
  font-size:.625rem;
  text-align:center;
  opacity:.5;
  transition:100ms ease-out;
`
export const SummaryOption = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  width:4.25rem;
  cursor:pointer;
  transition:100ms ease-out;
  &:hover {
    ${SummaryIcon}{
      border:1px solid #30325288;
      .fill-primary {
        fill:#303252;
      }
    }
    ${SummaryLabel}{
      opacity:1;
    }
  }
`
export const UserBubble = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  width:5.125rem;
  height:5.125rem;
  margin: 0 .375rem;
  background:#F4F5FD;
  border-radius:100%;
  font-weight:600;
  font-size:1.5rem;
  letter-spacing:.0625rem;
`
export const UserOptions = styled.div`
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  width:100%;
`
export const UserOptionIcon = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  height:2rem;
  width:2rem;
  margin: 0 .5rem 0 .375rem;
  border:1px solid #f9f9fc;
  border-radius:100%;
  svg {
    min-width:120%;
    min-height:120%;
    .fill-primary {
      fill:#2F3252;
    }
  }
`
export const UserOptionLabel = styled.div`
  flex:1;
  font-size:.875rem;
  color:#323656;
`

export const UserOption = styled.a`
  display:flex;
  align-items:center;
  width:100%;
  height:2.5rem;
  border-top:1px solid #F9F9FD;
  cursor:pointer;
  text-decoration:none;
  &:visited {
    ${UserOptionLabel}{
      color:#323656;
    }
  }
  &:hover {
    ${UserOptionIcon}{
      border:1px solid #f4f5fd;
    }
    ${UserOptionLabel}{
      text-decoration:underline;
    }
  }
`

export const Navigation = styled.div`
  display:flex;
  justify-content:center;
  height:100%;
  width:100%;
  z-index:0;
`

export const NavItem = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  height:100%;
  margin: 0 .375rem;
  padding: 0 .5rem;
  font-size:.9375rem;
  font-weight:400;
  letter-spacing:1.8px;
  cursor:default;
  opacity:.2;

  &[data-nav-type="active"]{
    color:${props => props.theme.fontColor};
    opacity:1;
    &:after {
      content:'';
      position:absolute;
      width:100%;
      height:100%;
      top:0;
      left:0;
      background: linear-gradient(0, #696FE2 1%, rgba(184, 165, 240, 0.21) 4%, rgba(198, 165, 240, 0) 20%);
    }
  }
`

export const Body = styled.div`
  margin: 0 auto;
  padding: 1.75rem 10rem 2.25rem;
  border-top-right-radius:100%;
  border-top-left-radius:100%;
  z-index:1;
`

export const SectionTitle = styled.h4`
  display:none;
  text-align:center;
  letter-spacing: 1.8px;
  font-weight:400;
  font-size:.875rem;
  margin: -.5rem 0 3rem;
  color:#5864E533;
`

export const Title = styled.h1`
  position:relative;
  background:white;
  padding:1.125rem 4.5rem;
  border:1px solid #f4f6ff;
  border-radius:3.5rem;
  letter-spacing:1.125px;
  font-weight:600;
  font-size:1.4375rem;
  z-index:1;
`

export const NetworkLogoWrap = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  position:absolute;
  left:-2.25rem;
  top:-.875rem;
  background:#FFFFFF;
  min-width:5.75rem;
  max-width:5.75rem;
  min-height:5.75rem;
  max-height:5.75rem;
  border:1px solid #E7EBFF;
  border-right:1px solid transparent;
  border-radius:100%;
  pointer-events:none;
`

export const NetworkStatus = styled.div`
  position:absolute;
  left:calc(50% + .625rem);
  top:calc(50% + .6875rem);
  width:1.75rem;
  height:1.75rem;
  padding: .125rem;
  background:#FFFFFF;
  border:1px solid #E7EBFF;
  border-radius:100%;
  z-index:1;
`
export const Indicator = styled.div`
  background:#EDE7F3;
  width:100%;
  height:100%;
  border-radius:100%;
  pointer-events:none;
`

export const NetworkLogo = styled.img`
  position:relative;
  height:124%;
  width:124%;
  pointer-events:none;
`

export const ClickableTitle = styled.h1`
  position:relative;
  background:white;
  padding:1.125rem 4.5rem;
  border:1px solid #f4f6ff;
  border-radius:3.5rem;
  letter-spacing:1.125px;
  text-transform:uppercase;
  font-weight:600;
  font-size:1.4375rem;
  z-index:1;
  cursor:pointer;
  transition:all 100ms ease-out;
  &:hover {
    border-color:#8a93ee;
    ${NetworkLogoWrap}{
      border-color:#8a93ee;
      border-right:1px solid transparent;
    }
    svg {
      opacity:.7;
    }
  }
  svg {
    position:absolute;
    top:.75rem;
    right:.875rem;
    width:2.25rem;
    height:2.25rem;
    opacity:.3;
    transition:all 100ms ease-out;
  }

`