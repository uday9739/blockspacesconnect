import React from 'react';
import { observer } from 'mobx-react-lite';
import { useRangeStore, RangeProvider } from '.';
import { RangeContainer } from './components/range-container';
import { RangeProviderProps } from '.';
export const Range = observer((props: RangeProviderProps): JSX.Element => {
  const { label, size, onSelect, selectedRange } = useRangeStore();
  return (
    <RangeProvider {...props}>
      <RangeContainer
        label={label}
        size={size}
        onSelect={onSelect}
        selectedRange={selectedRange}
        customStyles={{}}
      />
    </RangeProvider>
  );
});
