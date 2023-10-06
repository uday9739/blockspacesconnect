import styled from "styled-components";

export const CopyStylesBorder = styled.div<{height:string}>`
  height:${p => `${p.height}`};
  position:relative;
  border:1px solid #F0F2F8;
  border-radius:2.5rem;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:0 4rem 0 2rem;
  cursor:pointer;
  &:hover {
    border:1px solid #7b1af7;
  }
`

export const CopyText = styled.h5<{width:string}>`
  color:#000000;
  overflow:hidden;
  text-overflow:ellipsis;
  text-align:center;
  width:${p => `${p.width}`};
`

export const CopyLabel = styled.label`
  position:absolute;
  padding-right:1rem;
  right:0;
  cursor:pointer;
`