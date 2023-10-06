import styled from 'styled-components'
import TextInputStyle from 'src/platform/types/styles/text-input';

const lightningSetupTextInput:TextInputStyle = {
  Wrap: styled.div<{ margin?:string, width?:string }>`
    position:relative;
    display:flex;
    height:3.75rem;
    margin: ${p => p.margin ? p.margin : '.75rem auto'};
    width:${p => p.width ? p.width : '100%' };
  `,
  Input: styled.input<{error: boolean}>`
    width:100%;
    height:100%;
    color:#323656;
    padding: .625rem 1.8125rem 0;
    background:#FFF;
    ${(p) => p.error ? `border:1px solid red;` : `border:1px solid #E7EBFF;`}
    border-radius: 2rem;
    outline:none;
    font-size:1.25rem;
    transition:all 150ms ease-out;
    &[data-empty="true"]{
      background:#fcfcff;
      ${(p) => p.error ? `border:1px solid red;` : `border:1px solid #b5b9ee;`}
    }
    &:hover {
      background:#FFF;
      ${(p) => p.error ? `border:1px solid red;` : `border:1px solid #5665E5AA;`}
    }
    &:focus {
      background:#FFF;
      border: 1px solid #737589;
      ${(p) => p.error ? `border:1px solid red;` : `border:1px solid #5665E5;`}
      box-sizing: border-box;
      box-shadow: 0px 1px 3px #737589;
    }
    &::placeholder {
      color: #33365440;
      font-size:1.25rem;
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
  Label: styled.label<{error: boolean}>`
    position:absolute;
    display:flex;
    align-items:center;
    top:-2px;
    left:1.1875rem;
    background:white;
    height:4px;
    padding: 0 .875rem;
    font-family:'Roboto Mono';
    font-size:.8125rem;
    letter-spacing:.0625rem;
    ${(p) => p.error ? `color: red;` : `color:#abb2f2;`}
    &[data-alignment="center"]{
      left:50%;
      transform:translate(-50%,0);
    }
  `
}

export default lightningSetupTextInput;