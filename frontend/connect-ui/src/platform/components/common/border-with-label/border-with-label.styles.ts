import styled from "styled-components";

export const BorderWithLabelContainer = styled.div<{height:string, width:string, borderColor:string}>`
  height:${(p) => p.height};
  width:${(p) => p.width};
  border:${(p) => `1px solid ${p.borderColor}`};
  display:flex;
  border-radius:1rem;
  margin:.25rem;
  justify-content:center;
` 
export const BorderContent = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  justify-content:space-around;
  align-items:center;
  margin:2rem;
  width:100%;
`