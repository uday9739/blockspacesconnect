import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Roboto Mono";
  // height: 100%;
`;

export const Text = styled.p`
  font-size: 2rem;
  font-weight: 300;
`;

export const CompanyName = styled.div`
  width: 100%;
  color: #323656;
  opacity: 50%;
  font-size: 2rem;
  border-bottom: 1px solid #323656;
  padding: 2rem 0 1rem 0;
  letter-spacing: 0.5rem;
  @media (max-width: 950px) {
    padding: 4rem 0 3rem 0;
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: "Roboto Mono";
  border-radius: 25px;
  padding: 4rem;
  width: 40%;
  min-height: 750px;
  box-shadow: 0px 5rem 5rem #f0eeee;
  border: 1px solid #f0eeee;
  font-size: 2rem;
  @media (max-width: 950px) {
    font-size: 2.5rem;
    border-radius: 10px;
    width: 90%;
  }
`;

export const LineItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
`;

export const Item = styled.p`
  margin: 0;
`;

export const Total = styled.p`
  font-size: 6rem;
  font-weight: bold;
`;

export const Button = styled.button`
  background-color: #891af8;
  border-radius: 65px;
  color: #ffffff;
  border: none;
  padding: 3rem;
  width: 100%;
  @media (min-width: 950px) {
    width: 75%;
  }
  :hover {
    cursor: pointer;
  }
`;

export const Footer = styled.p`
  position: fixed;
  bottom: 0;
  font-size: 2rem;
  width: 100%;
  padding-top: 2rem;
  border-top: 1px solid rgba(50, 54, 86, 0.25);
  text-align: center;
`;

export const ActionButton = styled.p`
  width: 25%;
  opacity: 50%;
  font-size: 1.5rem;
  text-align: center;
  cursor: pointer;
`;

export const QRCodeCopy = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:26rem;
  height:4.125rem;
  padding: 0 1.875rem;
  background:white;
  border:1px solid;
  border-radius:2.5rem;
  z-index:1;
  color:#180931;
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