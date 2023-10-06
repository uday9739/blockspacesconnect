import styled from "styled-components";

export const AppLauncherIcon = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:7.5rem;
  height:7.5rem;
  border: 1px solid ${p => p.theme.lightBlue};
  border-radius:1.5rem;
`

export const AppLauncherIconBG = styled.div<{ bgColor: string }>`
  position:relative;
  display:flex;
  align-items: center;
  justify-content: center;
  width:64%;
  height:64%;
  margin-bottom:1rem;
  background:${p => p.bgColor};
  border-radius:.625rem;
  z-index:1;
  transform:rotate(45deg);
`

export const ChainInitials = styled.div<{ background: string, color: string } >`
  position:absolute;
  display:flex;
  align-items: center;
  justify-content: center;
  bottom:1.3125rem;
  right:-1.125rem;
  width:2.125rem;
  height:2.125rem;
  background:${p => p.background};
  border:1px solid ${p => p.theme.white};
  border-radius:100%;
  color:${p => p.color};
  z-index:1;
  transform:rotate(-45deg);
`

export const AppName = styled.h6`
  display:flex;
  align-items:center;
  justify-content: center;
  width:100%;
  margin-top:.75rem;
  text-align:center;
  line-height:1.25rem;
  font-weight:400;
  font-size:.9375rem;
  opacity:.75;
`

export const StyledAppLauncher = styled.div<{ empty: boolean }>`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  width:7.5rem;
  margin: 1.125rem .8125rem .5rem;
  transition:200ms ease-out;
  ${p => !p.empty && `
    cursor:pointer;
    &:hover {
      margin-top:1rem;
      ${AppLauncherIcon}{
        box-shadow:${p.theme.mediumBoxShadow};
      }
      ${AppName} {
        opacity:1;
      }
    }
  `}
`