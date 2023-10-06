import styled from "styled-components";

const NetworkInfo = styled.div`
  display:flex;
  position:relative;
  flex-direction:column;
  width:calc(100% - 5rem);
  max-width:74rem;
  height:calc(100% - 5rem);
  max-height:54rem;
  background:${props => props.theme.palette.background.default};
  border: 1px solid ${props => props.theme.heavyBorder};
  border-radius:8px;
  overflow:auto;
`

export default NetworkInfo