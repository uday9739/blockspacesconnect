import { useMemo } from 'react';
import { observer } from "mobx-react-lite";

import PoktSummaryStyles, { LogoWrap, StakedBar, SummaryBar, SummaryBody, SummaryCount, SummaryLabel, UnstakedBar } from "./pokt-summary.styles";

import PocketLogo from "@platform/routes/networks/network-logos/pocket";
import { Loading } from "@platform/common";
import { Tooltip } from "@platform/.archive/tooltip"
import { usePocketSummaryData } from '@pocket/queries';

const usePageData = () => {
  const { summaryData, summaryDataLoading, summaryDataError } = usePocketSummaryData()
  const poktAmountsTotal = summaryData?.userFleet.poktAmounts.total
  const unstakedPct = (summaryData?.userFleet.poktAmounts.unstaked / summaryData?.userFleet.poktAmounts.total) * 100
  const stakedUserFleet = summaryData?.userFleet.poktAmounts.staked
  const unstakedUserFleet = summaryData?.userFleet.poktAmounts.unstaked

  return {
    poktAmountsTotal,
    unstakedPct,
    stakedUserFleet,
    unstakedUserFleet,
    loading: summaryDataLoading,
    error: summaryDataError
  }
}

export const PoktSummary = observer(() => {
  const { poktAmountsTotal, unstakedPct, stakedUserFleet, unstakedUserFleet, loading } = usePageData()
  
  /** caching the tooltips content */
  const tooltipContent = useMemo( ()=> <div style={ { display: "grid", color: "#000",gridTemplateColumns: "auto auto", gridTemplateRows: "1.25rem 1.25rem", justifyItems: "start", alignItems: "center", fontSize: "1rem" } }>
    <p>Staked:</p>
    <p style={{ padding: "0.3rem", justifySelf: "flex-start"}}>{ Intl.NumberFormat("en-US").format(Math.floor(stakedUserFleet)) }</p>
    <p>Unstaked:</p> <p style={{padding: "0.3rem", justifySelf: 'flex-start'}}>{ Intl.NumberFormat("en-US").format(Math.floor(unstakedUserFleet)) }</p>
  </div>, [stakedUserFleet, unstakedUserFleet]);

  // const tooltipContent = `Staked: ${Intl.NumberFormat("en-US").format(Math.floor(stakedUserFleet))}\nUnstaked: ${Intl.NumberFormat("en-US").format(Math.floor(unstakedUserFleet))}`

  return (
    <PoktSummaryStyles>
      <SummaryBody>
        <SummaryLabel>TOTAL POKT</SummaryLabel>
        <SummaryCount>
          {poktAmountsTotal >= 0 && (
            <LogoWrap>
              <PocketLogo />
            </LogoWrap>
          )}
          <Loading when={loading}>{Intl.NumberFormat("en-US").format(Math.floor(poktAmountsTotal))}</Loading>
        </SummaryCount>
      </SummaryBody>
      <Loading when={loading} top={ "-2.3rem"}>
        <Tooltip tooltip={ tooltipContent } style={{background:"#50e6b0"}}>
          <SummaryBar>
            <StakedBar />
            {unstakedPct > 0 && <UnstakedBar width={unstakedPct} />}
          </SummaryBar>
        </Tooltip>
      </Loading>
    </PoktSummaryStyles>
  );
});
