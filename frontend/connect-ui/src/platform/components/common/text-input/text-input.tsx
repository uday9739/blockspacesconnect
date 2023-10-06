import InputMask from 'react-input-mask';
import Styles from './styles';
import { css } from 'styled-components';
import { Tooltip } from '@platform/common'

type Props = {
  register: any;
  name: string;
  style?: 'default' | 'newDefault' | 'twoFactor' | 'large' | 'lightningSetup';
  label?: string;
  value?: any;
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
  onChange?: any;
  toolTipPlacement?:"top" | "bottom" | "left" | "right" 
}

export const TextInput = ({
  style = 'default', toolTipPlacement ="left" ,register, error, errorMessage, name, label, value, mask, maskChar = '_', alignment = 'left', margin, width, disabled, customStyle, onChange, ...rest
}: Props) =>
{

  const { Wrap, Input, Label } = Styles[style];

  const look = css`
       width:100%;
    height:100%;
    color:#323656;
    padding: 0 1.8125rem;
    background:#FFF;
    border:1px solid #E7EBFF;
    border-radius: 2rem;
    outline:none;
    font-size:2rem;
    letter-spacing:.5rem;
    transition:all 150ms ease-out;
    &[data-empty="true"]{
      background:#fcfcff;
      border:1px solid #b5b9ee;
    }
    &:hover {
      background:#FFF;
      border: 1px solid #5665E5AA;
    }
    &:focus {
      background:#FFF;
      border: 1px solid #5665E5;
      box-sizing: border-box;
      box-shadow: 0px 1px 3px rgba(86, 101, 229, 0.48);
    }
    &::placeholder {
      color: #abb2f270;
      font-size:2rem;
      font-weight:300;
    }
    &[disabled]{
      background:#fcfcff;
      &:hover {
        border:1px solid #E7EBFF;
      }
    }
    &[data-alignment="center"]{
      text-align:center;
    }
  `

  const inputComponent = (mask) => {
    const registeredInput = onChange ? register(name,{ onChange }) : register(name)
    return (
      mask ?
        <InputMask { ...rest }  { ...registeredInput } data-alignment={ alignment } mask={ mask } maskchar={ maskChar } value={ value } css={ look} />
        :
        <Input { ...registeredInput } { ...rest } error={error} disabled={!!disabled} data-alignment={ alignment } style={ customStyle } />
    )
  }

  return (
    <Wrap margin={margin} width={width} style={customStyle}>
      {error ?
        <Tooltip forceShow content={errorMessage} placement={toolTipPlacement}>
          <Label data-alignment={alignment} error={error} data-visible={!!value}>{label}</Label>
        </Tooltip>
        :
        <Label data-alignment={alignment} error={error} data-visible={!!value}>{label}</Label>
      }
      <>
        {inputComponent(mask)}
      </>
    </Wrap>
  )

}