import styled from "styled-components";

export const ModalContainer = styled.div`
  display: flex;
  flex-direction:column;
  justify-content:start;
  align-items:center;
  font-family:Lato;
  width: 43.5rem;
  height: 32.15rem;
  box-shadow: 0px 0px .625rem .125rem #E7EBFF;
  border-radius: 12px;
  padding:2rem;
  background-color:white;
`
export const Row = styled.div<{gap?:string}>`
  display:flex;
  flex-direction:row;
  justify-content:space-between;
  align-items: start;
  gap: ${p => p.gap ? p.gap : '2rem'};
  width:100%;
`
export const PayForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height:100%;
  width:90%;
`

export const PayTitle = styled.h1`
  font-size:1.75rem;
  font-weight:400;
  letter-spacing:0.12rem;
`
export const Text = styled.p<{size?:string, decoration?:string, weight?:string, textStyle?:string}>`
  font-size: ${p => p.size ? p.size : '1rem'};
  text-decoration: ${p => p.decoration ? p.decoration : 'default'};
  padding:0;
  margin:0;
  font-weight:${p => p.weight ? p.weight : 'normal'};
  font-style:${p => p.textStyle ? p.textStyle : 'normal'};
`
export const MemoContainer = styled.span`
  overflow:hidden;
  text-overflow:ellipses;
`;

export const TitleContainer = styled.div`
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  align-items:center;
  font-family:Lato;
  gap:1rem;
  padding:0 0 2rem 0;
`

export const DropdownContainer = styled.div`
  width: 50%;
`