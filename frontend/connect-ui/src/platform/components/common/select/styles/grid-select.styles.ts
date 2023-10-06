import styled from 'styled-components';
import {SelectStylesType} from '../types/styles/select-styles-type';

const Test = styled.div<{test:boolean}>``;

export const GridSelectStyles:SelectStylesType = {

  MenuWrap: styled.div<{ size: 'sm' | 'md' | 'lg' }>`
    max-width: 25rem;
    position:relative;
    display:flex;
    height:3.25rem;
    margin: .75rem 0;
    justify-content: center;
    cursor: pointer;
    ${props => props.size === 'sm' && `
      transform: scale(.7);
    `};
  `,
    MenuContainer: styled.div`
    width:100%;
    color:#323656;
    padding: 0 1.25rem;
    background:#FFF;
    border:1px solid #E7EBFF;
    border-radius: 2rem;
    outline:none;
    font-size:1.0625rem;
    transition:100ms ease-out;
    height: fit-content;
    &:hover,
    &:focus {
      border:1px solid #015fcc;
      box-shadow: none;
    };
    `,
      MenuSelection: styled.div`
        height: 2.5rem;
        text-align: center;
        line-height: 2.5rem;
        color: #323656;
        font-size: 1rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `,
      MenuLabel: styled.label`
        position:absolute;
        display:flex;
        align-items:center;
        top:-0.0625rem;
        background:white;
        height:0.1875rem;
        padding: 0 .75rem;
        font-size: .625rem;
        letter-spacing:.0625rem;
        color:#abb2f2;
        transition:100ms ease-out;
        &[data-alignment="center"]{
          left:50%;
          transform:translate(-50%,0);
        }
        .container-menu:hover ~ & {
          color: #015fcc;
          font-size: 0.5625rem;
        }
      `,
      DropdownContainerOptions: styled.ul`
      list-style-type: none;
      margin: 0;
      padding: 0;
      max-height: 12.5rem;
      overflow-y: auto;
      overflow-x: hidden;
      margin-bottom: .625rem;
      margin-top: .625rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    `,
    DropdownContainerInput: styled.div`
      margin-top: 1.25rem;
      display: flex;
      flex-direction: row;
      height:2.5rem;
    `,
    DropdownIconSearch: styled.img`
       width: 1.0625rem;
      height: 1.0625rem;
      margin-left: -2.0625rem;
      margin-top: .7rem;
    `,
    DropdownInput: styled.input`
      width: 100%;
      color:#323656;
      padding: 0 1.8125rem;
      padding-right: 2.1875rem;
    background:#FFF;
    border:1px solid #E7EBFF;
    border-radius: 3.1875rem;
    outline:none;
    font-size:1.0625rem;
    transition:all 150ms ease-out;
    &[data-empty="true"]{
      background:#fcfcff;
      border:1px solid #b5b9ee;
    }
    &:hover {
      background:#FFF;
      border: 1px solid #5665E5AA;
    }
    &:focus {
      background:#FFF;
      border: 1px solid #5665E5;
      box-sizing: border-box;
      box-shadow: 0px 1px 3px rgba(86, 101, 229, 0.48);
    }
    &::placeholder {
      color: #abb2f270;
      font-size: 1.0625rem;
      font-weight:300;
    }
    &[data-alignment="center"]{
      text-align:center;
    }
  `,
  OptionWrap: styled.li`
  max-width: 2.125rem;
  height: 2.125rem;
  margin: .125rem;
  line-height: 1.5rem;
  font-size: .625rem;
  text-transform: uppercase;
  margin-top: .1875rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition:100ms ease-out;
  &:hover, &:focus{
      color: #015fcc;
  }
`,
OptionIcon: styled.img<{checked: boolean}>`
  width: 2.125rem;
  height: 2.125rem;
  padding: .125rem;
  margin: .0625rem;
    border: 1px solid #ccc;
    border-radius: 1rem;
    &:hover, &:focus{
      transform: scale(1.1);
  }
  ${props => props.checked  && `
    border: 1px solid orange;
    box-shadow: 0px 0px 1px 1px rgba(245,57,0,1);
  `};
`,
OptionLabel: styled.div`
`,
OptionCheckBox: styled.input`
`,
OptionContainerLabel: styled.div`
    display: flex;
    width: 85%;
    justify-content: left;
`,
WrapStage: styled.div`
    margin-left: -1.25rem;
    margin-right: -1.25rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
`,
Stage: styled.div`
  white-space: nowrap;
    overflow-x: auto;
    display: flex;
    height: 2.5rem;
    align-items: center;
`,
PillComponent: styled.div`
  max-width: 7.5rem;
  min-width: 6.25rem;
  width: 6.25rem;
  height: 1.3125rem;
  overflow: hidden;
  border: 1px solid #8b43ee;
  border-radius: 1.0625rem;
  background: #8b43ee;
  text-overflow: ellipsis;
  margin-left: .1875rem;
  margin-right: .1875rem;
  display: flex;
  justify-content: space-between;
  img{
    height: 1.6875rem;
    margin-right: -.25rem;
  }
  .container-label-pill{
      max-width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-left: .625rem;
      text-transform: uppercase;
      font-size: .625rem;
      color: white;
      letter-spacing: 0.02rem;
      flex: 1;
      line-height: 1.1875rem;
      text-align: center;
  }
`
};