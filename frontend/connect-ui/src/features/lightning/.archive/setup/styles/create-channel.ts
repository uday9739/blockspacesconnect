import styled from "styled-components";
const CreateChannel = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
`
export default CreateChannel

export const Body = styled.div`
  display:flex;
  flex-direction:column;
  width:34rem;
  background:#FFFFFF;
  padding: 2rem 1.5rem 1.5rem;
  border: 1px solid #DFD7E9;
  border-radius: 12px;
  box-shadow: 0px 2px 57px rgba(206, 173, 249, 0.24);
`

export const Title = styled.h4`
  margin-bottom:.75rem;
  text-align:center;
  letter-spacing:1.2px;
  font-size:1.3125rem;
  font-weight:600;
`

export const Subtitle = styled.p`
  margin-bottom:1.25rem;
  text-align:center;
  line-height:1.4375rem;
  font-size:.9375rem;
  letter-spacing:.4px;
`