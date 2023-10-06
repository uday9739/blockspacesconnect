import styled from "styled-components";
import ModalStyle from '@platform/types/styles/modal';

const IntroTitle: ModalStyle = {
  Title: styled.h4<{ clickable: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0 4.75rem;
    border-radius: 3rem;
    text-align: center;
    font-weight: 600;
    letter-spacing: 0.0625rem;
    font-size: 1.9375rem;
    ${(props) =>
    props.clickable &&
      `
      cursor:pointer;
      &:hover {
        border:1px solid #5864E5;
        svg { opacity: 1 }
      }`}
    svg {
      position: absolute;
      transition: all 100ms ease-out;
      right: 0.875rem;
      width: 2.25rem;
      opacity: 0.2;
    }
  `
};

export default IntroTitle;
