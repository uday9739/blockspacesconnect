import styled from 'styled-components'

const LogInForm = styled.form<{ visible:boolean }>`
  position:relative;
  margin: 0 auto;
  top: 25%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  width:34rem;
  max-width:calc(100% - 2.25rem);
  background:#FFFFFF;
  padding:  0 0 2.25rem;
  margin-top:-3.5rem;
  border: 1px solid #A9ACEB;
  box-shadow: 0px .0625rem 3rem rgba(88, 100, 229, 0.24);
  border-radius: .75rem;
  ${p => p.visible && `
    opacity:1;
    margin-top:-3rem;
  `}
`

export default LogInForm;

export const Inputs = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  margin: 1rem 0;
  padding: 0 2.125rem;
  width:100%;
`

export const Links = styled.div`
  position:absolute;
  bottom:0;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  width:100%;
  transform:translate(0, 120%);
`
export const LinkText = styled.a`
  letter-spacing:.0625rem;
  line-height:2.25rem;
  font-size:1rem;
  color:#5864e5;
  opacity:.5;
  transition: 100ms ease-out;
  &:hover,
  &:focus {
    opacity:.7;
    text-decoration:underline;
  }
  &:visited { color:#5864e5 }
`

export const LogoWrap = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  height:8rem;
  svg {
    height:10rem;
    width:10rem;
  }
  &:before {
    position:absolute;
    bottom:0;
    content:'';
    width:100%;
    height:200%;
    pointer-events:none;
    border-bottom:1px solid #eaeef8;
    border-bottom-right-radius:100%;
    border-bottom-left-radius:100%;

  }
`

// export const Submit = styled.button`
//   width:100%;
//   height:3rem;
//   margin-top:.8125rem;
//   background:#FFF;
//   border:1px solid #E7EBFF;
//   border-radius:50px;
//   box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
//   font-size:.9375rem;
//   letter-spacing:1.7px;
//   color:#abb2f2;
//   cursor:pointer;
//   outline:none;
//   transition: all 150ms ease-out;
//   &[data-submitting="true"]{
//     background: linear-gradient(150deg, #8659E5 35%, #1D8AED 100%);
//     background-size: 300% 300%;
//     animation: submitting-button 4s ease infinite;
//     border:1px solid #5864E5;
//     box-shadow:none;
//     color:white !important;
//     cursor:default;
//   }
//   &:hover,
//   &:focus {
//     border:1px solid #5665E5;
//     color:#5665E5;
//   }
// `
