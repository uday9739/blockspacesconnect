import styled from 'styled-components'
const AddNetwork = styled.div`
  flex:1;
  display:flex;
  flex-direction:row;
  align-items:flex-start;
  justify-content:center;
  background:${props => props.theme.palette.background.default};
  width:100%;
  height:100%;
  padding-top:4rem;
`
export default AddNetwork

export const Logo = styled.img`
  width:68%;
  transition:width 0ms ease-out;
`
export const Description = styled.p`
  flex:1;
  overflow:hidden;
  line-height:1.375rem;
  margin: .375rem 0 .25rem;
  padding: 0 1.5rem;
  text-align:center;
  font-size:1rem;
  opacity:0;
  transition:none;
`

export const UseCase = styled.div`
  padding: .375rem .75rem;
  margin: 0 .125rem;
  border:1px solid #F1F4FF;
  border-radius:16px;
  font-size:.75rem;
  color:#32365655;
`

export const Network = styled.div<{ connected:boolean }>`
  display:flex;
  flex-direction:column;
  align-items:center;
  width:18rem;
  height:20.5rem;
  margin: 1rem .5rem;
  background: #FFFFFF;
  border: 1px solid #D8DCF0;
  box-sizing: border-box;
  box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
  border-radius: 12px;
  cursor:default;
  transition:all 100ms ease-out;
  &:hover {
    width:18.5rem;
    height:21.5rem;
    margin: .375rem .25rem .625rem;
    box-shadow: 0px 1px 3px rgba(86, 101, 229, 0.48);
    ${Logo} {
      width:58%;
    }
    ${Description} {
      opacity:1;
      transition:all 100ms ease-out;
    }
  }
  ${p => !p.connected && `
    &:hover {
      width:18.5rem;
      height:21.5rem;
      box-shadow: 0px 1px 3px rgba(86, 101, 229, 0.48);
      ${Logo} {
        width:58%;
      }
      ${Description} {
        opacity:1;
        transition:all 100ms ease-out;
      }
      ${UseCase} {
        border-color:#5864E566;
        color:#5864E5AA;
      }
    }
  `}
`

export const Divider = styled.div`
  position:absolute;
  top:0;
  height:50px;
  width:100%;
  border-top: 1px solid #F1F4FF;
  border-radius:100%;
  pointer-events:none;
`

export const Name = styled.h5`
  position:relative;
  width:100%;
  padding-top:1.75rem;
  text-align:center;
  font-size:1.25rem;
  font-weight:500;
  letter-spacing:.3px;
`

export const UseCases = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  margin: 0 0 1.125rem;
`


