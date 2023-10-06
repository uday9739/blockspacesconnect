import styled from "styled-components";

export const Styles = {
  ToggleSwitch: styled.div`
    position: relative;
    width: 2.203125rem;
    display: inline-block;
    vertical-align: middle;
    text-align: left;

    .toggle-switch-checkbox {
      display: none;
    }

    .toggle-switch-label {
      display: block;
      overflow: hidden;
      cursor: pointer;
      border: 0 solid #bbb;
      border-radius: 0.5rem;
      margin: 0;
    }
    .toggle-switch-inner {
      display: block;
      width: 200%;
      margin-left: -100%;
      transition: margin 0.3s ease-in 0s;
      &:before,
      &:after {
        display: block;
        float: left;
        width: 50%;
        height: 0.89rem;
        padding: 0;
        line-height: 0.89rem;
        font-size: 1rem;
        color: white;
        font-weight: bold;
        box-sizing: border-box;
      }
      &:before {
        content: "";
        text-transform: uppercase;
        padding-left: 10px;
        background-color: #7a1af7;
        color: #fff;
      }
    }
    .toggle-switch-inner:after {
      content: "";
      text-transform: uppercase;
      background-color: #7a1af7;
      color: #fff;
      text-align: right;
    }
    .toggle-switch-switch {
      display: block;
      width: 1.125rem;
      height: 1.125rem;
      /* /   margin: 5px; */
      background: #fff;
      position: absolute;
      top: -0.1rem;
      bottom: 0;
      right: 1.1rem;
      border: 1px solid #d8dcf0;
      border-radius: 0.5625rem;
      transition: all 0.3s ease-in 0s;
    }
    .toggle-switch-checkbox:checked + .toggle-switch-label {
      .toggle-switch-inner {
        margin-left: 0;
      }
      .toggle-switch-switch {
        right: -0.2rem;
      }
    }
  `
};
