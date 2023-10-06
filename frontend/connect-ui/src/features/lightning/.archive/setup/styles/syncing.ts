import styled from "styled-components";
const Syncing = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
`
export default Syncing

export const Body = styled.form`
  display:flex;
  flex-direction:column;
  width:28rem;
  background:#FFFFFF;
  padding: 2rem 2.5rem 1.5rem;
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
  line-height:1.5rem;
  font-size:1.0625rem;
  letter-spacing:.4px;
`

export const SyncProgress = styled.div``
export const ProgressBarWrap = styled.div`
  position:relative;
  width:100%;
  height:.75rem;
  background: #DFD7E9;
  border-radius: 4px;
  overflow:hidden;
`
export const ProgressBar = styled.div`
  position:absolute;
  left:0;
  height:100%;
  background: linear-gradient(96.75deg, #7B1AF7 17.51%, #BE1AF7 90.22%);
  box-shadow: 0px 2px 12px rgba(29, 175, 237, 0.25);

  transition:1000ms ease-out;
`
export const ProgressPCT = styled.div`
  text-align:center;
  margin: 1.25rem 0 .5rem;
  font-size:1.25rem;
`

export const Continue = styled.button`
  width:100%;
  height:3rem;
  margin: 0 0 .5rem;
  border-radius:50px;
  font-size:.9375rem;
  letter-spacing:1.7px;
  cursor:pointer;
  transition:all 100ms ease-out;
  box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
  background: linear-gradient(150deg, #8659E5 35%, #be19f7 100%);
  background-size: 300% 300%;
  animation: submitting-button 4s ease infinite;
  z-index:1;
  border:2px solid transparent;
  color:#FFFFFF;
  outline:none;
  &:hover,
  &:focus {
    box-shadow: 0px 1px 12px #be19f777;
  }
`