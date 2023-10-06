import styled from "styled-components"

const GettingStarted = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  width:100%;
`
export default GettingStarted;

export const SectionHeader = styled.h2`
  margin: 4.125rem 0 1.25rem;
  font-size:1.875rem;
  font-weight:600;
  letter-spacing:.3px;
`

export const SectionDescription = styled.p`
  font-size:1.125rem;
  letter-spacing:1.1px;
`

export const Steps = styled.div`
  display:flex;
  justify-content:center;
  align-items:flex-start;
`

export const Step = styled.div`
  position:relative;
  width:15rem;
  margin: 2.75rem 1.125rem 2rem;
`

export const StepImage = styled.div`
  width:100%;
  height:10.5rem;
  border:1px solid #D8DCF0;
  border-radius:8px;
`
export const StepDescription = styled.div`
  margin: 1.125rem;
  font-size:.875rem;
  text-align:center;
`

export const SelectNetwork = styled.button`
  width:18rem;
  height:3.25rem;
  background:#f4f4fe;
  border:1px solid #E7EBFF;
  border-radius:50px;
  box-shadow:none;
  font-size:.9375rem;
  letter-spacing:1.7px;
  cursor:pointer;
  transition:all 100ms ease-out;

  box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
  background: linear-gradient(150deg, #8659E5 35%, #1D8AED 100%);
  background-size: 300% 300%;
  animation: submitting-button 4s ease infinite;
  
  border:2px solid transparent;
  color:#FFFFFF;
  outline:none;
  &:hover,
  &:focus {
    box-shadow: 0px 1px 12px rgba(66, 0, 255, 0.55);
  }
`