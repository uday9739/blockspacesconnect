import { StyledComponent } from 'styled-components'
export type SelectStylesType = {
  MenuWrap?:StyledComponent<"div", any, { size:'sm' | 'md' | 'lg' }>;
  MenuContainer?:StyledComponent<"div", any, {}>;
  MenuSelection?:StyledComponent<"div", any, {}>;
  MenuLabel?:StyledComponent<"label", any, {}>;
  DropdownContainerOptions?:StyledComponent<"ul", any, {}>;
  DropdownContainerInput?:StyledComponent<"div", any, {}>;
  DropdownIconSearch?:StyledComponent<"img", any, {}>;
  DropdownInput?:StyledComponent<"input", any, {}>;
  OptionWrap?:StyledComponent<"li", any, {}>;
  OptionIcon?:StyledComponent<"img", any, { checked?:boolean }>;
  OptionLabel?:StyledComponent<"div", any, {}>;
  OptionCheckBox?:StyledComponent<"input", any, {}>;
  OptionContainerLabel?:StyledComponent<"div", any, {}>;
  WrapStage?:StyledComponent<"div", any, {}>;
  Stage?:StyledComponent<"div", any, {}>;
  PillComponent?:StyledComponent<"div", any, {}>;

};