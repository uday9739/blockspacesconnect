import styled from "styled-components";






export const OptionLabel = styled.div`
  display: none;
  flex: 1;
  color: #ffffff;
  transition: 100ms ease-out;
  opacity: 0.3;
  font-size: 0.9375rem;
  font-weight: 300;
  letter-spacing: 0.0625rem;
`;

export const NavSectionOption = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.1875rem;
  border: 1px solid #252943;
  border-radius: 100%;
  cursor: pointer;
  transition: border 100ms ease-out, opacity 100ms ease-out;
  svg {
    width: 3rem;
    height: 3rem;
    transition: 100ms ease-out;
    opacity: 0.3;
    .fill-primary {
      fill: #f2fcff;
    }
  }
  &:hover {
    border: 1px solid #f2fcff44;
    svg {
      opacity: 0.7;
    }
    ${OptionLabel} {
      opacity: 0.7;
    }
  }
  ${(p) =>
    p.active &&
    `
    border:1px solid #F2FCFF88;
    box-shadow:0px 0px .125rem rgba(242, 252, 255, 0.49);
    cursor:default;
    &:hover {
      border:1px solid #F2FCFF88;
      svg { opacity: 1 }
      ${OptionLabel}{ opacity:1 }
    }
    svg { opacity: 1 }
    ${OptionLabel}{ opacity:1 }
  `}
`;

export const AddResource = styled.div<{ absolutelyPositioned: boolean; active: boolean }>`
  display: flex;
  align-items: center;
  ${(p) =>
    p.absolutelyPositioned
      ? `
    position:absolute;
    top:.8125rem;
    right:.5rem;
    `
      : `
    position:relative;`}
  width:3rem;
  height: 2.5rem;
  cursor: pointer;
  transition: border 100ms ease-out, opacity 100ms ease-out;
  svg {
    width: 2.25rem;
    height: 2.25rem;
    margin: 0 0.5rem 0.3125rem;
    transition: 100ms ease-out;
    opacity: 0.3;
    .fill-primary {
      fill: #f2fcff;
    }
  }
  &:hover {
    svg {
      opacity: 0.7;
    }
  }
  ${(p) =>
    p.active &&
    `
    cursor:default;
    svg { opacity: 1 }
  `}
`;



export const ToggleSidebar = styled.div`
  position: relative;
  left: 100%;
  top: 0;
  width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 .125rem;
  border:1px solid #e9ebf8;
  border-radius:.5rem;
  cursor:pointer;
  transition:100ms ease-out;
  background: white;
  svg {
    pointer-events:none;
    min-width:130%;
    .fill-primary {
      transition:100ms ease-out;
      fill:#d4d6f8
    }
  }
  &:hover {
    border-color:#bdc2e4;
    svg {
      .fill-primary { fill:#303252 }
    }
  }
`

export const Header = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 4.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const LogoWrap = styled.div`
  display: flex;
  justify-content: flex-start;
  position: relative;
  width: 100%;
  max-width: 15.625rem;
  height: 3.75rem;
  margin: 0.375rem 0 0 0.4375rem;
  svg {
    height: 100%;
    max-width: 13rem;
  }
  .fill-primary {
    fill: #f2fcff;
  }
`;

export const Navigation = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 100%;
`;

export const NavSection = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: calc(100% - 1rem);
  margin-bottom: 0.5rem;
  padding: 0.1875rem 0.25rem;
  border: 1px solid #272b47;
  border-radius: 2rem;
`;


export const SectionHeaderLogoWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 1.5625rem;
  height: 1.5625rem;
  margin: 0 0.75rem;
  border: 1px solid #f2fcff44;
  border-radius: 0.25rem;
  transform: rotate(45deg);
  box-shadow: 0px 0px 0.125rem rgba(242, 252, 255, 0.49);
  svg {
    min-width: 120%;
    min-height: 120%;
    transform: rotate(-45deg);
    transition: 100ms ease-out;
    opacity: 0.3;
    .fill-primary {
      fill: #f2fcff;
    }
  }
  &:hover {
    border: 1px solid #f2fcff44;
    svg {
      opacity: 0.7;
    }
  }
`;

export const NavSectionHeaderLabel = styled.div`
  display: none;
  flex: 1;
  color: #ffffff;
  font-size: 0.9375rem;
  font-weight: 300;
  letter-spacing: 0.0625rem;
  transition: 100ms ease-out;
  opacity: 0.3;
`;
export const NavSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 3.125rem;
  margin-top: 0.125rem;
  cursor: pointer;
  &:hover {
    ${ SectionHeaderLogoWrap } {
      border: 1px solid #f2fcff88;
      svg {
        opacity: 0.7;
      }
    }
    ${ NavSectionHeaderLabel } {
      opacity: 0.7;
    }
  }
  &[data-active="true"] {
    cursor: default;
    ${ SectionHeaderLogoWrap } {
      border: 1px solid #f2fcff;
      box-shadow: 0px 0px 0.125rem rgba(242, 252, 255, 0.49);
      svg {
        opacity: 1;
      }
    }
    ${ NavSectionHeaderLabel } {
      opacity: 1;
    }
  }
`;

export const WrapperSidebar = styled.div`
  position: fixed;
  width: 4.75rem;
  height: 100%;
  top: 0;
  left: 0;
  background: #303252;
  z-index: 10;
  transition:100ms ease-out;
  &[data-expanded="true"] {
    width: 18rem;
    transform: scale3d(18rem, 0, 0);
    ${ NavSection } {
      border-radius: 1.75rem;
    }
    ${ NavSectionOption } {
      width: 100%;
      border-radius: 2.25rem;
    }
    ${ NavSectionHeaderLabel },
    ${ OptionLabel } {
      display: inline;
    }
  }
`;