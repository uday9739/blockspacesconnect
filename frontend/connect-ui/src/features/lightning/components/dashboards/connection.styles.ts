import styled from 'styled-components'

export const StyledConnection = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  padding: 1rem 2rem 1rem 2rem;
  position:relative;
  border:1px solid #E4E0E5;
  border-radius:1.25rem;
  margin:15px;
  width:205px;
  justify-content: space-between;
`
export const StyledConnectionLegacy = styled.div`
  display:flex;
  flex-direction:row;
  align-items:center;
  padding: 0 2rem;
  position:relative;
  border:1px solid #E4E0E5;
  border-radius:1.25rem;
  height:8rem;
  margin-bottom:10px;
`

export const Background = styled.img`
  position:absolute;
  width:100%;
  left:0;
  top:0;
`

export const Name = styled.h6`
 margin:auto;
 text-align: center;
  font-size:1.3125rem;
  letter-spacing:.05rem;
  z-index:1;
`

export const Logo = styled.img`
  height:5.5rem;
  width:5.5rem;
  padding: 3px;
  border: 1px solid #E4E0E5;
  border-radius:100%;
  z-index:1;
  :nth-child(n+2) {
    margin-left:-2rem;
    z-index:0
  }
`

export const Button = styled.button`
  position:absolute;
  top:2.5rem;
  right:2rem;
  cursor:pointer;
  padding:.75rem 2rem;
  background-color:#FFFFFF;
  border: 1px solid #E4E0E5;
  border-radius:2rem;
  &:hover {
    border:1px solid #BE19F7;
    color:#BE19F7;
  }
`

export const ToggleWrap = styled.div`
  position:absolute;
  bottom:1.125rem;
  display:flex;
  align-items:center;
  justify-content:center;
  width: 100%;
  height: 3rem;
  z-index:1;
`

export const Toggle = styled.div`
  display:flex;
  align-items: center;
`

export const Track = styled.div<{ background: string, active: boolean }>`
  position:relative;
  width:3.5rem;
  height:1.8125rem;
  margin: 0 .875rem;
  border-radius:1rem;
  transition:75ms ease-out;
  cursor:pointer;
  ${p => p.active ? `
    background:${p.background};
    &:hover { 
      box-shadow: 0px 2px 6px ${p.background}33;
    }
  ` : `
    background:#f6f1f6;
    &:hover { 
      background:${p.background}33;
    }
  `}
`

export const Nub = styled.div<{ right?: boolean }>`
  position:absolute;
  top:-.125rem;
  height:2rem;
  width:2rem;
  background:white;
  border:1px solid #D8DCF0;
  border-radius: 100%;
  transition:all 150ms ease-out;
  ${p => p.right ? `
    left:calc(100% + .0625rem);
    transform:translate(-100%, 0);
    ` : `
    left:-.0625rem;
  `}
`