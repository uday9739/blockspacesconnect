import styled, { StyledComponent } from 'styled-components';
/**
 * `RangeStyles` is an object with keys that are the names of the components in the `Range` component,
 * and values that are styled components.
 * @property MenuWrap - The wrapper for the menu.
 * @property MenuContainer - The container for the menu.
 * @property MenuSelection - The container for the selected dates.
 * @property MenuLabel - The label for the menu
 * @property Stage - The container for the calendar.
 * @property ContainerDateRangePicker - The container for the DateRangePicker component.
 */
export type RangeStyles = {
  MenuWrap?: StyledComponent<"div", any, { componentFontSize: number }>;
  MenuContainer?: StyledComponent<"div", any, {}>;
  MenuSelection?: StyledComponent<"div", any, {}>;
  MenuLabel?: StyledComponent<"label", any, {}>;
  Stage?: StyledComponent<"div", any, {}>;
  ContainerDateRangePicker?: StyledComponent<"div", any, { dropdownFontSize: number }>;
};

export const Styles: RangeStyles = {
  /* Creating a styled component called MenuWrap. It is a div that takes in a componentFontSize prop. */
  MenuWrap: styled.div<{ componentFontSize: number }>`
    position: relative;
    display: flex;
    font-size: ${(p) => p.componentFontSize + 'rem'};
    height: fit-content;
    margin: 0.75rem 0;
    justify-content: center;
    cursor: pointer;
    max-width: fit-content;
    z-index: 1;

    & * .rdrCalendarWrapper {
      color: #000000;
    }

    & * .rdrDateDisplayWrapper {
      background-color: rgb(239, 242, 247);
    }

    & * .rdrDateDisplay {
      margin: 0.833em;
    }

    & * .rdrDateDisplayItem {
      border-radius: 0.25em;
      background-color: rgb(255, 255, 255);
      box-shadow: 0 1px 2px 0 rgba(35, 57, 66, 0.21);
      border: 1px solid transparent;
    }

    & * .rdrDateDisplayItem {
      input {
        cursor: pointer;
        height: 2.5em;
        line-height: 2.5em;
        border: 0px;
        background: transparent;
        width: 100%;
        color: #849095;
      }
    }

    & * .rdrDateDisplayItemActive {
      border-color: currentColor;
    }

    & * .rdrDateDisplayItemActive {
      input {
        color: #7d888d;
      }
    }

    & * .rdrMonthAndYearWrapper {
      align-items: center;
      height: 3.75em;
      padding-top: 0.625em;
    }

    & * .rdrMonthAndYearPickers {
      font-weight: 600;
    }

    & * .rdrMonthPicker,
    & * .rdrYearPicker {
      margin: 0 0.3125em;
    }

    & * .rdrNextPrevButton {
      display: block;
      width: 1.5em;
      height: 1.5em;
      margin: 0 0.833em;
      padding: 0;
      border: 0;
      border-radius: 0.3125em;
      background: #eff2f7;
    }

    & * .rdrNextPrevButton:hover {
      background: #e1e7f0;
    }

    & * .rdrNextPrevButton {
      i {
        display: block;
        width: 0;
        height: 0;
        padding: 0;
        text-align: center;
        border-style: solid;
        margin: auto;
        transform: translate(-0.1875em, 0px);
      }
    }

    & * .rdrPprevButton {
      i {
        border-width: 4px 6px 4px 4px;
        border-color: transparent rgb(52, 73, 94) transparent transparent;
        transform: translate(-0.1875em, 0px);
      }
    }

    & * .rdrNextButton {
      i {
        margin: 0 0 0 0.4375em;
        border-width: 4px 4px 4px 6px;
        border-color: transparent transparent transparent rgb(52, 73, 94);
        transform: translate(0.1875em, 0px);
      }
    }

    & * .rdrWeekDays {
      padding: 0 0.833em;
    }

    & * .rdrMonth {
      padding: 0 0.833em 1.666em 0.833em;
    }

    & * .rdrMonth .rdrWeekDays {
      padding: 0;
    }

    & * .rdrMonths.rdrMonthsVertical .rdrMonth:first-child .rdrMonthName {
      display: none;
    }

    & * .rdrWeekDay {
      font-weight: 400;
      line-height: 2.667em;
      color: rgb(132, 144, 149);
    }

    & * .rdrDay {
      background: transparent;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      border: 0;
      padding: 0;
      line-height: 3em;
      height: 3em;
      text-align: center;
      color: #1d2429;
      font-size: 1.2em;
    }

    & * .rdrDay:focus {
      outline: 0;
    }

    & * .rdrDayNumber {
      outline: 0;
      font-weight: 300;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      top: 0.1125em;
      bottom: 0.3125em;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    & * .rdrDayToday {
      .rdrDayNumber {
        span {
          font-weight: 500;
        }
      }
    }

    & * .rdrDayToday {
      * .rdrDayNumber {
        span:after {
          content: '';
          position: absolute;
          bottom: 0.25em;
          left: 50%;
          transform: translate(-50%, 0);
          width: 1.125em;
          height: 0.125em;
          border-radius: 1.125em;
          background: #3d91ff;
        }
      }
    }

    & * .rdrDayToday:not(.rdrDayPassive) .rdrInRange ~ .rdrDayNumber span:after,
    &
      *
      .rdrDayToday:not(.rdrDayPassive)
      .rdrStartEdge
      ~ .rdrDayNumber
      span:after,
    & * .rdrDayToday:not(.rdrDayPassive) .rdrEndEdge ~ .rdrDayNumber span:after,
    &
      *
      .rdrDayToday:not(.rdrDayPassive)
      .rdrSelected
      ~ .rdrDayNumber
      span:after {
      background: #fff;
    }

    & * .rdrDay:not(.rdrDayPassive) .rdrInRange ~ .rdrDayNumber span,
    & * .rdrDay:not(.rdrDayPassive) .rdrStartEdge ~ .rdrDayNumber span,
    & * .rdrDay:not(.rdrDayPassive) .rdrEndEdge ~ .rdrDayNumber span,
    & * .rdrDay:not(.rdrDayPassive) .rdrSelected ~ .rdrDayNumber span {
      color: rgba(255, 255, 255, 0.85);
    }

    & * .rdrSelected,
    & * .rdrInRange,
    & * .rdrStartEdge,
    & * .rdrEndEdge {
      background: currentColor;
      position: absolute;
      top: 0.3125em;
      left: 0;
      right: 0;
      bottom: 0.3125em;
    }

    & * .rdrSelected {
      left: 0.125em;
      right: 0.125em;
    }

    & * .rdrStartEdge {
      border-top-left-radius: 1.042em;
      border-bottom-left-radius: 1.042em;
      left: 0.125em;
    }

    & * .rdrEndEdge {
      border-top-right-radius: 1.042em;
      border-bottom-right-radius: 1.042em;
      right: 0.125em;
    }

    & * .rdrSelected {
      border-radius: 1.042em;
    }

    & * .rdrDayStartOfMonth .rdrInRange,
    & * .rdrDayStartOfMonth .rdrEndEdge,
    & * .rdrDayStartOfWeek .rdrInRange,
    & * .rdrDayStartOfWeek .rdrEndEdge {
      border-top-left-radius: 1.042em;
      border-bottom-left-radius: 1.042em;
      left: 0.125em;
    }

    & * .rdrDayEndOfMonth .rdrInRange,
    & * .rdrDayEndOfMonth .rdrStartEdge,
    & * .rdrDayEndOfWeek .rdrInRange,
    & * .rdrDayEndOfWeek .rdrStartEdge {
      border-top-right-radius: 1.042em;
      border-bottom-right-radius: 1.042em;
      right: 2px;
    }

    & * .rdrDayStartOfMonth .rdrDayInPreview,
    & * .rdrDayStartOfMonth .rdrDayEndPreview,
    & * .rdrDayStartOfWeek .rdrDayInPreview,
    & * .rdrDayStartOfWeek .rdrDayEndPreview {
      border-top-left-radius: 1.333em;
      border-bottom-left-radius: 1.333em;
      border-left-width: 1px;
      left: 0px;
    }

    & * .rdrDayEndOfMonth .rdrDayInPreview,
    & * .rdrDayEndOfMonth .rdrDayStartPreview,
    & * .rdrDayEndOfWeek .rdrDayInPreview,
    & * .rdrDayEndOfWeek .rdrDayStartPreview {
      border-top-right-radius: 1.333em;
      border-bottom-right-radius: 1.333em;
      border-right-width: 1px;
      right: 0px;
    }

    & * .rdrDayStartPreview,
    & * .rdrDayInPreview,
    & * .rdrDayEndPreview {
      background: rgba(255, 255, 255, 0.09);
      position: absolute;
      top: 0.1875em;
      left: 0px;
      right: 0px;
      bottom: 0.1875em;
      pointer-events: none;
      border: 0px solid currentColor;
      z-index: 1;
    }

    & * .rdrDayStartPreview {
      border-top-width: 1px;
      border-left-width: 1px;
      border-bottom-width: 1px;
      border-top-left-radius: 1.333em;
      border-bottom-left-radius: 1.333em;
      left: 0px;
    }

    & * .rdrDayInPreview {
      border-top-width: 1px;
      border-bottom-width: 1px;
    }

    & * .rdrDayEndPreview {
      border-top-width: 1px;
      border-right-width: 1px;
      border-bottom-width: 1px;
      border-top-right-radius: 1.333em;
      border-bottom-right-radius: 1.333em;
      right: 0.125em;
      right: 0px;
    }

    & * .rdrDefinedRangesWrapper {
      font-size: 0.75em;
      width: 14.25em;
      border-right: solid 1px #eff2f7;
      background: #fff;
    }

    & * .rdrDefinedRangesWrapper .rdrStaticRangeSelected {
      color: currentColor;
      font-weight: 600;
    }

    & * .rdrStaticRange {
      border: 0;
      cursor: pointer;
      display: block;
      outline: 0;
      border-bottom: 1px solid #eff2f7;
      padding: 0;
      background: #fff;
    }

    & * .rdrStaticRange:hover .rdrStaticRangeLabel,
    & * .rdrStaticRange:focus .rdrStaticRangeLabel {
      background: #eff2f7;
    }

    & * .rdrStaticRangeLabel {
      display: block;
      outline: 0;
      line-height: 1.125em;
      padding: 0.625em 1.25em;
      text-align: left;
      font-size: 1em;
    }

    & * .rdrInputRanges {
      padding: 0.625em 0;
    }

    & * .rdrInputRange {
      align-items: center;
      padding: 0.3125em 1.25em;
    }

    & * .rdrInputRange span {
      font-size: 0.9em;
    }

    & * .rdrInputRangeInput {
      width: 1.875em;
      height: 1.875em;
      line-height: 1.875em;
      border-radius: 0.25em;
      text-align: center;
      border: solid 1px rgb(222, 231, 235);
      margin-right: 0.625em;
      color: rgb(108, 118, 122);
      font-size: 1.1em;
    }

    & * .rdrInputRangeInput:focus,
    & * .rdrInputRangeInput:hover {
      border-color: rgb(180, 191, 196);
      outline: 0;
      color: #333;
    }

    &
      *
      .rdrCalendarWrapper:not(.rdrDateRangeWrapper)
      .rdrDayHovered
      .rdrDayNumber:after {
      content: '';
      border: 1px solid currentColor;
      border-radius: 1.333em;
      position: absolute;
      top: -0.125em;
      bottom: -0.125em;
      left: 0px;
      right: 0px;
      background: transparent;
    }

    & * .rdrDayPassive {
      pointer-events: none;
    }

    & * .rdrDayPassive .rdrDayNumber span {
      color: #d5dce0;
    }

    & * .rdrDayPassive .rdrInRange,
    & * .rdrDayPassive .rdrStartEdge,
    & * .rdrDayPassive .rdrEndEdge,
    & * .rdrDayPassive .rdrSelected,
    & * .rdrDayPassive .rdrDayStartPreview,
    & * .rdrDayPassive .rdrDayInPreview,
    & * .rdrDayPassive .rdrDayEndPreview {
      display: none;
    }

    & * .rdrDayDisabled {
      background-color: rgb(248, 248, 248);
    }

    & * .rdrDayDisabled .rdrDayNumber span {
      color: #aeb9bf;
    }

    & * .rdrDayDisabled .rdrInRange,
    & * .rdrDayDisabled .rdrStartEdge,
    & * .rdrDayDisabled .rdrEndEdge,
    & * .rdrDayDisabled .rdrSelected,
    & * .rdrDayDisabled .rdrDayStartPreview,
    & * .rdrDayDisabled .rdrDayInPreview,
    & * .rdrDayDisabled .rdrDayEndPreview {
      filter: grayscale(100%) opacity(60%);
    }

    & * .rdrMonthName {
      text-align: left;
      font-weight: 600;
      color: #849095;
      padding: 0.833em;
    }

    & * .rdrCalendarWrapper {
      box-sizing: border-box;
      background: #ffffff;
      display: inline-flex;
      flex-direction: column;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    & * .rdrDateDisplay {
      display: flex;
      justify-content: space-between;
    }

    & * .rdrDateDisplayItem {
      flex: 1 1;
      width: 0;
      text-align: center;
      color: inherit;
    }

    & * .rdrDateDisplayItem + .rdrDateDisplayItem {
      margin-left: 0.833em;
    }

    & * .rdrDateDisplayItem input {
      text-align: inherit;
    }

    & * .rdrDateDisplayItem input:disabled {
      cursor: default;
    }

    & * .rdrMonthAndYearWrapper {
      box-sizing: inherit;
      display: flex;
      justify-content: space-between;
    }

    & * .rdrMonthAndYearPickers {
      flex: 1 1 auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    & * .rdrMonthPicker {
      font-size: 0.6875em;
    }

    & * .rdrMonthPicker option {
      font-size: 0.6875em;
    }

    & * .rdrNextPrevButton {
      box-sizing: inherit;
      cursor: pointer;
      outline: none;
    }

    & * .rdrMonths {
      display: flex;
    }

    & * .rdrMonthsVertical {
      flex-direction: column;
    }

    & * .rdrMonthsHorizontal > div > div > div {
      display: flex;
      flex-direction: row;
    }

    & * .rdrMonth {
      width: 27.66em;
    }

    & * .rdrWeekDays {
      display: flex;
    }

    & * .rdrWeekDay {
      flex-basis: calc(100% / 7);
      box-sizing: inherit;
      text-align: center;
    }

    & * .rdrDays {
      display: flex;
      flex-wrap: wrap;
    }

    & * .rdrInfiniteMonths {
      overflow: auto;
    }

    & * .rdrDateRangeWrapper {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    & * .rdrDateInput {
      position: relative;
    }

    & * .rdrDateInput input {
      outline: none;
      font-size: 1.1em;
    }

    & * .rdrDateInput .rdrWarning {
      position: absolute;
      font-size: 1.6em;
      line-height: 1.6em;
      top: 0;
      right: 0.25em;
      color: #ff0000;
    }

    & * .rdrDay {
      box-sizing: inherit;
      width: calc(100% / 7);
      position: relative;
      cursor: pointer;
    }

    & * .rdrDayNumber {
      display: block;
      position: relative;
    }

    & * .rdrDayNumber span {
      color: #1d2429;
    }

    & * .rdrDayDisabled {
      cursor: not-allowed;
    }

    @supports (-ms-ime-align: auto) {
      & * .rdrDay {
        flex-basis: 14.285% !important;
      }
    }

    & * .rdrSelected,
    & * .rdrInRange,
    & * .rdrStartEdge,
    & * .rdrEndEdge {
      pointer-events: none;
    }

    & * .rdrDayStartPreview,
    & * .rdrDayInPreview,
    & * .rdrDayEndPreview {
      pointer-events: none;
    }

    & * .rdrDateRangePickerWrapper {
      display: inline-flex;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    & * .rdrStaticRanges {
      display: flex;
      flex-direction: column;
    }

    & * .rdrStaticRange {
      font-size: inherit;
    }

    & * .rdrInputRange {
      display: flex;
    }

    & * .rdrMonthAndYearPickers {
      * select {
        -moz-appearance: none;
        appearance: none;
        -webkit-appearance: none;
        border: 0;
        background: transparent;
        padding: 0.625em 1.875em 0.625em 0.625em;
        border-radius: 0.25em;
        outline: 0;
        color: #3e484f;
        background: url("data:image/svg+xml;utf8,<svg width='.5625em' height='.375em' viewBox='0 0 9 6' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g id='Artboard' stroke='none' stroke-width='1' fill='none' fillRule='evenodd' transform='translate(-636.000000, -171.000000)' fill-opacity='0.368716033'><g id='input' transform='translate(172.000000, 37.000000)' fill='%230E242F' fillRule='nonzero'><g id='Group-9' transform='translate(323.000000, 127.000000)'><path d='M142.280245,7.23952813 C141.987305,6.92353472 141.512432,6.92361662 141.219585,7.23971106 C140.926739,7.5558055 140.926815,8.06821394 141.219755,8.38420735 L145.498801,13 L149.780245,8.38162071 C150.073185,8.0656273 150.073261,7.55321886 149.780415,7.23712442 C149.487568,6.92102998 149.012695,6.92094808 148.719755,7.23694149 L145.498801,10.7113732 L142.280245,7.23952813 Z' id='arrow'></path></g></g></g></svg>")
          no-repeat;
        background-position: right 0.5em center;
        cursor: pointer;
        text-align: center;
        font-size: 1.4em;
      }
    }

    & * .rdrMonthAndYearPickers {
      * select:hover {
        background-color: rgba(0, 0, 0, 0.07);
      }
    }
  `,
  MenuContainer: styled.div`
    width: fit-content;
    height: fit-content;
    color: #323656;
    padding: 0 1.25em;
    overflow-x: auto;
    background: #fff;
    border: 1px solid #e7ebff;
    border-radius: 2em;
    outline: none;
    font-size: 1.0625em;
    transition: 100ms ease-out;
    &:hover,
    &:focus {
      border: 1px solid #015fcc;
      box-shadow: none;
    }
  `,
  MenuSelection: styled.div`
    height: 2.5em;
    text-align: center;
    line-height: 2.5em;
    color: #323656;
    font-size: 1em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  MenuLabel: styled.label`
    position: absolute;
    display: flex;
    align-items: center;
    top: -0.6em;
    background: white;
    height: 0.1875em;
    padding: 0.55em;
    font-size: 0.625em;
    letter-spacing: 0.0625em;
    color: #abb2f2;
    transition: 100ms ease-out;
    &[data-alignment='center'] {
      left: 50%;
      transform: translate(-50%, 0);
    }
    .container-menu:hover ~ & {
      color: #015fcc;
      font-size: 0.5625em;
    }
  `,
  Stage: styled.div`
    white-space: nowrap;
    overflow-x: auto;
    display: flex;
    height: 2.5em;
    align-items: center;
  `,
  /* Creating a styled component called ContainerDateRangePicker. */
  ContainerDateRangePicker: styled.div<{ dropdownFontSize: number }>`
    margin-top: 0.9375em;
    font-size: ${(p) => p.dropdownFontSize + 'rem'};
  `,
};
