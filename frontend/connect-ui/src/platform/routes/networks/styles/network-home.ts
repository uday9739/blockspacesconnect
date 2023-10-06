import styled from 'styled-components'
export const NetworkHome = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  background:${props => props.theme.palette.background.default};
  max-width: 1536px;
  margin: auto;
  height:100%;
`

export const Header = styled.div`
  width:100%;
  margin-bottom:.5rem;
`

export const TopHeader = styled.div`
  display:flex;
  align-items: center;
  justify-content: center;
  height: 4rem;
  background:linear-gradient(90deg, #F3F3FD 2.18%, #F3F3FD00 32%, #F3F3FD00 62.79%, #F3F3FD 94.55%);
`

export const TopNavItem = styled.div`
  display:flex;
  align-items: center;
  justify-content: center;
  height:2.625rem;
  width:12rem;
  padding: .25rem 2.25rem .25rem 1.25rem;
  border:1px solid ${p => p.theme.lighterBlue}88;
  border-radius:1.5rem;
  color:${p => p.theme.bscBlue};
  transition: 125ms ease-out;
  /* cursor:pointer; */
  .fill-primary {
    fill:${p => p.theme.bscBlue};
  }
  &:first-of-type { margin-right:7rem }
  /* &:hover {
    background:${p => p.theme.faintBlue};
    border-color:${p => p.theme.bscBlue};
  } */
`

export const BottomHeader = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  height: 4.875rem;
  border-top:1px solid ${p => p.theme.lighterBlue};
  border-bottom:1px solid ${p => p.theme.lighterBlue};
`

export const AppNavigation = styled.div<{ side: 'left' | 'right' }>`
  flex:1;
  display:flex;
  align-items:center;
  justify-content: ${p => p.side === 'left' ? 'flex-end' : 'flex-start'};
`

export const AppHeaderNavItem = styled.div<{ gated?: boolean }>`
  display:flex;
  align-items: center;
  justify-content:center;
  padding: .25rem 1.125rem .25rem .625rem;
  margin: 0 .375rem;
  border:1px solid ${p => p.theme.faintBlue};
  border-radius:2rem;
  color:${p => p.theme.bscBlue};
  cursor:pointer;
  transition:125ms ease-out;
  span, svg { pointer-events:none }
  .fill-primary { fill:${p => p.theme.bscBlue}}
  ${p => p.gated ? `
    cursor:default;
    opacity:0;
    pointer-events:none;
  ` : `
    &:hover {
      background:${p.theme.bscBlue};
      color:${p.theme.white};
      .fill-primary { fill:${p.theme.white}}
    }
  `}
`

export const Networks = styled.div`
  position:relative;
  display:flex;
  justify-content:center;
  flex-wrap:wrap;
  &:last-of-type { margin-bottom:5rem }
`

export const NetworkTitle = styled.h2`
  position: relative;
  display:flex;
  width:53.25rem;
  margin: 2.4375rem 0 .875rem;
  align-items:center;
  justify-content:center;
  color:${p => p.theme.bscBlue};
  font-weight:400;
  font-size:1.125rem;
`

export const Network = styled.div`
  position:relative;
  width:16rem;
  height:17.25rem;
  margin: 1rem .5rem;
  cursor:pointer;
  transition:all 100ms ease-out;
  &:hover {
    width:16.5rem;
    height:18.25rem;
    margin: .375rem .25rem .625rem;
  }
`

export const AddNetwork = styled.button`
  position:absolute;
  display:flex;
  align-items: center;
  justify-content: center;
  right:0;
  padding: .125rem 1.5rem .25rem .625rem;
  background:white;
  border: 1px solid ${p => p.theme.lightBlue};
  border-radius:2.5rem;
  color:${p => p.theme.bscBlue};
  font-size:.9375rem;
  cursor:pointer;
  transition:125ms ease-out;
  .fill-primary {
    fill:${p => p.theme.bscBlue};
  }
  &:hover {
    background:${p => p.theme.faintBlue};
    border-color:${p => p.theme.bscBlue};
  }
`
