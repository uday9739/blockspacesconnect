import { observer } from "mobx-react-lite";
import numeral from "numeral";
import { includes, without } from "lodash";

import { StyledChainTotal, Amount, Logo, LogoWrap, Content, Label } from './chain-total.styles';

import { Tooltip } from "@platform/common";
import { chainDetail } from "@blockspaces/shared/types/pokt-backing-chains";
import { getFormattedNumber } from "@platform/utils";
import { usePocketUIStore } from "@pocket/providers";

type Props = {
  label: string;
  amount: number;
  totalRelays: number;
};

const usePageData = () => {
  const { selectedChainOptions, chainOptions, setSelectedChains } = usePocketUIStore();

  return {
    selectedChainOptions,
    chainOptions,
    setSelectedChains
  }
}

export const ChainTotal = observer(({ label, amount, totalRelays }: Props) => {
  const { selectedChainOptions, chainOptions, setSelectedChains } = usePageData()
  
  const formattedAmount = getFormattedNumber(amount);
  const thisOption = chainOptions.find((option) => option.label === label);
  const isSelected = includes(selectedChainOptions, thisOption);

  return (
    <Tooltip placement="bottom" content={numeral(amount).format("0,0")}>
      <StyledChainTotal
        selected={isSelected}
        onClick={() => {
          !isSelected ? setSelectedChains([thisOption, ...selectedChainOptions]) : setSelectedChains(without(selectedChainOptions, thisOption));
        }}
      >
        <LogoWrap>
          <Logo src={ chainDetail[ label ].logo } alt={ `${label} logo`} />
        </LogoWrap>
        <Content>
          <Label>{label}</Label>
          <Amount>
            {formattedAmount}
            {/* <Percentage>({ numeral(amount / totalRelays).format('0.00%')})</Percentage> */}
          </Amount>
        </Content>
      </StyledChainTotal>
    </Tooltip>
  );
});
ChainTotal.displayName = "ChainTotal";
