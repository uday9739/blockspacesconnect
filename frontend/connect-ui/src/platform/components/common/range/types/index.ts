export type { RangeStyles } from '../styles/range.styles';

/**
 * `InternalRange` is an object with a `startDate`, `endDate`, and `key` property. The `startDate` and
 * `endDate` properties are of type `Date` and the `key` property is of type `'selection'`.
 * @property {Date} startDate - The start date of the range.
 * @property {Date} endDate - The end date of the range.
 * @property key - This is a unique key for the range.
 */
export type InternalRange = {
  startDate: Date;
  endDate: Date;
  key: 'selection';
};

/**
 * A Range is an object with a start and end property, both of which are numbers in milliseconds timestamps
 * @property {number} start - The start of the range.
 * @property {number} end - The end of the range.
 */
export type Range = {
  start: number;
  end: number;
};

/**
 * `InternalRanges` is an object with a `selection` property that is an `InternalSelection`.
 * @property {InternalSelection} selection - The selection ranges.
 */
export type InternalRanges = {
  selection: InternalRange;
};
