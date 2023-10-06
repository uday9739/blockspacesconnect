import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { SelectProvider } from './select-provider';
import { SelectContainer } from './select-container';
import { SelectProps } from './store/select-store';

export const Select = observer((props: SelectProps): any => (
  <SelectProvider config={props}>
    <SelectContainer />
  </SelectProvider>
));
