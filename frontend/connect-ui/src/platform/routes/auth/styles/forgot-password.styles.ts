import styled from 'styled-components'

const ForgotPassword = styled.form`
  display:flex;
  flex-direction:column;
  align-items:center;
  position:absolute;
  top:50%;
  left:50%;
  width:38rem;
  background:#FFF;
  margin: auto;
  padding: 2.5rem 0;
  border: 1px solid #A9ACEB;
  box-shadow: 0px .0625rem 3rem rgba(88, 100, 229, 0.24);
  border-radius: .75rem;
  z-index:10;
  transform:translate(-50%,-50%);
`

export default ForgotPassword;

export const FormTitle = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  height:4.25rem;
  margin: 2.75rem 0 0;
  padding: 0 4.75rem;
  border:1px solid #f3f5ff;
  border-radius:3rem;
  text-align:center;
  font-weight:600;
  letter-spacing:.0625rem;
  font-size:1.4375rem;
  cursor:pointer;
  &:hover {
    border-color:#e7ebff;
    svg {
      .fill-primary {
        fill:#ced7de;
      }
    }
  }
  svg {
    position:absolute;
    right:1rem;
    height:2.25rem;
    width:2.25rem;
    .fill-primary {
      fill:#e6ebee;
    }
  }
`

export const FormPrompt = styled.p`
  margin: 1.5rem;
  font-size:1.25rem;
`

export const FormInputs = styled.div`
  position:relative;
  width:26rem;
`

export const ResetPassword = styled.button`
  display:flex;
  align-items:center;
  justify-content:center;
  height:4.25rem;
  width:26rem;
  margin: .75rem 0 3.125rem;
  background: linear-gradient(90deg, #1DAFED 30%, #1D8AED 85%);
  box-shadow: 0px .0625rem .75rem rgba(29, 175, 237, 0.25);
  border:none;
  border-radius: 2rem;
  color:white;
  font-weight:300;
  font-size:1.0625rem;
  letter-spacing:.0625rem;
  cursor:pointer;
  transition:100ms ease-out;
  outline:none;
  &:focus,
  &:hover {
    border:2px solid #015fcc;
    box-shadow: none;
  }
  &:disabled{
    cursor:default;
    border:none;
    opacity:.7;
  }
`

export const CheckWrap = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:9.5rem;
  height:9.5rem;
  margin: 1.5rem 0 0rem;
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

export const ReturnToLogin = styled.button`
  width:26rem;
  height:4.125rem;
  background:#FFF;
  margin: 0 0 2.25rem;
  border:1px solid #E7EBFF;
  border-radius:50px;
  box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
  font-size:.9375rem;
  letter-spacing:1.7px;
  color:#abb2f2;
  cursor:pointer;
  outline:none;
  transition: all 150ms ease-out;
  &[data-submitting="true"]{
    background: linear-gradient(150deg, #5864E5 35%, #8659E5 100%);
    background-size: 300% 300%;
    animation: submitting-button 4s ease infinite;
    border:1px solid #5864E5;
    box-shadow:none;
    color:white !important;
    cursor:default;
  }
  &:hover,
  &:focus {
    border:1px solid #5665E5;
    color:#5665E5;
  }
`

