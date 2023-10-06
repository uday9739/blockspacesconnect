import styled from "styled-components";
const FundWallet = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
`
export default FundWallet

export const Body = styled.div`
  display:flex;
  flex-direction:column;
  width:34rem;
  background:#FFFFFF;
  padding: 2rem 1.5rem 1.5rem;
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
  line-height:1.4375rem;
  font-size:.9375rem;
  letter-spacing:.4px;
`

export const FundingMenu = styled.div`
  border:1px solid #DFD7E9;
  border-radius:12px;
`

export const MenuOptions = styled.div`
  display:flex;
  justify-content:center;
  height:2.875rem;
  border-bottom:1px solid #f0f0f5;
`
export const Option = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  height:100%;
  padding: 0 .5rem;
  margin: 0 .25rem;
  opacity:.3;
  letter-spacing:1px;
  font-size:.875rem;
  cursor:pointer;
  &:hover {
    opacity:.8;
  }
  &[data-selected="true"]{
    opacity:1;
    cursor:default;
    &:after {
      content:'';
      position:absolute;
      width:100%;
      height:100%;
      top:0;
      left:0;
      background: linear-gradient(0, #696FE2 5%, rgba(184, 165, 240, 0.21) 4%, rgba(198, 165, 240, 0) 20%);
    }
  }

`

export const BuyForm = styled.form`
  display:flex;
  flex-direction:column;
  align-items:center;
  padding: 1.5rem 2.75rem 1.75rem;
`

export const FormDescription = styled.p`
  margin: 0 auto 1.25rem;
  text-align:center;
  font-size:.9375rem;
`
export const Row = styled.div`
  position:relative;
  display:flex;
  height:2.5rem;
  width:100%;
  margin-bottom:1.25rem;
`

export const Column = styled.div`
  position:relative;
  flex:1;
  display:flex;
  flex-direction:column;
  min-width:0;
`

export const PurchaseBTC = styled.button`
  width:100%;
  height:3rem;
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
  &[disabled]{
    box-shadow:none;
    opacity:.3;
    cursor:default;
  }
`

// export const CurrencySymbol = styled.span`
//   position:absolute;
//   display:flex;
//   justify-content:center;
//   left:0rem;
//   width:2rem;
//   height:100%;
//   font-size:1rem;
//   line-height:2.375rem;
//   letter-spacing:.7px;
//   pointer-events:none;
// `

export const Currency = styled.span`
  position:absolute;
  right:.75rem;
  display:flex;
  align-items:center;
  height:100%;
  color:#999bab;
  font-size:.875rem;
  letter-spacing:.7px;
  pointer-events:none;
`

export const TextInput = styled.input`
  flex:1;
  height:100%;
  color:#323656;
  padding: 0 1rem;
  background:#FFF;
  border:1px solid #E7EBFF;
  border-radius: 4px;
  outline:none;
  font-size:1.0625rem;
  transition:all 150ms ease-out;
  &[data-empty="true"]{
    background:#fcfcff;
    border:1px solid #b5b9ee;
  }
  &:hover {
    background:#FFF;
    border: 1px solid #5665E5AA;
  }
  &:focus {
    background:#FFF;
    border: 1px solid #5665E5;
    box-sizing: border-box;
    box-shadow: 0px 1px 3px rgba(86, 101, 229, 0.48);
  }
  &::placeholder {
    color:#999bab;
    font-size: 0.875rem;
    letter-spacing:1.7px;
  }
  &[disabled]{
    background:#fcfcff;
    &:hover {
      border:1px solid #E7EBFF;
    }
  }
`

export const ArrowIcon = styled.div`
  width:2.875rem;
  svg { width:100%; }
  .fill-primary {
    fill:#EDE7F3;
  }
`

export const SkipForNow = styled.button`
  flex:1;
  min-height:3rem;
  width:80%;
  margin: 1.25rem auto 0;
  background:#FFF;
  border:1px solid #E7EBFF;
  border-radius:50px;
  box-shadow: 0px 2px 0px rgba(231, 235, 255, 0.41);
  font-size:.9375rem;
  letter-spacing:1.7px;
  color:#abb2f2;
  cursor:pointer;
  outline:none;
  transition: all 150ms ease-out;
  &:hover,
  &:focus {
    border:1px solid #5665E5;
    color:#5665E5;
  }
  &[disabled]{
    opacity:.3;
    cursor:default;
  }
`