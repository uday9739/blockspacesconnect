import styled from 'styled-components';
import type ButtonStyle from '../types';

export const TabButton: ButtonStyle = {
  Button: styled.button<{ selected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 4.125rem;
    background: #fff;
    border: 1px solid #e7ebff;
    border-radius: 50px;
    box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
    font-size: 0.9375rem;
    letter-spacing: 1.3px;
    color: white;
    cursor: pointer;
    outline: none;
    transition: all 150ms ease-out;
    &[disabled] {
      cursor: default;
      pointer-events: none;
      box-shadow: none;
    }
    &:hover,
    &:focus {
      border: 1px solid #5665e5;
      color: #5665e5;
    }
    ${(p) =>
      !p.selected
        ? `
        background-color: #ccc !important;
        border-color: #ccc !important;
        color: #333 !important;
    `
        : ``}
  `,
};
