import { StyledComponent } from "styled-components"

type PhoneInputStyles = {
  Body?: StyledComponent<"div", any, {}>;
  Text?: StyledComponent<"div", any, {}>;
  Placeholder?: StyledComponent<"div", any, {}>;
  Wrap: StyledComponent<"div", any, { margin?: string, width?: string }>;
  BscPhoneInput: StyledComponent<"div", any, { error: boolean }>;
  EditIcon?: StyledComponent<"div", any, {}>;
  EnterIcon?: StyledComponent<"div", any, {}>;
  Label: StyledComponent<"label", any, { error?: boolean }>;
}
export default PhoneInputStyles