import styled from "styled-components";

const InfoTooltipStyles = styled.div`
  position:absolute;
  pointer-events:none;
  opacity:1;
  z-index:1000000;
`

export default InfoTooltipStyles

export const Info = styled.div`
  position:relative;
  background:#5864E5;
  padding:.375rem 1rem .5rem;
  border-radius:1.5rem;
  color:white;
  box-shadow: 0px 2px 3px rgba(88, 100, 229, 0.28);
  &[data-position="top"]{
    top:0;
    transform:translate(-50%, -145%);
    &:before {
      top:calc(100% - .625rem);
      left:calc(50% - .5rem);
    }
  }
  &[data-position="bottom"]{
    bottom:0;
    transform:translate(-50%, 50%);
    &:before {
      bottom:calc(100% - .625rem);
      left:calc(50% - .5rem);
    }
  }
  &[data-position="left"]{
    top:0;
    transform:translate(-100%, -50%);
    margin-left:-.75rem;
    &:before {
      top:calc(50% - .5rem);
      right:-.125rem;
    }
  }
  &[data-position="right"]{
    top:0;
    transform:translate(0%, -50%);
    margin-left:.75rem;
    &:before {
      top:calc(50% - .5rem);
      left:-.125rem;
    }
  }
  &:before {
    content:"";
    position:absolute;
    width:1rem;
    height:1rem;
    transform: rotate(45deg);
    background:#5864E5;
  }
`

export const InfoLabel = styled.div`
  position:relative;
  font-size:.875rem;
  z-index:10;
`