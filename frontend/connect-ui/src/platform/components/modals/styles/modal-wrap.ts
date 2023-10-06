import styled from 'styled-components'

export const ModalWrap = styled.div`
  position:fixed;
  display:flex;
  justify-content:center;
  align-items:center;
  left:0;
  top:0;
  width:100%;
  height:100%;
  background:${props => props.theme.white}D8;
  z-index:1000000;
  overflow:auto;
`