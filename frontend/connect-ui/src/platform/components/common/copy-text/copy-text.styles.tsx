import styled from "styled-components";

export const Label = styled.label`
  position:absolute;
  display:flex;
  align-items:center;
  top:-1px;
  left:1.125rem;
  background:white;
  height:3px;
  padding: 0 .75rem;
  font-size:.75rem;
  color:${p => p.theme.black}80;
  letter-spacing:.02rem;
  &[data-alignment="center"]{
    left:50%;
    transform:translate(-50%,0);
  }
`

export const Text = styled.div<{ size?: number;  error?: boolean }>`
  display:flex;
  align-items: center;
  width:90%;
  height:100%;
  color:${p => p.theme.black};
  padding: .0625rem 1rem 0;
  transition:100ms ease-out;
  font-size:${p => p?.size ?? .9375}rem;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipses;
`

export const CopyIcon = styled.div`
  // position:absolute;
  // top: 0.3125rem;
  // right:.75rem;
  opacity:0;
  transition:100ms ease-out;
  width:2.25rem;
  height:2.25rem;
  svg { width:100%; height:100%;}
  .fill-primary { fill:${p => p.theme.bscBlue}}
`

export const StyledCopyText = styled.div<{ copied:boolean }>`
  position:relative;
  display:flex;
  justify-content: center;
  width:100%;
  height:3.125rem;
  background:${p => p.theme.faintBlue};
  border: 1px solid ${p => p.theme.lightBlue};
  border-radius: 2rem;
  transition:100ms ease-out;
  ${p => p.copied ? `
    border-color:${p.theme.bscBlue};
    ${Text},
    ${Label}{
      color:${p.theme.bscBlue};
    }
    ${CopyIcon}{
        opacity:1;
      }
  `: `
    cursor:pointer;
    &:hover {
      ${Text},
      ${Label}{
        color:${p.theme.bscBlue};
      }
      ${CopyIcon}{
        opacity:1;
      }
      border-color:${p.theme.bscBlue}80;
      box-shadow:${p => p.theme.slightBoxShadow};
    }
  `}
`