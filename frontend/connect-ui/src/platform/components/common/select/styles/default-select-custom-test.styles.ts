import styled from 'styled-components';
import {SelectStylesType} from '../types/styles/select-styles-type';

export const CustomStyles:SelectStylesType = {
    MenuContainer: styled.div`
    width:100%;
    color:#323656;
    padding: 0 1.25rem;
    background:#FFF;
    border:1px solid red;
    border-radius: 2rem;
    outline:none;
    font-size:1.0625rem;
    transition:100ms ease-out;
    height: fit-content;
    &:hover,
    &:focus {
      border:1px solid orange;
      box-shadow: none;
    };
    `,
      MenuLabel: styled.label`
        position:absolute;
        display:flex;
        align-items:center;
        top:-.0625rem;
        background:white;
        height:.1875rem;
        padding: 0 .75rem;
        font-size: .625rem;
        letter-spacing:.0625rem;
        color:red;
        transition:100ms ease-out;
        &[data-alignment="center"]{
          left:50%;
          transform:translate(-50%,0);
        }
        .container-menu:hover ~ & {
          color: orange;
          font-size: .5625rem;
        }
      `,
};