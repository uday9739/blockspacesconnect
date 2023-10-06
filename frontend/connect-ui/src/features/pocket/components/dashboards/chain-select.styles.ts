import styled from "styled-components";

export const StyledChainSelect = styled.div`
  position:absolute;
  left:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  min-width:6rem;
  padding: .5rem 1.125rem .625rem;
  border:1px solid #f0f2f9;
  border-radius:3rem;
  transform:translate(-50%, 0);
`

export const SelectLabel = styled.div`
  position:absolute;
  top:0;
  padding: 0 .875rem;
  background:#FFFFFF;
  font-size:.75rem;
  letter-spacing: .08rem;
  color:#c2c3ce;
  transform:translate(0, -60%);
`

export const Placeholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 .0625rem;
  width:3rem;
  height:3rem;
  margin-top:.25rem;
  /* border:1px dashed #f0f2f9; */
  font-size:1.125rem;
  border-radius:100%;
`

export const ImageWrap = styled.div<{ borderColor:string }>`
  display:flex;
  align-items: center;
  justify-content: center;
  position:relative;
  width:calc(100% - .25rem);
  height:calc(100% - .25rem);
  margin-top:.25rem;
  padding: .125rem;
  border:2px solid;
  border-radius:100%;
  ${p => p.borderColor && `
    border-color:${p.borderColor};
    &:hover {
      border-color:#FF6006;
    }
  `}

`

export const Option = styled.div`
  position:relative;
  margin: 0 .0625rem;
  width:3.25rem;
  height:3.25rem;
  opacity:.8;
  &:hover { 
    opacity: 1
  }
  cursor:pointer;
`

export const Image = styled.img`
  position:relative;
  height:100%;
  width:100%;

`

export const ResetChainSelect = styled.div<{ active:boolean }>`
  position:relative;
  display:flex;
  align-items:center;
  justify-content: center;
  height:3rem;
  width:3rem;
  margin: .25rem 0 0 1rem;
  border:1px solid #CBC8C8;
  border-radius:100%;
  cursor:pointer;
  pointer-events: none;
  opacity:.3;
  &:before {
    content:'';
    position:absolute;
    top:-10%;
    left:-.625rem;
    height:120%;
    width:1px;
    background:#f0f2f9;
  }
  .fill-primary { fill:#CBC8C8 }
  ${p => p.active && `
    opacity:1;
    pointer-events: all;
    &:hover {
      border:1px solid #CBC8C8;
      box-shadow:0 1px 2px rgba(0,0,0,0.3);
      .fill-primary { fill:#308aed }
    }
  `}
  
`