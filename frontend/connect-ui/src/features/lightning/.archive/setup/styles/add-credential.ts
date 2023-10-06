import styled from "styled-components";
const AddCredential = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
`
export default AddCredential

export const Form = styled.form`
  display:flex;
  flex-direction:column;
  width:28rem;
  background:#FFFFFF;
  padding: 2rem 2.5rem 1.5rem;
  border: 1px solid #DFD7E9;
  border-radius: 12px;
  box-shadow: 0px 2px 57px rgba(206, 173, 249, 0.24);
`

export const Title = styled.h4`
  margin-bottom:.75rem;
  text-align:center;
  letter-spacing:1.2px;
  font-size:1.3125rem;
  font-weight:600;
`

export const Subtitle = styled.p`
  margin-bottom:1.25rem;
  text-align:center;
  line-height:1.5rem;
  font-size:1.0625rem;
  letter-spacing:.4px;
`

export const Row = styled.div`
  display:flex;
  position:relative;
  height:3.25rem;
  width:100%;
  padding: 0 .5rem;
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
    display:flex;
    align-items:center;
    width:100%;
    height:100%;
    pointer-events:none;
    font-size:.875rem;
    letter-spacing:1.7px;
    color:#abb2f2;
  }
`

export const Submit = styled.button`
  width:100%;
  height:3rem;
  border-radius:50px;
  font-size:.9375rem;
  letter-spacing:1.7px;
  cursor:pointer;
  transition:all 100ms ease-out;
  box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
  background: linear-gradient(150deg, #8659E5 35%, #be19f7 100%);
  background-size: 300% 300%;
  animation: submitting-button 4s ease infinite;
  z-index:1;
  border:2px solid transparent;
  color:#FFFFFF;
  outline:none;
  &[data-submitting="true"]{
    cursor:default;
    box-shadow: none;
    &:hover {
      box-shadow:none;
    }
  }
  &:hover,
  &:focus {
    box-shadow: 0px 1px 12px #be19f777;
  }
`

export const Response = styled.div`
  display:flex;
  flex-direction:column;
  width:28rem;
  background:#FFFFFF;
  padding: 2rem 2.5rem 1.5rem;
  border: 1px solid #DFD7E9;
  border-radius: 12px;
  box-shadow: 0px 2px 57px rgba(206, 173, 249, 0.24);
`

export const GetMacaroon = styled.button`
  width:100%;
  height:3rem;
  border-radius:50px;
  font-size:.9375rem;
  letter-spacing:1.7px;
  cursor:pointer;
  transition:all 100ms ease-out;
  box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
  background: linear-gradient(150deg, #8659E5 35%, #be19f7 100%);
  background-size: 300% 300%;
  animation: submitting-button 4s ease infinite;
  z-index:1;
  border:2px solid transparent;
  color:#FFFFFF;
  outline:none;
  &:hover,
  &:focus {
    box-shadow: 0px 1px 12px #be19f777;
  }
`

export const GotIt = styled.button`
  flex:1;
  min-height:3rem;
  width:100%;
  margin: 1.25rem auto 0;
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
  &[disabled]{
    opacity:.3;
    cursor:default;
  }
`