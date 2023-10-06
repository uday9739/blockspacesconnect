import React from 'react';
import { observer } from 'mobx-react-lite';
import { useRangeStore } from '../';
export const Stage = observer(() => {
  const { selectedRange, styles, toggleDropDown, selectedRangeFormatted } =
    useRangeStore();

  const { MenuSelection } = styles;

  return (
    <MenuSelection data-testid="select-range" onClick={toggleDropDown}>
      {selectedRange ? selectedRangeFormatted : 'Select'}
    </MenuSelection>
  );
});
