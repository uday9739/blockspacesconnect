import styled from "styled-components";

export const Styles = {
  Header: styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 74rem;
    max-width: calc(100% - 5.5rem);
    margin-top: 2.5rem;
  `,
  Cap: styled.div`
    position: absolute;
    top: 0;
    z-index: 0;
    width: calc(100% - 2.25rem);
    height: 4rem;
    background: white;
    border: 1px solid #d8dcf0;
    border-top-left-radius: 1.75rem;
    border-top-right-radius: 1.75rem;
    display: flex;
    justify-content: space-between;
  `,
  UpperModuleWrap: styled.div`
    width: 18rem;
    align-items: center;
    justify-content: center;
  `,
  Body: styled.div`
    position: relative;
    display: flex;
    width: 100%;
    height: 8rem;
    padding: 0 1rem;
    margin-top: 3.375rem;
    background: white;
    border: 1px solid #d8dcf0;
    border-radius: 0.5rem;
    z-index: 1;
    &:after {
      position: absolute;
      bottom: 0;
      left: 50%;
      content: "";
      height: 0.75rem;
      width: calc(100% - 3.5rem);
      border: 1px solid #d8dcf0;
      border-bottom: none;
      border-top-right-radius: 0.25rem;
      border-top-left-radius: 0.25rem;
      transform: translate(-50%, 0);
      z-index: 0;
    }
  `,
  ModuleWrap: styled.div`
    flex: 3;
    height: 100%;
  `,
  Navigation: styled.div`
    position: relative;
    flex: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    z-index: 1;
    &:after {
      content: "";
      position: absolute;
      top: 0;
      height: 100%;
      width: 100%;
      background: white;
      z-index: -1;
    }
  `,
  HeaderBridge: styled.div`
    position: absolute;
    top: -3rem;
    width: 100%;
    height: 10rem;
    background: white;
    border: 1px solid #d8dcf0;
    border-bottom: none;
    border-top-left-radius: 100%;
    border-top-right-radius: 100%;
    z-index: -2;
  `,
  LogoWrap: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -5rem;
    height: 5.5rem;
    width: 5.5rem;
    background: white;
    border: 1px solid #d8dcf0;
    border-radius: 100%;
    z-index: 1;
  `,
  Logo: styled.img`
    position: relative;
    width: 124%;
    height: 124%;
  `,
  NetworkName: styled.h1`
    position: relative;
    margin: 0 0 0.25rem;
    letter-spacing: 0.1875rem;
    text-transform: uppercase;
    font-size: 1.8125rem;
    font-weight: 500;
  `,
  NavItems: styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.875rem;
    width: calc(100% - 16px);
    border-top: 1px solid #d8dcf0;
    border-radius: 0.5rem;
    &:before,
    &:after {
      position: absolute;
      top: -1px;
      content: "";
      height: 2.125rem;
      width: 1px;
      background: #d8dcf0;
    }
    &:before {
      left: -3px;
      transform: rotate(22deg);
    }
    &:after {
      right: -3px;
      transform: rotate(-22deg);
    }
  `,
  NavItem: styled.div<{ selected?: boolean }>`
    margin: 0 0.5rem;
    letter-spacing: 0.0625rem;
    font-size: 1rem;
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
    cursor: pointer;
    ${(p) =>
      p.selected &&
      `
    opacity:1;
    cursor:default;
  `}
  `
};
