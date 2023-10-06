import styled from 'styled-components'
import TextInputStyle from 'src/platform/types/styles/text-input'

const twoFactorInput:TextInputStyle = {
  Wrap: styled.div`
    position:relative;
    display:flex;
    height:4.5rem;
    width:100%;
    margin: .75rem 0;
  `,
  Input: styled.input`
    width:100%;
    height:100%;
    color:#323656;
    padding: 0 1.8125rem;
    background:#FFF;
    border:1px solid #E7EBFF;
    border-radius: 2rem;
    outline:none;
    font-size:2rem;
    letter-spacing:.5rem;
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
      color: #abb2f270;
      font-size:2rem;
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
  `,
  Label: styled.label`
    position:absolute;
    display:flex;
    align-items:center;
    top:-2px;
    left:1.1875rem;
    background:white;
    height:4px;
    padding: 0 1rem;
    font-size:.9375rem;
    letter-spacing:.0625rem;
    color:#abb2f2;
    &[data-alignment="center"]{
      left:50%;
      transform:translate(-50%,0);
    }
  `
}

export default twoFactorInput;