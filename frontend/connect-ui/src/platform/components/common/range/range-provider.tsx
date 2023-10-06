import React, { useContext, useState } from 'react';
import { RangeContext } from '.';
import { RangeStore } from './store/range-store';
import { RangeStyles } from './types';
import { Range } from './types';
import { initialRange } from './utils';
export type RangeProviderProps = {
  /** label for the selector button */
  label?: string;

  /** size for the component in pct 50, 100, 150 etc */
  size?: number;

  /** custom styled components, will overwrite the standard ones. */
  customStyles?: RangeStyles;

  /** a callback for the selection results { start: timestamp, end: timestamp } */
  onSelect?: (range: Range) => void;

  /** initial selection  { start: timestamp, end: timestamp } */
  selectedRange?: Range;

  /** a placeholder for validation */
  register?: any;

  /** a placeholder for testing */
  name?: string;

  /** a placeholder for validation */
  ref?: any;

  /** internal property */
  children?: JSX.Element;
};

export function RangeProvider({
  children,
  label = 'Select',
  size = 100,
  onSelect = (range: Range): void => {},
  selectedRange = initialRange,
  customStyles = {},
  name = 'select-range',
  ...rest
}: RangeProviderProps): JSX.Element {
  const [dataStore] = useState<RangeStore>(
    new RangeStore({
      label,
      size,
      onSelect,
      selectedRange,
      customStyles,
      name,
      ...rest,
    })
  );
  return (
    <RangeContext.Provider value={dataStore}>{children}</RangeContext.Provider>
  );
}
export const useRangeStore = () => useContext(RangeContext) as RangeStore;
