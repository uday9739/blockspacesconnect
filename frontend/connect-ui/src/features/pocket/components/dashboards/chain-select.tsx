import { observer } from "mobx-react-lite";
import { without } from "lodash";

import { Option, Image, ImageWrap, SelectLabel, StyledChainSelect, Placeholder, ResetChainSelect } from "./chain-select.styles";

import { chainDetail } from "@blockspaces/shared/types/pokt-backing-chains";
import { Loading } from "@platform/common";
import { Reset } from "@icons";
import { useRelayData } from "@pocket/queries";
import { usePocketUIStore } from "@pocket/providers";

const usePageData = () => {
  const { selectedChainOptions, setSelectedChains } = usePocketUIStore();
  const { relayDataLoading } = useRelayData();

  return {
    selectedChainOptions,
    setSelectedChains,
    relayDataLoading
  }
}
export const ChainSelect = observer(() => {
  const { selectedChainOptions, setSelectedChains, relayDataLoading } = usePageData()
  
  return (
    <StyledChainSelect>
      <SelectLabel>CHAINS</SelectLabel>
      {selectedChainOptions.length > 0 ? (
        <>
          {selectedChainOptions.map((chain, index) => (
            <Loading key={`loading-option-${index}`} when={relayDataLoading}>
              <Option key={`relay-option-${index}`} onClick={() => setSelectedChains(without(selectedChainOptions, chain))}>
                <ImageWrap borderColor={chainDetail[chain.label].color}>
                  <Image alt={chain.label} src={chainDetail[chain.label].logo} />
                </ImageWrap>
              </Option>
            </Loading>
          ))}
          {!relayDataLoading && selectedChainOptions.length > 1 && (
            <ResetChainSelect active={selectedChainOptions.length > 0} onClick={() => setSelectedChains([])}>
              <Reset />
            </ResetChainSelect>
          )}
        </>
      ) : (
        <Placeholder>All</Placeholder>
      )}
    </StyledChainSelect>
  );
});
