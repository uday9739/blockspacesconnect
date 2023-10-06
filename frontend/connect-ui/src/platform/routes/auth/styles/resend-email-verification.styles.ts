import styled from 'styled-components'

const ResendEmailVerification = styled.form<{ visible:boolean }>`
  position:absolute;
  left:50%;
  top:50%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  width:38rem;
  max-width:calc(100% - 2.25rem);
  background:#FFFFFF;
  padding:  2.25rem 0;
  margin-top:-3.5rem;
  border: 1px solid #A9ACEB;
  border-radius: .75rem;
  box-shadow: 0px .0625rem 3rem rgba(88, 100, 229, 0.24);
  opacity:0;
  transform:translate(-50%, -50%);
  transition: 
    margin 500ms 50ms ease-out,
    opacity 500ms 50ms ease-out;
  ${p => p.visible && `
    opacity:1;
    margin-top:-3rem;
  `}
`

export default ResendEmailVerification;


export const Email = styled.span`
  padding: 1rem 2.125rem;
  font-size:1.325rem;
  line-height:4rem;
  font-weight:600;
`

export const FormPrompt = styled.p`
  margin: 1.75rem 0 1.5rem;
  font-size:1.25rem;
  text-align:center;
  line-height:1.875rem;
`

export const SmallPrompt = styled.span`
  font-size:.9375rem;
  line-height:.9375rem;
  opacity:.7;
`

export const CheckWrap = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:9.5rem;
  height:9.5rem;
  margin: 1.5rem 0 .5rem;
  padding: .125rem;
  &:before {
    content:'';
    position:absolute;
    left:-1px;
    top:-1px;
    width:100%;
    height:100%;
    border: 1px dashed #37afed;
    border-radius:100%;
    animation-name:spinning-checkbox-border;
    animation-duration:12s;
    animation-timing-function:linear;
    animation-iteration-count:infinite;
  }
`

export const SuccessCheck = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  width:100%;
  height:100%;
  background: linear-gradient(90deg, #1DAFED 30%, #1D8AED 85%);
  border-radius:100%;
  box-shadow: 0px 2px 5px rgba(88, 100, 229, 0.8);
  .fill-primary { fill:#FFFFFF }
  svg {
    width:7rem;
    height:7rem;
  }
  animation-name:pulsing-success-check;
  animation-duration:4s;
  animation-iteration-count:infinite;
`
