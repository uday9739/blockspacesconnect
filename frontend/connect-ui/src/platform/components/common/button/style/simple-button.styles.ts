import styled from 'styled-components';
import type ButtonStyle from '../types';

export const SimpleButton: ButtonStyle = {
  Button: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 3.875rem;
    width: 21.25rem;

    background: #fff;
    border: 1px solid #e7ebff;
    border-radius: 50px;
    box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
    font-size: 0.9375rem;
    letter-spacing: 1.7px;
    color: #abb2f2;
    cursor: pointer;
    outline: none;
    transition: all 150ms ease-out;
    &[data-submitting='true'] {
      background: linear-gradient(150deg, #5864e5 35%, #8659e5 100%);
      background-size: 300% 300%;
      animation: submitting-button 4s ease infinite;
      border: 1px solid #5864e5;
      box-shadow: none;
      color: white !important;
      cursor: default;
    }
    &[disabled] {
      cursor: default;
      pointer-events: none;
      box-shadow: none;
      color: lightgray;
      border-color: lightgray
    }
    &:hover,
    &:focus {
      border: 1px solid #5665e5;
      color: #5665e5;
    }
  `,
};
