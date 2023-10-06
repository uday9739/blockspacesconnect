import styled from "styled-components";

export const StyledResourcesDropdown = styled.div`
  position:relative;
  align-self:center;
  height:2.25rem;
  z-index:2;
`

export const DropdownLabel = styled.div`
  display:flex;
  align-items:center;
  align-self:center;
  color:black;
  text-decoration:none;
  border:1px solid ${p => p.theme.lighterBlue};
  border-radius:1.125rem;
  height:2.25rem;
  margin: 0 .1875rem;
  padding: 0 3.25rem;
  font-size:.9375rem;
  cursor:pointer;
  transition:125ms ease-out;
  &:hover {
    color:${p => p.theme.bscBlue};
    border:1px solid ${p => p.theme.bscBlue};
    background:${p => p.theme.bscBlue}05;
  }
`

export const Dropdown = styled.div`
  position:absolute;
  top:-.25rem;
  left:50%;
  display:flex;
  flex-direction: column;
  background:${p => p.theme.white};
  border-radius:.625rem;
  box-shadow:${p => p.theme.mediumBoxShadow};
  transform:translate(-50%, 0);
  z-index:1;
`

export const CategoryLabel = styled.div`
    line-height:2.25rem;
    padding:0 .875rem;
    cursor:default;
`

export const CategoryDropdown = styled.div`
  display:none;
  position:absolute;
  flex-direction:column;
  left:calc(100% - .25rem);
  top:-.125rem;
  width:14rem;
  background:${p => p.theme.white};
  border-radius:.625rem;
  box-shadow:${p => p.theme.mediumBoxShadow};
  z-index:0;
`

export const Category = styled.div`
  position:relative;
  width:14rem;
  border-bottom:1px solid ${p => p.theme.lighterBlue};
  &:last-of-type { 
    border-bottom:none;
  }
  &:hover {
    ${CategoryLabel}{
      background:${p => p.theme.lighterBlue}
    }
    ${CategoryDropdown}{
      display:flex;
    }
  }
`

export const DropdownOption = styled.a`
  display:flex;
  align-items:center;
  cursor:pointer;
  min-height:2.475rem;
  padding:.5rem .875rem;
  border-bottom:1px solid ${p => p.theme.lighterBlue};
  text-decoration:none;
  color:#000;
  line-height:1.4375rem;
  &:first-of-type {
    border-top-right-radius:.625rem;
    border-top-left-radius:.625rem;
  }
  &:last-of-type { 
    border-bottom:none;
    border-bottom-right-radius:.625rem;
    border-bottom-left-radius:.625rem;
  }
  &:hover {
    background:${p => p.theme.lighterBlue}
  }
`