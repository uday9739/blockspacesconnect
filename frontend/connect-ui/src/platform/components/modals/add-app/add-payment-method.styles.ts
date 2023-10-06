import styled from "styled-components";

export const StyledAddPaymentMethod = styled.div`
  display:flex;
  flex-direction:column;
  padding: .75rem;
  overflow:auto;
`

export const AddPaymentContainer = styled.div`
  position:relative;
  flex-direction:column;
  align-items:center;
  margin:.25rem 0;
  border:1px solid ${p => p.theme.lightBlue};
  border-radius:.75rem;
  padding: 1rem;
  iframe { width:100% }
`

export const AddPaymentForm = styled.form`
  position:relative;
  flex-direction:column;
  align-items:center;
  margin:.25rem 0;
  border:1px solid ${p => p.theme.lightBlue};
  border-radius:.75rem;
  padding: 1rem;
  iframe { width:100% }
`

export const CardNumberInput = styled.div`
  border:1px solid ${p => p.theme.lightBlue};
  border-radius:1rem;
  width:100%;
  height:4.25rem;
  padding:0 1.25rem;
`