import styled from 'styled-components'

const Registration = styled.div`
  position:relative;
  display:flex;
  justify-content:center;
  align-items:center;
  height:100%;
  opacity:0;
  transition: all 500ms 50ms ease-out;
  &[data-loaded="true"]{
    margin: 0 auto;
    opacity:1
  }
`

export default Registration;

export const Form = styled.form`
  display: flex;
  flex-direction:column;
  width:56rem;
  padding: 2.5rem 1.5rem 1.75rem;
  background: #FFFFFF;
  border: 1px solid #A9ACEB;
  box-shadow: 0px 2px 57px rgba(88, 100, 229, 0.24);
  border-radius:.75rem;
`

export const Header = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  margin-bottom:1rem;
`

export const Section = styled.div`
  display:flex;
  width:100%;
  padding: .75rem 1rem;
`

export const Column = styled.div`
  position:relative;
  flex:1;
  display:flex;
  flex-direction:column;
  min-width:0;
`
export const Row = styled.div`
  position:relative;
  display:flex;
  width:100%;
`

export const TextInput = styled.input`
  flex:1;
  height:calc(100% - .5rem);
  color:#323656;
  margin: .25rem .375rem .25rem;
  padding: 0 1rem;
  background:#FFF;
  border:1px solid #E7EBFF;
  border-radius: 4px;
  outline:none;
  font-size:1.0625rem;
  transition:all 150ms ease-out;
  &[data-empty="true"]{
    background:#fcfcff;
    border:1px solid #b5b9ee;
  }
  &:hover {
    background:#FFF;
    border: 1px solid #5665E5AA;
  }
  &:focus {
    background:#FFF;
    border: 1px solid #5665E5;
    box-sizing: border-box;
    box-shadow: 0px 1px 3px rgba(86, 101, 229, 0.48);
  }
  &::placeholder {
    color: #abb2f2;
    font-size: 0.875rem;
    letter-spacing:1.7px;
  }
`

export const Submit = styled.button`
  width:100%;
  height:3.375rem;
  background:#FFF;
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

export const Success = styled.div`
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  width:22rem;
  padding: 0 1rem 1.125rem;
  background: #FFFFFF;
  border: 1px solid #A9ACEB;
  box-shadow: 0px 2px 57px rgba(88, 100, 229, 0.24);
  border-top-right-radius: 50px 40px;
  border-top-left-radius: 50px 40px;
  border-bottom-right-radius: 50px 40px;
  border-bottom-left-radius: 50px 40px;
`

export const SuccessTitle = styled.h2`
  width:100%;
  text-align:center;
  margin: 2.5rem 0 1.25rem;
  letter-spacing:1.2px;
  font-weight:600;
  font-size:1.3125rem;
`

export const SuccessText = styled.div`
  margin-bottom:1.5rem;
  font-size:1.125rem;
  line-height:1.875rem;
  text-align:center;
`

export const Continue = styled.button`
  width:100%;
  height:3.375rem;
  background:#FFF;
  border:1px solid #E7EBFF;
  border-radius:50px;
  box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
  font-size:.9375rem;
  letter-spacing:1.7px;
  color:#abb2f2;
  cursor:pointer;
  outline:none;
  transition: all 150ms ease-out;
  &:hover,
  &:focus {
    border:1px solid #5665E5;
    color:#5665E5;
  }
`

export const CheckWrap = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:9.5rem;
  height:9.5rem;
  margin: .5rem 0 1.5rem;
  padding: .125rem;
  &:before {
    content:'';
    position:absolute;
    left:-1px;
    top:-1px;
    width:100%;
    height:100%;
    border: 1px dashed #5665E5;
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
  background:#5665E5;
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