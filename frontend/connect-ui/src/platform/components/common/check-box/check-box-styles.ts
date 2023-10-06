import styled from "styled-components";

export const Styles = {
  Wrap: styled.div`
    position:relative;
    display:flex;
    height:3.25rem;
    width: 1rem;
    margin: .75rem 0;
  `,
  Label: styled.label<{ error: boolean }>`
    position:absolute;
    display:flex;
    align-items:center;
    top:-1px;
    left:1.1875rem;
    background:white;
    height:3px;
    padding: 0 .75rem;
    font-size:.6875rem;
    letter-spacing:.0625rem;
    ${(p) => p.error ? `color: red;` : `color:#abb2f2;`}
    &[data-alignment="center"]{
      left:50%;
      transform:translate(-50%,0);
    }
  `,
  CheckBox: styled.input`
    display: flex;
    flex-direction:row
    width: 1rem;
    margin:none;
    cursor: pointer;
  `,
};
