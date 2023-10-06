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

export const Display = styled.div<{ error?: boolean }>`
  display:flex;
  align-items: center;
  width:100%;
  height:100%;
  color:${p => p.theme.black};
  padding: .0625rem 1.875rem 0;
  transition:100ms ease-out;
  font-size:.9375rem;
`

export const TextInput = styled.input`
  display:flex;
  align-items: center;
  width:100%;
  height:100%;
  color:${p => p.theme.black};
  padding: 0 1.875rem;
  background:transparent;
  border:none;
  outline:none;
  transition:100ms ease-out;
  font-size:.9375rem;
`

export const EditIcon = styled.div`
  position:absolute;
  top: 0.3125rem;
  right:.75rem;
  opacity:0;
  transition:100ms ease-out;
  width:2.25rem;
  height:2.25rem;
  pointer-events:none;
  svg { width:100%; height:100%;}
  .fill-primary { fill:${p => p.theme.bscBlue}}
`

export const EnterIcon = styled.div`
  position:absolute;
  top: 0.3125rem;
  right:.75rem;
  opacity:1;
  transition:100ms ease-out;
  width:2.25rem;
  height:2.25rem;
  pointer-events:none;
  svg { width:100%; height:100%;}
  .fill-primary { fill:${p => p.theme.bscBlue}}
`

export const StyledEditableField = styled.div<{ editing:boolean }>`
  position:relative;
  display:flex;
  justify-content: center;
  width:100%;
  height:3.125rem;
  border: 1px solid ${p => p.theme.lightBlue};
  border-radius: 2rem;
  transition:100ms ease-out;
  ${p => p.editing ? `
    border-color:${p.theme.bscBlue};
    box-shadow:${p.theme.slightBoxShadow};
    ${TextInput},
    ${Label}{
      color:${p.theme.bscBlue};
    }
  `: `
    cursor:pointer;
    &:hover {
      ${Display},
      ${Label}{
        color:${p.theme.bscBlue};
      }
      ${EditIcon}{
        opacity:1;
      }
      border-color:${p.theme.bscBlue}80;
      box-shadow:${p => p.theme.slightBoxShadow};
    }
  `}
`