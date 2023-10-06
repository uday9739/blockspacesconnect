import { observer } from 'mobx-react-lite';

import {
  StyledOverview, Body, Toggle, Label, Nub, Track, ToggleWrap, DailyTotals, DailyTotalsTitle, Totals, DateSelect, Date,
} from './overview.styles';

import { NetworkDataContext } from '@blockspaces/shared/dtos/networks/data-series';
import { useRelayData } from '@pocket/queries';
import { usePocketUIStore } from '@pocket/providers';

const usePageData = () => {
  const { dataContext, toggleContext, selectRange, selectedRangeOption, rangeOptions } = usePocketUIStore();
  const { relayData } = useRelayData()

  return {
    dataContext,
    toggleContext,
    selectRange,
    selectedRangeOption,
    rangeOptions,
    relayData
  }
}

export const Overview = observer(() => {
  const { dataContext, toggleContext, selectRange, selectedRangeOption, rangeOptions, relayData } = usePageData()

  return (
    <StyledOverview>
      <Body>
        <ToggleWrap>
          <Toggle>
            <Label
              onClick={() => dataContext === NetworkDataContext.WHOLE_NETWORK && toggleContext()}
              selected={dataContext === NetworkDataContext.USER_FLEET}
            >
              MY FLEET
            </Label>
            <Track onClick={toggleContext}>
              <Nub
                right={dataContext === NetworkDataContext.WHOLE_NETWORK}
              />
            </Track>
            <Label
              onClick={() => dataContext === NetworkDataContext.USER_FLEET && toggleContext()}
              selected={dataContext === NetworkDataContext.WHOLE_NETWORK}
            >
              NETWORK
            </Label>
          </Toggle>
        </ToggleWrap>
        <DateSelect>
          {
            rangeOptions.map((range, index) => (
              <Date
                key={index}
                selected={selectedRangeOption.label === range.label}
                onClick={() => relayData && selectRange(range)}
              >
                {range.label}
              </Date>
            ))
          }
        </DateSelect>
      </Body>
    </StyledOverview>
  );
});
