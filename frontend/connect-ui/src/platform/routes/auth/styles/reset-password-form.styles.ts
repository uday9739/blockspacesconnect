import styled from 'styled-components'

const ResetPasswordForm = styled.form<{ visible:boolean }>`
  position:absolute;
  left:50%;
  top:50%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  width:42rem;
  max-width:calc(100% - 2.25rem);
  background:#FFFFFF;
  padding:  2.25rem 0 3.25rem;
  margin-top:-3.5rem;
  border: 1px solid #A9ACEB;
  box-shadow: 0px .0625rem 3rem rgba(88, 100, 229, 0.24);
  border-radius: .75rem;
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

export default ResetPasswordForm;

export const FormPrompt = styled.p`
  margin: 1.375rem 0 .5rem;
  font-size:1.25rem;
  text-align:center;
  line-height:1.875rem;
`

export const Inputs = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  margin: 1.25rem 0 .75rem;
  width:29rem;
`