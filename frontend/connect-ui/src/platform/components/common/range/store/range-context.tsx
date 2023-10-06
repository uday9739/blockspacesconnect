import { createContext } from 'react';
import { RangeStyles } from '../types';
import { Range } from '../types';
export type RangeContextType = {
  label?: string;

  size?: number;

  customStyles?: RangeStyles;

  onSelect?: (range: Range) => void;

  selectedRange?: Range;

  register?: any;

  name?: string;

  ref?: any;
};
export const RangeContext = createContext<RangeContextType>({});
