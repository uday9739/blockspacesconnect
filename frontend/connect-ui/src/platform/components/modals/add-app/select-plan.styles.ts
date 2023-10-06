import styled from 'styled-components';

export const StyledSelectPlan = styled.div`
  flex:1;
  display:flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow:auto;
`

export const Plans = styled.div`
  display:flex;
`

export const Labels = styled.div<{ empty?: boolean }>`
  width:${p => p.empty ? '6.25rem' : '9rem'};
  padding: 5rem 0 0;
`

export const Label = styled.div`
  height:2.75rem;
  line-height:2.75rem;
  text-align:right;
  border-top:1px solid ${p => p.theme.lighterBlue};
  font-size:.8125rem;
`

export const Plan = styled.div<{ recommended?: boolean }>`
  width:14.5rem;
  margin: .1875rem .75rem 0;
  padding: 0 .75rem 1.125rem;
  border: 1px solid transparent;
  border-radius:1rem;
  cursor:pointer;
  transition:150ms ease-out;
  ${p => p.recommended ? `
    border-color : #696FE2;
  ` : ``}
  box-shadow:${p => p.theme.slightBoxShadow};
  &:hover {
    margin: 0 .75rem .1875rem;
    border-color :${p => p.theme.bscBlue};
    box-shadow:${p => p.theme.mediumBoxShadow};
  }
`

export const PlanTitle = styled.h4`
  display:flex;
  align-items:center;
  justify-content:center;
  height:4.25rem;
  margin-top:.5rem;
  font-size:1.1875rem;
  letter-spacing:.15;
`

export const PlanDescription = styled.p`
  display:flex;
  align-items:center;
  justify-content:center;
  margin: .5rem 0;
  font-size:.75rem;
`

export const PlanDetails = styled.div`
  display:flex;
  flex-direction:column;
`

export const PlanDetail = styled.div`
  height:2.75rem;
  line-height:2.75rem;
  text-align:center;
  border-top:1px solid ${p => p.theme.lighterBlue};
  font-size:.9375rem;
`

export const CardForm = styled.form`
  width:45rem;
  margin:1.75rem;
`;