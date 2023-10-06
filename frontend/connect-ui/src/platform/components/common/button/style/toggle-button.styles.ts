import styled from 'styled-components';
import type ButtonStyle from '../types';

export const ToggleButton: ButtonStyle = {
  Button: styled.button<{ selected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 4.125rem;
    background: #fff;
    border: 1px solid #abb2f2;
    border-radius: 50px;
    box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
    font-family: 'Lato';
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 130%;
    letter-spacing: 1.7px;
    color: #7A1AF7;
    cursor: pointer;
    outline: none;
    transition: all 150ms ease-out;
    &[disabled] {
      cursor: default;
      pointer-events: none;
      box-shadow: none;
      color: lightgray;
      border-color: lightgray;
    }
    &:hover,
    &:focus {
      border: 1px solid #5665e5;
      color: ${p => p.selected ? 'white' : '#5665e5'};
    }
    ${(p) =>
      p.selected ? `
        background: #7A1AF7;
        color: white;
      `: ``}
  `,
};
