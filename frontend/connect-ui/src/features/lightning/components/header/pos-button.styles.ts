import styled from 'styled-components'
import ButtonStyle from 'src/platform/types/styles/button'

export const PosButtonStyles:ButtonStyle = {
  Button: styled.button`
    display:flex;
    align-items:center;
    justify-content:center;
    width:100%;
    height:4.125rem;
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
    &[disabled]{
      cursor:default;
      pointer-events:none;
      box-shadow:none;
    }
    &:hover,
    &:focus {
      border:1px solid #5665E5;
      color:#5665E5;
    }
  `
}