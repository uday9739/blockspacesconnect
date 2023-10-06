import { StyledComponent } from "styled-components"

type TextInputStyles = {
  Body?: StyledComponent<"div", any, {}>;
  Text?: StyledComponent<"div", any, {}>;
  Placeholder?: StyledComponent<"div", any, {}>;
  Wrap: StyledComponent<"div", any, { margin?: string, width?: string }>;
  Input: StyledComponent<"input", any, { error?: boolean }>;
  EditIcon?: StyledComponent<"div", any, {}>;
  EnterIcon?: StyledComponent<"div", any, {}>;
  Label: StyledComponent<"label", any, { error?: boolean }>;
}
export default TextInputStyles