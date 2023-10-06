import styled from 'styled-components'
import PhoneInputStyle from 'src/platform/types/styles/phone-input';

const defaultPhoneInput: PhoneInputStyle = {
  Wrap: styled.div`
    position:relative;
    display:flex;
    height:3.25rem;
    width:100%;
    margin: .75rem 0;
  `,
  BscPhoneInput: styled.div<{ error: boolean }>`
    width:100%;
    height:100%;
    color:#323656;
    padding: .8125rem 1.8125rem;
    background:#FFF;
    ${(p) => p.error ? `border:1px solid red;` : `border:1px solid #E7EBFF;`}
    border-radius: 2rem;
    outline:none;
    font-size:1.0625rem;
    transition:all 150ms ease-out;
    &[data-empty="true"]{
      background:#fcfcff;
      ${(p) => p.error ? `border:1px solid red;` : `border:1px solid #B5B9EE;`}
    }
    &:hover {
      background:#FFF;
      ${(p) => p.error ? `border:1px solid red;` : `border:1px solid #5665E5AA;`}
    }
    &:focus {
      background:#FFF;
      ${(p) => p.error ? `border:1px solid red;` : `border:1px solid #5665E5;`}
      box-sizing: border-box;
      box-shadow: 0px 1px 3px rgba(86, 101, 229, 0.48);
    }
    &::placeholder {
      color: #abb2f270;
      font-size: 1.0625rem;
      font-weight:300;
    }
    &[disabled]{
      background:#fcfcff;
      &:hover {
        border:1px solid #E7EBFF;
      }
    }
    &[data-alignment="center"]{
      text-align:center;
    }
    .PhoneInputInput {
      border:none;
    }
  `,
  Label: styled.label<{ error: boolean }>`
    position:absolute;
    display:flex;
    align-items:center;
    top:-1px;
    left:1.1875rem;
    background:white;
    height:3px;
    padding: 0 .75rem;
    font-size:.6875rem;
    letter-spacing:.0625rem;
    ${(p) => p.error ? `color: red;` : `color:#abb2f2;`}
    &[data-alignment="center"]{
      left:50%;
      transform:translate(-50%,0);
    }
  `
}

export default defaultPhoneInput;