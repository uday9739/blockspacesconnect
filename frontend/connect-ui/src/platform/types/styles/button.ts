import { StyledComponent } from 'styled-components'
type ButtonStyle = {
  Button:StyledComponent<"button", any, { submitting?:boolean }>;
  IconWrap?:StyledComponent<"div", any, {}>;
  Label?:StyledComponent<"div", any, {}>;
}
export default ButtonStyle