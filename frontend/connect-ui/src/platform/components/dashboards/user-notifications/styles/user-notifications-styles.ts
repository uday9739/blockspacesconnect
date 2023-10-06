import styled from "styled-components"

export const UserNotificationsAlert = styled.div`
  position: absolute;
  z-index: 2;
  right: 7rem;
  width: 5rem;
  height: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 .125rem;
  cursor:pointer;
  transition:100ms ease-out;
  &:hover {
    border-color:#bdc2e4;
  }
`
export const NotificationsList = styled.div`
  position: absolute;
  z-index: 3;
  right: 1rem;
  top: 5rem;
  width: 25rem;
  height: auto;
  max-height: 500px;
  overflow: auto;
  display: flex;
  justify-content: left;
  align-items: flex-start;
  margin: 0 .125rem;
  border: 1px solid black;
  border-radius: 10px;
  cursor:pointer;
  transition:100ms ease-out;
  &:hover {
    border-color:#bdc2e4;
  }
`
