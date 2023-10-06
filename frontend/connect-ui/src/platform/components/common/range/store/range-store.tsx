import { DateTime } from 'luxon';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { Styles } from '../styles/range.styles';
import { RangeProviderProps } from '..';
import { Range, InternalRange, RangeStyles } from '../types';
import { getNormalizedEndDate, initialRange } from '../utils';

export class RangeStore implements RangeProviderProps {
  label?: string;

  size: number;

  showDropDown: boolean = false;

  styles: RangeStyles;

  onSelect: (range: Range) => void;

  selectedRange: Range;

  customStyles: RangeStyles;

  rootFontSizePx: string;

  rootFontSize: number;

  dropdownFontSize: number;

  componentFontSize: number;

  internalRange: InternalRange;

  constructor({
    label = 'Select',
    size = 100,
    customStyles = {},
    onSelect = (range: Range): void => {},
    selectedRange = initialRange,
  }: RangeProviderProps) {
    makeAutoObservable(this);

    /* Setting the font sizes for the
    component based on the root font size and the provided size prop. */
    this.setFontSizes(size);

    /* Setting the label property of the class to the label passed in as a prop. */
    this.label = label;

    /* Setting the initial value of the showDropDown property to false. */
    this.showDropDown = false;

    /* Setting the onSelect property of the class to the onSelect prop passed in. */
    this.onSelect = onSelect;

    /* Setting the selectedRange property of the class to the selectedRange prop passed in. */
    this.selectedRange = selectedRange;

    /* Setting the internalRange state to the selectedRange state. */
    this.internalRange = {
      startDate: new Date(this.selectedRange.start),
      endDate: new Date(this.selectedRange.end),
      key: 'selection',
    };

    /* Setting the customStyles property of the class to the customStyles prop passed in. */
    this.customStyles = customStyles;

    // if custom style passed to component, overwrite existing style.. otherwise use the stylesheet of the variation
    this.styles = this.customStyles
      ? { ...Styles, ...this.customStyles }
      : Styles;

    reaction(
      () => this.showDropDown,
      (showDropDown) => {
        showDropDown ? null : this.onSelect(this.selectedRange);
      }
    );
  }

  /**
   *a component that lets you select a range between two dates
   */

  /**
   *sets the font sizes based on the root font size and the provided size prop
   *sets componentFontSize and dropdownFontSize in 'rem', and the insides are in 'em'
   *
   *@param size number in percentages 50 - 100 - 200
   */
  setFontSizes = (size: number): void => {
    this.rootFontSizePx = getComputedStyle(
      document.getElementsByTagName('html')[0]
    ).fontSize;
    this.rootFontSizePx.length !== 0 ? null : (this.rootFontSizePx = '16px');
    this.rootFontSize = Number(this.rootFontSizePx.replace('px', ''));

    size ? null : (size = 100);
    if (this.rootFontSize === 16) {
      this.componentFontSize = size / 100;
      this.dropdownFontSize = (size / 100) * 0.6;
    } else {
      this.componentFontSize = (this.rootFontSize / 16) * (size / 100);
      this.dropdownFontSize = (this.rootFontSize / 16) * (size / 100) * 0.8;
    }
  };

  /**
   *sets the dropdown visibility
   *
   *@param showDropDown boolean
   */
  setShowDropDown = (showDropDown: boolean): void => {
    runInAction(() => {
      this.showDropDown = showDropDown;
    });
  };

  /**
   *toggles the dropdown visibility
   *
   */
  toggleDropDown = (): void => {
    runInAction(() => {
      this.showDropDown = !this.showDropDown;
    });
  };

  /**
   * translates range to utc and into timestamps, sets selectedRange for outside consumption
   *
   * @param range InternalRange
   */
  setSelectedRange = (range: InternalRange): void => {
    const startLocal = DateTime.fromJSDate(range?.startDate);
    const start = DateTime.local(
      startLocal?.get('year'),
      startLocal?.get('month'),
      startLocal?.get('day'),
      0
    ).toMillis();
    const endLocal = DateTime.fromJSDate(range?.endDate);
    const end = DateTime.local(
      endLocal?.get('year'),
      endLocal?.get('month'),
      endLocal?.get('day'),
      23,59,59
    ).toMillis();
    this.selectedRange.start = start;
    this.selectedRange.end = end;
  };

  /**
   * sets a value for the range in the internal format, used to compute the formatted range
   *
   * @param range InternalRange
   */
  setInternalRange = (range: InternalRange): void => {
    this.internalRange = range;
  };

  /**
   * computes and caches a value for the formatted range, used to display on the closed component.
   *
   * @returns string - range string in format m/d/y-m/d/y
   */
  get selectedRangeFormatted(): string {
    return `${DateTime.fromJSDate(this.internalRange.startDate).toFormat(
      'M/d/yy'
    )}-${DateTime.fromJSDate(this.internalRange.endDate).toFormat('M/d/yy')}`;
  }

  /**
   * Returns the initial range for the select-range component on the lightning Summary dashboard
   *
   * @returns object with start, end, in milliseconds. currently the range is one month history.
   */
  getInitialRange = (): Range => {
    return initialRange;
  };

  /**
   * in cases where the end date is ahead of today, we need to convert it to todays date
   * @description Get normalized end date for the selected range
   */
  getNormalizedEndDate = (range: InternalRange): Date => {
    return getNormalizedEndDate(range);
  };
}
