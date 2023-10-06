import styled from "styled-components";
const Invoices = styled.div`
  flex:1;
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  height:100%;
  background:#1b0c36;
  overflow:hidden;
`
export default Invoices

export const Filters = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  position:absolute;
  top:0;
  height:3.25rem;
  width:100%;
  background:#180931;
  border-bottom:1px solid black;
  box-shadow: 0 0 .125rem rgba(0,0,0,.5);
  z-index:1;
  
  
`
export const Filter = styled.div`
  margin:0 .75rem;
  letter-spacing:.0625rem;
  font-size:.9375rem;
  opacity:.6;
  cursor:pointer;
  &:hover, &:focus {
    opacity:.8;
  }
  &[data-selected="true"]{
    opacity:1;
    cursor:default;
  }
`

export const InvoiceList = styled.div`
  padding-top:3rem;
  background:#180931;
  overflow:scroll;
`