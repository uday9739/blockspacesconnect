import React from 'react';
import { Styles } from './check-box-styles';
import { Tooltip } from '@platform/common'

type Props = {
  register: any;
  name: string;
  style?: 'default' | 'newDefault' | 'twoFactor' | 'large' | 'lightningSetup';
  label?: string;
  checked?: any;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  size?: number;
  autoFocus?: boolean;
  autoComplete?: string;
  mask?: any;
  maskChar?: string;
  alignment?: string;
  customStyle?: any;
  ref?: any;
  margin?: string;
  width?: string;
  error?: boolean;
  errorMessage?: string;
  setChecked?: any;
  toolTipPlacement?:"top" | "bottom" | "left" | "right" 
  required?: boolean;
}

export function CheckBox({
  style='default',toolTipPlacement="right", name, label, checked, setChecked, register, error, errorMessage, disabled=false, width, customStyle, alignment='right', margin, required=false, ...rest
}: Props) {
  const { CheckBox, Wrap, Label } = Styles;

  const checkBoxComponent = () => {
    const registeredCheckBox = setChecked ? register(name, { setChecked }) : register(name);
    return (
      <CheckBox
        onchange="this.setCustomValidity(validity.valueMissing ? 'Please indicate that you accept the Terms and Conditions' : '');"
        {...registeredCheckBox}
        onClick={(e) => setChecked(!checked)}
        type="checkbox"
        name={name}
        checked={checked}
        style={customStyle}
      />
    );
  }

  return (
    <Wrap>
      <>
        {checkBoxComponent()}
      </>
      {error ?
        <Tooltip forceShow content={errorMessage} placement={toolTipPlacement}>
          <Label data-alignment={alignment} error={error} data-visible={error}>{label}</Label>
        </Tooltip>
        :
        <Label data-alignment={alignment} error={error} data-visible={error}>{label}</Label>
      }
    </Wrap>
  );
}
