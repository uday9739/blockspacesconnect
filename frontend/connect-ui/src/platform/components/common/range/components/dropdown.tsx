import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useRangeStore } from '../';
import { DateRangePicker } from 'react-date-range';
import { useOutsideClick, useEscape } from '@platform/hooks';
import { InternalRanges, InternalRange } from '../types';

export const DropDown = observer(() => {
  const refComponent = useRef(null);

  const {
    styles,
    setSelectedRange,
    setInternalRange,
    internalRange,
    dropdownFontSize,
    setShowDropDown,
    getNormalizedEndDate,
  } = useRangeStore();

/* A custom hook that is checking if the user clicks outside of the component. If they do, it will set
the showDropDown to false. */
  useOutsideClick(() => {
    setShowDropDown(false);
  }, refComponent);


/* A custom hook that is checking if the user presses the escape key. If they do, it will set
the showDropDown to false. */
  useEscape(() => {
    setShowDropDown(false);
  });

  const [selection, setSelection] = useState<InternalRange>(internalRange);

  const { ContainerDateRangePicker } = styles;

  const handleSelect = (ranges: InternalRanges): void => {
    ranges.selection.endDate = getNormalizedEndDate(ranges.selection);
    setSelection(ranges.selection);
    setInternalRange(ranges.selection);
    setSelectedRange(ranges.selection);
  };

  return (
    <ContainerDateRangePicker
      dropdownFontSize={dropdownFontSize}
      ref={refComponent}
    >
      <DateRangePicker
        ranges={[selection]}
        onChange={handleSelect}
        maxDate={new Date()}
        shownDate={selection.startDate}
      />
    </ContainerDateRangePicker>
  );
});
