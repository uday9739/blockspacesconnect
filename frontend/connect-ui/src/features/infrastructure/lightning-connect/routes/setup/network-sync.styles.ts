import styled from "styled-components";

export const StyledNetworkSync = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  background: #ffffff;
  box-shadow: 0px 0px 2.25rem #ece7f1;
  border-radius: 0.875rem;
`;

export const Title = styled.h2`
  width: 100%;
  margin: 3.25rem 0 1.5rem;
  text-align: center;
  font-family: "Roboto Mono";
  font-weight: 400;
  font-size: 1.75rem;
`;

export const Copy = styled.p`
  width: 100%;
  max-width: calc(100% - 2.25rem);
  margin: 0 auto;
  text-align: center;
  line-height: 1.875rem;
  font-size: 1.125rem;
  letter-spacing: 0.05rem;
`;

export const StepButton = styled.button<{
  margin?: string;
  width?: string;
}>`
  margin: ${(p) => (p.margin ? p.margin : `0`)};
  width: ${(p) => (p.width ? p.width : "auto")};
  height: 3.125rem;
  background: #ffffff;
  border: 1px solid #e7e7ee;
  border-radius: 2rem;
  font-family: "Roboto Mono";
  font-size: 1rem;
  transition: 100ms ease-out;
  &:disabled {
    pointer-events: none;
  }
  &:hover {
    cursor: pointer;
    border: 1px solid #7b1af7;
    color: #7b1af7;
  }
`;

export const LoadingBar = styled.div<{ height: number }>`
  display: flex;
  position: relative;
  width: 100%;
  height: ${(p) => `${p.height}rem`};
  margin: 2.25rem 0 0.25rem;
`;
export const Nub = styled.div<{ selected: boolean }>`
  flex: 1;
  height: 100%;
  margin: 0 1px;
  ${(p) =>
    p.selected
      ? `
    background:#7b1af7;
    height:130%;
    transition:none;
    transform:translate(0,-15%);
  `
      : `
    transition:1000ms ease-out;
    background:#F7F0FF;
  `}
`;
