import styled from "styled-components";
const Lightning = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  background:${props => props.theme.palette.background.default};
  width:100%;
  height:100%;
`
export default Lightning

export const SetupProgress = styled.div`
  position:relative;
  display:flex;
  height:7.75rem;
  margin-top:2.125rem;
  &:before {
    content:'';
    top: 2.75rem;
    left:calc(50% - 12rem);
    position:absolute;
    width:calc(100% - 8rem);
    border-top:1px dashed #EDE7F3;
  }
`

export const SectionHeader = styled.h2`
  margin: 3rem 0 2rem;
  font-weight:200;
  opacity:.35;
  font-size:1.625rem;
  letter-spacing:12px;
`

export const Step = styled.div`
  display:flex;
  flex-direction:column;
  height:100%;
  width:8rem;
`
export const Node = styled.div`
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
`

export const Icon = styled.div`
  position:relative;
  background:#EDE7F3;
  width:1.25rem;
  height:1.25rem;
  border-radius:100%;
  [data-touched-setup-step="true"] & {
    width:2.75rem;
    height:2.75rem;
    border-radius: 4px;
    transform: rotate(-45deg);
    svg {
      transform: rotate(45deg);
    }
  }
  [data-active-step="true"] & {
    background: #7B1AF7;
    box-shadow: 0px 2px 7px rgba(123, 26, 247, 0.25);
  }
  .fill-primary {
    fill:#FFFFFF;
  }
`


export const Label = styled.div`
  height:2.25rem;
  text-align:center;
  font-size:.75rem;
  font-weight:500;
  letter-spacing:1px;
  line-height:1.125rem;
  color:#DAC8EC;
  [data-active-step="true"] & {
    color: #7B1AF7;
  }
`
