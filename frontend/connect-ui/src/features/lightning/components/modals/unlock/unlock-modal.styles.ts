import styled from "styled-components";

export const ModalContainer = styled.div`
  display: flex;
  flex-direction:column;
  justify-content:space-between;
  align-items:center;
  font-family:Lato;
  width: 43.5rem;
  height: 32.15rem;
  box-shadow: 0px 0px .625rem .125rem #E7EBFF;
  border-radius: 12px;
  padding:2rem;
`

export const SetPasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`

export const UnlockTitle = styled.h1`
  font-size:1.75rem;
  font-weight:400;
  letter-spacing:0.12rem;
`
export const UnlockSubtitle = styled.h2`
  font-size:1rem;
  font-weight:400;
  color:#777777;
  padding-top:.325rem;
`

export const TitleContainer = styled.div`
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  align-items:center;
  font-family:Lato;
`
export const Spacer = styled.div<{height?:string}>`
  height:${p => p.height ? p.height: 1}rem;
`