import styled from "styled-components";

const WelcomeValue = styled.div<{ visible:boolean }>`
  position:absolute;
  left:50%;
  top:50%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  width:80rem;
  max-width:calc(100% - 2.25rem);
  background:#FFFFFF;
  padding: 3.75rem 0 3rem;
  margin-top:-3.5rem;
  border: 1px solid #A9ACEB;
  box-shadow: 0px .0625rem 3rem rgba(88, 100, 229, 0.24);
  border-radius: .75rem;
  opacity:0;
  transform:translate(-50%, -50%);
  overflow:hidden;
  transition: 
    margin 500ms 50ms ease-out,
    opacity 500ms 50ms ease-out;
  ${p => p.visible && `
    opacity:1;
    margin-top:-3rem;
  `}
`

export default WelcomeValue

export const ValueWrap = styled.div`
  display:flex;
  width:calc(100% - 8rem);
  margin: 3.25rem 0 2.5rem;
  border: 1px solid #A9ACEB44;
  border-radius:.75rem;
`

export const ValueProp = styled.div`
  flex:1;
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  padding: 3rem 0;
  &:first-of-type {
    &:before {
      content:'';
      position:absolute;
      top:-.875rem;
      right:0;
      width:1px;
      height:55.4%;
      background:#A9ACEB44;
      transform:rotate(-25deg);
    }
    &:after {
      content:'';
      position:absolute;
      bottom:-.875rem;
      right:0;
      width:1px;
      height:55.4%;
      background:#A9ACEB44;
      transform:rotate(25deg);
    }
  }
`

export const ValueTitle = styled.h5`
  font-size:1.875rem;
`

export const TagLine = styled.p`
  font-size:1.25rem;
  line-height:1.625rem;
`

export const ListTitle = styled.p`
  margin: .75rem 0 .5rem;
  font-style:italic;
  letter-spacing:.0625rem;
  font-size:1.1875rem;
`
export const ListLabel = styled.p`
  margin-bottom:.5rem;
  font-size:.9375rem;
  font-weight:300;
  letter-spacing:.0625rem;
  font-style:italic;
`
export const ListItem = styled.p`
  margin: .25rem 0;
  font-size:1.125rem;
`

export const ValueSummary = styled.p`
  margin-top:1.75rem;
  line-height:2rem;
  text-align:center;
`