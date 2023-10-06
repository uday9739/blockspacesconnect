import styled from "styled-components";

export const Container = styled.div`
  display:flex;
  justify-content:center;
  align-items:center;
  height:100%;
`

export const Column = styled.div`
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
`

export const Row = styled.div`
  display:flex;
  flex-direction:row;
  justify-content:center;
  align-items:center;
`

export const Title = styled.p`
  color: #aaa;
  margin: 0;
  font-size:1rem;
  padding-bottom:.325rem
  font-family:"Roboto Mono";
`;

export const Active = styled.div<{active:boolean}>`
  width:.6125rem;
  height:.6125rem;
  border-radius:100%;
  margin:0 .25rem;
  background-color:${p => p.active ? "#F00" : "#0F0"}
`