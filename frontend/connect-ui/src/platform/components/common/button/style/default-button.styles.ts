import styled from 'styled-components';
import type ButtonStyle from '../types';

export const DefaultButton: ButtonStyle = {
  Button: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 3.875rem;
    width: 21.25rem;
    background: linear-gradient(90deg, #1dafed 30%, #1d8aed 85%);
    box-shadow: 0px 0.0625rem 0.75rem rgba(29, 175, 237, 0.25);
    border: none;
    border-radius: 2.125rem;
    color: white;
    font-weight: 300;
    font-size: 1rem;
    letter-spacing: 0.0625rem;
    cursor: pointer;
    transition: 100ms ease-out;
    outline: none;
    &:focus,
    &:hover {
      border: 2px solid #015fcc;
      box-shadow: none;
    }
    &:disabled {
      cursor: default;
      pointer-events: none;
      border: none;
      opacity: 0.7;
      box-shadow: none;
    }
  `,
};
