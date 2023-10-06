import Styles from './styles';
import PhoneInputWithCountry, {Country} from 'react-phone-number-input/react-hook-form';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';
import React from 'react';
import { Control } from 'react-hook-form';
import {Tooltip} from '@platform/common'

type Props = {
  register: any;
  name: string;
  style?: 'default';
  label?: string;
  value?: string;
  type?: string;
  defaultCountry?: Country;
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
  control?: Control;
  error?: boolean;
  errorMessage?: string;
}

export const PhoneInputSelect = ({
  style = 'default', register, name, error, errorMessage, control, label, ref, placeholder, defaultCountry, value, mask, maskChar = '_', alignment = 'left', margin, width, disabled, customStyle, ...rest
}: Props) =>
{
  const { Wrap, BscPhoneInput, Label } = Styles[ style ];

  return (
    <Wrap margin={ margin } width={ width }>
      { error ? 
        <Tooltip content={errorMessage} placement='left'>
          <Label data-alignment={ alignment } error={error} data-visible={ !!value }>{ label }</Label>
        </Tooltip>
        :
          <Label data-alignment={ alignment } data-visible={ !!value }>{ label }</Label>
      }
        <BscPhoneInput error={error}>
          <PhoneInputWithCountry
            value={value}
            international={true}
            id={name}
            name={name}
            control={control}
            withCountryCallingCode={true}
            useNationalFormatForDefaultCountryValue={false}
            defaultCountry={defaultCountry}
            flags={flags}
          />
        </BscPhoneInput>
    </Wrap>
  )
}