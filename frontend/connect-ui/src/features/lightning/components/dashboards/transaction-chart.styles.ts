import styled from 'styled-components'

export const Styles = {
  Dashboard: styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 74rem;
    max-width: calc(100% - 5.5rem);
  `,

  ChartWrap: styled.div`
    position: relative;
    width: calc(100% - 4rem);
    padding: 0 1rem 2.25rem 0;
  `,
  Body: styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 0;
    margin-top:.75rem;
    background: #fff;
    border: 1px solid #d8dcf0;
    border-bottom: 1px solid #edeff9;
    border-radius:.5rem;
  `,
  Header: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 4.25rem;
    padding: 0 2.25rem;
    margin: 2.5rem 0 0.875rem;
    .select-range {
      position: absolute;
      right: 0;
    }
  `,
  Title: styled.h2`
    font-weight: 400;
    font-size: 1.625rem;
    letter-spacing: 0.3rem;
  `,
  ChartSelect: styled.div`
    position: absolute;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 6rem;
    padding: 0.5rem 1.125rem 0.625rem;
    border: 1px solid #f0f2f9;
    border-radius: 3rem;
    transform: translate(-50%, 0);
    button {
      margin-left: 2px;
      margin-right: 2px;
    }
  `,
  SummaryTotals: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.75rem 3.25rem 1.75rem;
  `,
}
