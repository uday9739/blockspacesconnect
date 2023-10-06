import styled from "styled-components";

export const StyledBillingInfo = styled.div`
  display:flex;
  flex:1;
  flex-direction:column;
  padding: 1rem;
  overflow:auto;
`

export const BillingForm = styled.form`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  margin:.25rem 0;
  border:1px solid ${p => p.theme.lightBlue};
  border-radius:.75rem;
  padding: 1rem;
`;

export const FormTitle = styled.h4`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items:center;
  height:3.125rem;
  width:100%;
  padding: 0 .5rem;
  margin-bottom:.875rem;
  letter-spacing:.08rem;
  font-weight:400;
  font-size:1.25rem;
  text-align:left;

`