import styled from "styled-components";

export const ModalContainer = styled.div`
  display: flex;
  flex-direction:column;
  justify-content:space-around;
  align-items:center;
  font-family:Lato;
  width: 43.5rem;
  height: 32.15rem;
  box-shadow: 0px 0px .625rem .125rem #E7EBFF;
  border-radius: 12px;
  padding: 2rem 4rem 1rem 4rem;
  background-color:white;
`

export const RequestInboundForm = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin: 1rem;
  gap: 2rem;
  width:35rem;
`

export const Title = styled.h1`
  font-size:1.75rem;
  font-weight:400;
  letter-spacing:0.12rem;
`
export const Subtitle = styled.h2`
  font-size:1.1rem;
  font-weight:400;
  color:#777777;
  padding-top:.325rem;
  text-align: center;
  width:35rem;
`

export const TitleContainer = styled.div`
  flex-wrap:wrap;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  align-items:center;
  font-family:Lato;
  gap:1rem;
`
export const Text = styled.p<{size?:number}>`
  font-size:${p => p.size ? p.size : 1.3}rem;
  text-align: center;
`
export const SkipText = styled.a`
  font-size:1rem;
  text-align:center;
  color:gray;
  text-decoration: underline;
  cursor:pointer;
`

export const Stack = styled.div`
  display:flex;
  flex-direction:column;
  gap:1.0rem;
`

export const Row = styled.div`
  display:flex;
  flex-direction:row;
  align-items:center;
  text-align:center;
  gap:0.5rem;
  width: 90%;
`
export const BigNumber = styled.h5`
  font-size: 3rem;
`

export const SatsNumber = styled.div`
  display:flex;
  flex-direction:row;
  align-items:center;
  text-align:center;
  gap:0.5rem;
  height:1.5rem;
  margin:0;
  padding:0;
`
export const Spacer = styled.div<{height?:string}>`
  height:${p => p.height ? p.height: 1}rem;
`