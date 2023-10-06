import styled from 'styled-components'
import TextInputStyle from 'src/platform/types/styles/text-input';

export const newDefaultTextInput: TextInputStyle = {
  Wrap: styled.div`
    position:relative;
    display:flex;
    height:2.875rem;
    width:100%;
    margin: .5rem 0;
  `,
  Input: styled.input<{ error: boolean }>`
    width:100%;
    height:100%;
    color:${p => p.theme.black};
    padding: 0 1.875rem;
    border:1px solid;
    border-color:${p => p.error ? `red` : `${p.theme.lightBlue}`};
    border-radius: 2rem;
    outline:none;
    font-size:.9375rem;
    transition:all 150ms ease-out;
    &[data-empty="true"]{
      border-color:${p => p.error ? `red` : `${p.theme.black}20`};
    }
    &:hover {
      box-shadow:${p => p.theme.slightBoxShadow};
    }
    &:focus {
      border-color:${p => p.error ? `red` : `${p.theme.bscBlue}80`};
      box-shadow:${p => p.theme.slightBoxShadow};
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
  `,
  Label: styled.label<{ error: boolean }>`
    position:absolute;
    display:flex;
    align-items:center;
    top:-1px;
    left:1.125rem;
    background:white;
    height:3px;
    padding: 0 .75rem;
    font-size:.75rem;
    color:${p => p.error ? `red` : `${p.theme.black}80`};
    letter-spacing:.02rem;
    &[data-alignment="center"]{
      left:50%;
      transform:translate(-50%,0);
    }
  `
}