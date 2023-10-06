import styled from "styled-components"
import ModalStyle from '@platform/types/styles/modal'

const MainTitle:ModalStyle = {

  Title:styled.h2<{ clickable:boolean }>`
    display:flex;
    align-items:center;
    justify-content:center;
    position:relative;
    margin: 3rem 0 1.5rem;
    border-radius:3rem;
    text-align:center;
    font-weight:400;
    letter-spacing:.3125rem;
    font-size:1.75rem;
    ${props => props.clickable && `
      cursor:pointer;
      &:hover {
        border:1px solid #5864E5;
        svg { opacity: 1 }
      }`
}
    svg {
      position:absolute;
      transition:all 100ms ease-out;
      right:.875rem;
      width:2.25rem;
      opacity:.2;
    }
  `
}

export default MainTitle