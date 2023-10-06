import styled from 'styled-components'

export const StyledPaymentsTable = styled.div<{ columns:string, rows:string, height: number }>`
  position: relative;
  display: grid;
  width: 74rem;
  max-width: calc(100% - 5.5rem);
  min-height:${p => p.height}rem;
  background:white;
  padding: 0 .625rem .625rem;
  margin: .75rem 0;
  border:1px solid #d8dcf0;
  border-radius:.5rem;
  grid-template-columns: ${p => p.columns};
  grid-template-rows: ${p => p.rows};
`

export const Header = styled.div<{ columns:string }>`
  display:grid;
  grid-template-columns: ${p => p.columns};
  grid-row: 2;
  grid-column: 1/-1;
  margin: .5rem 0 .25rem;
  border-bottom:1px solid #f9fafd;
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

export const Row = styled.div<{
    position:number,
    columns:string,
    height:number
  }>`
  display:grid;
  grid-template-columns: ${p => p.columns};
  grid-row: ${p => p.position + 3};
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
`
export const PageSizeSelectorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  position: absolute;
  width: 20rem;
`

export const PaginationHeader = styled.span`
  position: relative;
  display: flex;
  height:2rem;
  align-items: center;
  font-size: 1.1rem;
  max-width: calc(100% - 5.5rem);
  margin: 1rem;
`
export const PageSizeSelector = styled.select`
  height:2rem;
  type:number;
  width:3rem;
  margin: 0 0 0 0.1rem;
`
export const PageSizeOption = styled.option`
  height:2rem;
  type:number;
  width:3rem;
  margin: 0 0 0 0.1rem;
`

export const PaginationFooter = styled.div`
  height:2rem;
  grid-row: -1;
  font-size: 1.1rem;
  align-items: center;
  margin: 1rem;
  gap: 0.5rem;
`

export const ButtonWrapper = styled.span`
  display: flex;
  position: relative;
  left: 62rem;
`

export const PaginationButton = styled.button`
  background: none;
  border: none;
  padding: none;
  cursor: pointer;
  width: full;
  height: 2.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
`;

export const RowItem = styled.div<{ alignment:string }>`
  align-self: ${p => p.alignment};
  justify-self: center;
`

export const SettleDate = styled.div`
  align-self:center;
  justify-self:center;
  font-weight:300;
  font-size:.9375rem;
`
export const Description = styled.a`
  text-decoration:none;
  color:black;
  align-self:center;
  justify-self:start;
  font-size:1.125rem;
  font-weight:600;
  letter-spacing:.1rem;
`
export const Logo = styled.a`
  align-self:center;
  justify-self:center;
  width:2rem;
  height:2rem;
`
export const Amount = styled.div<{out:boolean}>`
  align-self:center;
  justify-self:center;
  font-family:'Roboto Mono';
  color: ${p => p.out ? "#FF0000" : "#000000"};

  svg {
    margin: -.125rem .25rem;
    height:1rem;
    .fill-primary {
      fill:black;
    }
  }
`

export const Image = styled.img`
  position:relative;
  height:100%;
  width:100%;
`

export const EmptyValue = styled.div`
  align-self:center;
  justify-self:center;
  opacity:.3;
  font-weight:300;
  font-size:.875rem;
`

export const Link = styled.a`
  color: black;
  text-decoration: none;
  align-self:center;
  justify-self:center;
  font-weight:500;
  font-size:2rem;
  padding:.3rem;
`