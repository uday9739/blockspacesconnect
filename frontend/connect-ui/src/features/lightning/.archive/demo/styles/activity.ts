import styled from "styled-components";
const Activity = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  background:#180931;
  height:100%;
  margin-right:1rem;
  border:1px solid #7B1AF7;
  border-radius:.75rem;
  border-top-left-radius:2rem;
  border-bottom-left-radius:2rem;
  box-shadow: 0px .0625rem .625rem rgba(143, 27, 247, 0.45);
`
export default Activity

export const SectionTitle = styled.h6`
  margin: 1.75rem 0 0 0;
  color:#FFFFFF88;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.875rem;
`

export const WalletBalance = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:19rem;
  min-height:4.125rem;
  height:4.125rem;
  margin: 1.6875rem 1.125rem .875rem;
  background:#180931;
  border:1px solid #7B1AF7;
  border-radius:2.5rem;
`

export const Label = styled.div`
  position:absolute;
  top:0;
  padding: 0 .75rem;
  background:#180931;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.75rem;
  color:#FFFFFF88;
  transform:translate(0, -50%);
`
export const Quantity = styled.div`
  font-size:1.4375rem;
  font-weight:500;
  letter-spacing:.0625rem;
  span {
    margin-right:.25rem;
    font-weight:400;
  }
`

export const ConversionAmt = styled.div`
  position:absolute;
  bottom:0;
  padding: 0 .75rem;
  background:#180931;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.75rem;
  color:#FFFFFF88;
  transform:translate(0, 50%);
`

export const WalletActions = styled.div`
  display:flex;
  width:19rem;
`

export const Action = styled.button`
  flex:1;
  height:2.5rem;
  background:transparent;
  border:1px solid #7B1AF755;
  cursor:pointer;
  border-radius:1.375rem;
  color:#FFFFFF77;
  letter-spacing:.125rem;
  font-weight:300;
  font-size:.6875rem;
  transition:all 150ms ease-out;
  &:focus, &:hover {
    border-color: #7B1AF7;
    color:#FFFFFF;
  }
  &:first-of-type { margin-right:.75rem}
`

export const Transactions = styled.div`
  width:100%;
  margin-top:1.25rem;
  background:#17082F;
  border-top:1px solid rgba(0,0,0,.3);
  overflow:hidden;
  border-radius:.25rem;
  border-bottom-right-radius:1rem;
  border-bottom-left-radius:2rem;
`


export const SendInvoice = styled.button`
  flex:1;
  height:2.5rem;
  background:transparent;
  border:1px solid #7B1AF755;
  cursor:pointer;
  border-radius:1.375rem;
  color:#FFFFFF77;
  letter-spacing:.125rem;
  font-weight:300;
  font-size:.6875rem;
  transition:all 150ms ease-out;
  &:focus, &:hover {
    border-color: #7B1AF7;
    color:#FFFFFF;
  }
`

export const ModalBody = styled.div`
  position:absolute;
  left:50%;
  top:50%;
  display:flex;
  flex-direction:column;
  align-items:center;
  background:#180931;
  padding: 0 2rem;
  border:1px solid #7b1af7;
  border-radius:2rem;
  transform:translate(-50%, -50%);
  box-shadow: 0px .0625rem .625rem rgba(143, 27, 247, 0.45);
`
export const ModalTitle = styled.div`
  margin: 1.5rem 0 .875rem;
  font-size:1.5rem;
  color:white;
`
export const ModalForm = styled.form`
  display:flex;
  flex-direction:column;
  align-items:center;
  margin-bottom:2.25rem;
`

export const ModalInputWrap = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:24rem;
  height:4.125rem;
  margin: .5rem 1.125rem;
  background:#180931;
  border:1px solid #7b1af7;
  border-radius:2.5rem;
  z-index:1;
`
export const ModalInputLabel = styled.div`
  position:absolute;
  top:0;
  left:2rem;
  width:0;
  padding:0;
  
  background:#180931;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.75rem;
  color:#FFFFFF88;
  transform:translate(0, -50%);
  opacity:0;
  overflow:hidden;
  transition: all 100ms ease-out;
  &[data-visible="true"]{
    width:auto;
    padding: 0 .75rem;
    opacity:1;
  }
`

export const ModalInputCurrency = styled.div`
  position:absolute;
  right:2.25rem;
  pointer-events:none;
  color:#8c859955;
  font-size:.875rem;
`
export const ModalInput = styled.input`
  width:100%;
  height:100%;
  padding: 0 2.625rem;
  background:transparent;
  border:none;
  outline:none;
  font-size:1.25rem;
  color:white;
  &::placeholder {
    color:#8c859955;
    letter-spacing:.125rem;
    font-size:1.125rem;
  }
`
export const ModalInputConversionAmt = styled.div`
  position:absolute;
  bottom:0;
  width:0;
  padding: 0;
  background:#180931;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.75rem;
  color:#FFFFFF88;
  transform:translate(0, 50%);
  opacity:0;
  overflow:hidden;
  &[data-visible="true"]{
    padding: 0 .75rem;
    width:auto;
    opacity:1;
  }
`

export const ModalSubmit = styled.button`
  width:24rem;
  height:3.75rem;
  margin:.75rem 0;
  border-radius:50px;
  font-size:.9375rem;
  letter-spacing:1.7px;
  cursor:pointer;
  transition:all 100ms ease-out;

  box-shadow: none;
  background: linear-gradient(150deg, #8659E5 35%, #be19f7 100%);
  background-size: 300% 300%;
  animation: submitting-button 4s ease infinite;
  z-index:1;

  border:none;
  color:#FFFFFF;
  outline:none;
  &:hover,
  &:focus {
    border:2px solid #FFFFFF55;
    box-shadow: 0px 1px 12px #be19f777;
  }
  &[disabled]{
    box-shadow:none;
    opacity:.3;
    cursor:default;
  }
`

export const QRCodeCopy = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:26rem;
  height:4.125rem;
  padding: 0 1.875rem;
  margin: 2.5rem 2.5rem 2.125rem;
  background:#180931;
  border:1px solid;
  border-radius:2.5rem;
  z-index:1;
  color:white;
  text-align:center;
  cursor:pointer;
  border-color:#360e6c;
  &:hover {
    border-color:#7b1af7;
  }
  span { 
    width:100%;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
`

export const QRCodeConfirm = styled.div`
  position:absolute;
  bottom:6.75rem;
  color:white;
  opacity:0;
  transition:150ms ease-out;
  &[data-visible="true"]{
    opacity:1;
  }
`