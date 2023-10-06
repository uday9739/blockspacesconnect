import styled from "styled-components";

export const BillingSectionTitle = styled.h1`
  margin: auto;
`;

export const BillingSection = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  margin: 20px;
  background: #fff;
  box-shadow: ${(p) => p.theme.mediumBoxShadow};
  border-radius: 1.875rem;

  &:first-child {
    margin-top: 30px;
  }
`;

export const PillContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: start;
  min-height: 5rem;
  width: 100%;
  border: 1px solid ${(p) => p.theme.lighterBlue};
  padding: 5px;
  border-radius: 0.75rem;
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0px;
  }
`;

export const BillingSectionHeader = styled.div`
  display: flex;
  height: 3.75rem;
  background: linear-gradient(270deg, #fbfcff 20%, #fefeff 50%, #fbfcff 80%);
  width: 100%;
  justify-content: center;
  border-top-right-radius: 1.875rem;
  border-top-left-radius: 1.875rem;
`;
export const BillingSectionBody = styled.div`
  width: 100%;
  padding: 20px;
`;
