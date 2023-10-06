import styled from "styled-components";

export const ModalContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  left: 50%;
  top: 6rem;
  width: ${(p) => p.style?.width || "50%"};
  max-width: calc(100% - 10rem);
  padding: 0 1.125rem;
  background: ${(p) => p.theme.white};
  border-radius: 1.5rem;
  box-shadow: ${(p) => p.theme.mediumBoxShadow};
  transform: translate(-50%, 0);
  overflow: hidden;
`;
export const ModalHeaderCloseWrapper = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.75rem;
  width: 2.75rem;
  background: transparent;
  border: 1px solid ${(p) => p.theme.lighterBlue};
  border-radius: 100%;
  cursor: pointer;
  .fill-primary {
    fill: ${(p) => p.theme.bscBlue};
  }
  svg {
    width: 150%;
    height: 150%;
    opacity: 0.3;
  }
  &:hover {
    border-color: ${(p) => p.theme.bscBlue};
    svg {
      opacity: 1;
    }
  }
`;

export const ModalTitle = styled.div`
  margin: 2rem 0;
  padding-left: 5px;
  text-align: center;
  font-size: 1.375rem;
`;
