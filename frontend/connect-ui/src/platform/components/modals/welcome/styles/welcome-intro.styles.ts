import styled from "styled-components";

const WelcomeIntro = styled.div<{ visible:boolean }>`
  position:absolute;
  left:50%;
  top:50%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  width:56rem;
  max-width:calc(100% - 2.25rem);
  background:#FFFFFF;
  padding: 3.75rem 0 3rem;
  margin-top:-3.5rem;
  border: 1px solid #A9ACEB;
  box-shadow: 0px .0625rem 3rem rgba(88, 100, 229, 0.24);
  border-radius: .75rem;
  opacity:0;
  transform:translate(-50%, -50%);
  overflow:hidden;
  transition: 
    margin 500ms 50ms ease-out,
    opacity 500ms 50ms ease-out;
  ${p => p.visible && `
    opacity:1;
    margin-top:-3rem;
  `}
`

export default WelcomeIntro

export const Subtitle = styled.p`
  margin:1.125rem 0 1.25rem;
  font-size:1.4375rem;
  text-align:center;
  line-height:2.375rem;
`

export const ButtonWrap = styled.div`
  position:absolute;
  bottom:0;
  left:-1px;
  display:flex;
  align-items:flex-start;
  justify-content: center;
  width:calc(100% + 2px);
  height:4rem;
  background:#FFFFFF;
  z-index:1;
  &:before {
    content:'';
    position:absolute;
    top:-7rem;
    left:-20%;
    height:7rem;
    width:140%;
    background:#FFFFFF;
    border-top:1px solid #C4C4C4;
    border-left:1px solid #C4C4C4;
    border-right:1px solid #C4C4C4;
    border-top-right-radius:100%;
    border-top-left-radius:100%;
  }
`