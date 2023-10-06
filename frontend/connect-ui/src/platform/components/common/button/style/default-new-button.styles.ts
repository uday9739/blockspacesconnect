import styled from 'styled-components';
import type ButtonStyle from '../types';

export const DefaultNewButton: ButtonStyle = {
  Button: styled.button`
    position:relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 3.5rem;
    width: 21.25rem;
    background:transparent;
    border: 1px solid ${p => p.theme.lightBlue};
    border-radius: 2.125rem;
    color: ${p => p.theme.black};
    font-size: 1rem;
    cursor: pointer;
    transition: 100ms ease-out;
    outline: none;
    &:before {
      content:'';
      position:absolute;
      top:3px;
      left:3px;
      height:calc(100% - 6px);
      width:calc(100% - 6px);
      background:${p => p.theme.bscBlue};
      border-radius: 2.125rem;
      opacity:0;
      transition:100ms ease-out;
      z-index:-1;
    }
    &:focus,
    &:hover {
      color: ${p => p.theme.white};
      /* border-color:${p => p.theme.bscBlue}; */
      box-shadow: none;
      &:before { opacity:1 }
    }
    &:disabled {
      cursor: default;
      pointer-events: none;
      /* border: none; */
      opacity: 0.3;
      box-shadow: none;
    }
  `,
};
