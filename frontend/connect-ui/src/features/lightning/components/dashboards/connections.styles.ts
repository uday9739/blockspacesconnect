import styled from "styled-components";

export const StyledConnections = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 74rem;
  max-width: calc(100% - 5.5rem);
`
export const Body = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: .75rem 0;
  padding: 0;
  background: #fff;
  border: 1px solid #d8dcf0;
  border-radius:.5rem;
`
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 4.25rem;
  padding: 0 2.25rem;
  margin: 1.5rem 0;
  .select-range {
    position: absolute;
    right: 0;
  }
`
export const Title = styled.h4`
  font-weight: 400;
  font-size: 1.625rem;
  letter-spacing: 0.3rem;
`

export const ConnectionPanel = styled.div`
  display: grid;
  width:calc(100% - 2rem);
  margin:.5rem 0 1.5rem;
  grid-template-columns: 1fr; 
  grid-template-rows: 8rem 8rem 8rem 8rem;
  grid-gap: 1rem;
`

export const ConnectionPlaceholder = styled.div`
  background:#FBF9FD;
  border:1px solid #F6F1F6;
  border-radius:1.25rem;
`