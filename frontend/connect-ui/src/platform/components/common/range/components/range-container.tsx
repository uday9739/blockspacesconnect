import React from 'react';
import { observer } from 'mobx-react-lite';
import { RangeProviderProps, useRangeStore } from '../';
import { Menu } from './menu';
import { DropDown } from './dropdown';

export const RangeContainer = observer(({}: RangeProviderProps) => {
  const { showDropDown } = useRangeStore();
  return <Menu>{showDropDown && <DropDown />}</Menu>;
});
