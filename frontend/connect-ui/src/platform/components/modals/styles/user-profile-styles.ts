import styled from "styled-components";

const UserProfileStyles = styled.form`
  position:relative;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  width:52rem;
  padding: 2.125rem 2rem 2.75rem;
  background: #FFFFFF;
  border: 1px solid #A9ACEB;
  box-shadow: 0px 2px 57px rgba(88, 100, 229, 0.24);
  border-radius:.75rem;
  transition: all 500ms 50ms ease-out;
  &[data-loaded="true"]{
    margin: 0 auto;
    opacity:1
  }
`

export default UserProfileStyles

export const Header = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
`
export const Title = styled.h1`
  position:relative;
  display:flex;
  align-items:center;
  height:3.25rem;
  margin: 1.875rem 0 .875rem;
  border:1px solid #f3f5ff;
  border-radius:50px;
  padding: 0 3.5rem;
  font-weight:600;
  font-size:1.25rem;
  letter-spacing:2.25px;
  cursor:pointer;
  transition:all 100ms ease-out;
  &:hover {
    border:1px solid #5864E5;
    svg { opacity: 1 }
  }
  svg {
    position:absolute;
    transition:all 100ms ease-out;
    right:.4375rem;
    width:2.25rem;
    opacity:.2;
  }
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
  &:first-of-type { margin-right: 1.25rem }
  &:last-of-type { margin-right:0 }
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
    letter-spacing:.0625rem;
  }
  &[disabled]{
    background:#fcfcff;
    &:hover {
      border:1px solid #E7EBFF;
    }
  }
`

export const CancelChanges = styled.button`
  flex:1;
  height:3.25rem;
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

export const SaveChanges = styled.button`
  flex:2;
  height:3.25rem;
  margin-left:1.25rem;
  border-radius:50px;
  font-size:.9375rem;
  letter-spacing:1.7px;
  cursor:pointer;
  transition:all 100ms ease-out;
  box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
  background: linear-gradient(150deg, #8659E5 35%, #1D8AED 100%);
  background-size: 300% 300%;
  animation: submitting-button 4s ease infinite;
  border:2px solid transparent;
  color:#FFFFFF;
  outline:none;
  &[data-submitting="true"]{
    box-shadow:none;
  }
  &:hover,
  &:focus {
    box-shadow: 0px 1px 12px rgba(66, 0, 255, 0.55);
  }
  &[disabled]{
    opacity:.3;
    cursor:default;
    box-shadow:none;
  }
`