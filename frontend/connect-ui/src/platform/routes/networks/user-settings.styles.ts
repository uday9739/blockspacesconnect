import styled from 'styled-components'

export const StyledUserSettings = styled.div`
  position:relative;
  width:12rem;
  height:2.625rem;
  margin-right:8rem;
`

export const UserSettingsDisplay = styled.div`
  display:flex;
  align-items: center;
  justify-content: center;
  height:100%;
  width:100%;
  padding: .25rem 2.25rem .25rem 1.25rem;
  border:1px solid ${p => p.theme.lighterBlue}88;
  border-radius:1.5rem;
  color:${p => p.theme.bscBlue};
  transition: 125ms ease-out;
  cursor:pointer;
  .fill-primary {
    fill:${p => p.theme.bscBlue};
  }
  &:hover {
    background:${p => p.theme.faintBlue};
    border-color:${p => p.theme.bscBlue};
  }
`


export const UserDropdown = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  position:absolute;
  top:0;
  left:50%;
  width:16rem;
  background:#FFFFFF;
  border: 1px solid #696FE2;
  border-radius:.5rem;
  box-shadow: 0px 4px 4px rgba(105, 111, 226, 0.12);
  transform:translate(-50%, 0);
  z-index:10000;
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
    ${ SummaryIcon }{
      border:1px solid #30325288;
      .fill-primary {
        fill:#303252;
      }
    }
    ${ SummaryLabel }{
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
    ${ UserOptionLabel }{
      color:#323656;
    }
  }
  &:hover {
    ${ UserOptionIcon }{
      border:1px solid #f4f5fd;
    }
    ${ UserOptionLabel }{
      text-decoration:underline;
    }
  }
`