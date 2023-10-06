import styled from "styled-components";

export const IconButton = ({ Icon, onClick = null}) => {
  const Button = styled.button`
    width: 2rem;
    height: 2rem;
    border:none;
    border-radius: 5rem;
    line-height: 0px;
    background:none;
    align-items:center;
    padding:0;
  `;

  const iconStyle = {
    color: '#abb2f2',
    height: '2rem',
    width: '2rem',
    borderRadius: "5rem",
    // border: "1px solid #d8dcf0",
    cursor: 'pointer',
    // boxShadow: '0px 2px 0px rgba(231, 235, 255, 0.41)',
    transition: 'all 150ms ease-in',
    '&:hover': {
      color: '#5665e5'
    }
  };
  
  return (
    <Button onClick={onClick}>
      <Icon sx={iconStyle} />
    </Button>
  )
}