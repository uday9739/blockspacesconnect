import { TextInputStyles } from "@platform/common";
import styled from "styled-components";

export const Error = styled.div`
position:relative;
display:flex;
flex-direction:column;
align-items:center;
width:74rem;
margin-top:1rem;
margin-bottom: 1rem;
color: #721c24;
background-color: #f8d7da;
border-color: #f5c6cb;
padding: 0.75rem 1.25rem;

border: 1px solid transparent;
border-radius: 0.25rem;
`
export const Container = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  width:74rem;
  margin-top:2.75rem;
`;
export const StepWrapper = styled.div`
  width:100%;
`
export const BillingForm = styled.form`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  width:54rem;
  margin:auto;
`;
export const CheckoutWrapper = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  width:74rem;
  margin-top:1.75rem;
`;
export const CardForm = styled.form`
  width:45rem;
  margin:1.75rem;
`;

export const Card = styled.div.attrs((props: { selected: boolean }) => props)`
 border: 1px solid ${props => props.selected === true ? '#1dafed' : '#e3e7f6'} ;
 padding: 10px;
 min-height: 350px;
 width: 250px;
 display: flex;
 flex-direction: column;
 border-radius: 0.5rem;
 margin: 25px 10px 5px 10px;
 font-size: 1.4375rem;
 `;

export const CardTitle = styled.div`
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  bottom: 0;
  bottom: 0;
  left: 0;
  right: 0;
  h2 {
    font-size: 1.75rem;
    margin: 0;
  }
`
export const CardPrice = styled.div`
display: flex;
align-items: center;
justify-content: flex-start;
flex-direction: column;
`;
export const CardBody = styled.div`
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
flex-grow: 1;
`;
export const CardFooter = styled.div`
display: flex;
align-items: center;
justify-content: flex-end;
flex-direction: column;
`;
export const { Wrap, Input, Label } = TextInputStyles['default'];