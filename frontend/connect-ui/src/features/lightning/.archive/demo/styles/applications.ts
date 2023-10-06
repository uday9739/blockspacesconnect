import styled from "styled-components";
const Applications = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  margin-top:.75rem;
  background:#180931;
  border:1px solid #7B1AF7;
  border-radius:.75rem;
  border-bottom-right-radius:2rem;
  box-shadow: 0px .0625rem .625rem rgba(143, 27, 247, 0.45);
`
export default Applications

export const SectionTitle = styled.h6`
  margin: 1.75rem 0 0 0;
  color:#FFFFFF88;
  font-weight:300;
  letter-spacing:.0625rem;
  font-size:.875rem;
`

export const Apps = styled.div`
  flex:1;
  display:flex;
  align-items:center;
  justify-content:flex-start;
  width:100%;
  padding:0 1.375rem;
`
export const App = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  width:4.875rem;
  height:4.875rem;
  margin: 0 1.125rem;
  border:1px solid #7B1AF7;
  border-radius:.75rem;
  transform:rotate(45deg);
  transition:100ms ease-out;
  cursor:pointer;
  opacity:.7;
  svg {
    transform:rotate(45deg);
    transition:100ms ease-out;
    .fill-primary {
      fill:#7B1AF777;
    }
  }
  &:hover {
    opacity:1;
    .fill-primary {
      fill:#7B1AF7;
    }
  }

`

export const AddApp = styled.button`
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  width:5.125rem;
  height:5.125rem;
  background:transparent;
  margin: 0 1.125rem;
  border:1px solid #360e6c;
  border-radius:.75rem;
  transform:rotate(45deg);
  transition:100ms ease-out;
  cursor:pointer;
  svg {
    transform:rotate(45deg);
    transition:100ms ease-out;
    .fill-primary {
      fill:#7B1AF777;
    }
  }
  &:hover {
    border-color:#7B1AF7;
    .fill-primary {
      fill:#7B1AF7;
    }
  }

`
export const AppLogo = styled.img`
  position:relative;
  max-width:70%;
  max-height:70%;
  transform:rotate(-45deg);
`