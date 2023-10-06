import styled from "styled-components";


export const StyledLoadingBar = styled.div<{ height:number, width:number }>`
  display:flex;
  position:relative;
  width:${p => `${p.width}%`};
  height:${p => `${p.height}rem`};
  margin: 2.25rem 0 .25rem;
`
export const Nub = styled.div<{selected:boolean, color:string}>`
  flex:1;
  height:100%;
  margin: 0 1px;
  ${p => p.selected ? `
    background:${p.color};
    height:130%;
    transition:none;
    transform:translate(0,-15%);
  ` : `
    transition:1000ms ease-out;
    background:${p.color}22;
  `}
`