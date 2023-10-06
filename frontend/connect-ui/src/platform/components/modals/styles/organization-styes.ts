import styled from "styled-components";

export const Title = styled.h1`
  font-size:1.75rem;
  font-weight:400;
  letter-spacing:0.12rem;
`
export const ModalContainer = styled.div`
  display: flex;
  flex-direction:column;
  justify-content:start;
  align-items:center;
  font-family:Lato;
  width: 60rem;
  height: 50rem;
  box-shadow: 0px 0px .625rem .125rem #E7EBFF;
  border-radius: 12px;
  padding:2rem 1rem 1rem 1rem;
  background-color:white;
`
export const Row = styled.div<{
    position:number,
    columns:string,
    height:number
  }>`
  display:grid;
  grid-template-columns: ${p => p.columns};
  grid-row: ${p => p.position + 2};
  grid-column: 1/-1;
  height:${p => p.height}rem;
  border:1px solid #D8DCF055;
  border-radius:.75rem;
  margin: 0 0 -1px;
  cursor:pointer;
  &:hover {
    border:1px solid #D8DCF0;
    z-index: 1;
  }
  gap:0.1rem;
  align-items:center;
  padding:0 1rem 0 1rem;
`
export const StyledOrgTable = styled.div<{ columns:string, rows:string }>`
  position: relative;
  display: grid;
  width: 100%;

  height:auto;
  background:white;
  padding: 0 .625rem .625rem;
  margin: .75rem 0;
  border:1px solid #d8dcf0;
  border-radius:.5rem;
  grid-template-columns: ${p => p.columns};
  grid-template-rows: ${p => p.rows};
`
export const Column = styled.div`
  position:relative;
  flex:1;
  display:flex;
  flex-direction:column;
  min-width:0;
  &:first-of-type { margin-right: 1.25rem }
  &:last-of-type { margin-right:0 }
`
export const Header = styled.div<{ columns:string }>`
  display:grid;
  grid-template-columns: ${p => p.columns};
  grid-row: 0;
  grid-column: 1/-1;
  margin: .5rem 0 .25rem;
  border-bottom:1px solid #f9fafd;
  padding: 0 0 0 0.7rem;
`

export const ColumnLabel = styled.div<{ position:number, alignment:string }>`
  grid-area: 1 / ${p => p.position};
  align-self:center;
  justify-self:${p => p.alignment};
  font-family:'Roboto Mono';
  font-size:.9375rem;
  letter-spacing:.08rem;
  opacity:.5;
`

export const TitleContainer = styled.div`
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  align-items:center;
  font-family:Lato;
  gap:1rem;
  padding:0 0 2rem 0;
`

export const RowText = styled.p`
  margin: 0;
  padding: 0.2rem;
  max-width: 100%;
  min-width: 100%;
  font-size: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`