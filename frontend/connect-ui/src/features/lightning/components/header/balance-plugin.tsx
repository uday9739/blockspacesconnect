import React, { useMemo } from "react";

import { Styles } from "./balance.styles";

import { Loading, Tooltip } from "@platform/common";
import { Satoshi } from "@icons";
import { useBitcoinPrice, useCombinedBalances } from "@lightning/queries";
import { observer } from "mobx-react-lite";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { useUpdateUserAppSettings } from "@src/platform/hooks/user/mutations";

const usePageData = () => {
  const { balances, balancesLoading, error } = useCombinedBalances();

  const { data: user } = useGetCurrentUser();
  const { bitcoinPrice } = useBitcoinPrice("usd");

  return {
    balances: {
      onchain: Number(balances?.onchain?.data?.total_balance),
      offchain: Number(balances?.offchain?.data?.balance),
      combined: Number(balances?.onchain?.data?.total_balance) + Number(balances?.offchain?.data?.balance)
    },
    loading: balancesLoading,
    error: error,
    displayFiat: user?.appSettings?.bip?.displayFiat,
    fiatValue: useMemo(() => {
      return (balances?.combined * Number(bitcoinPrice?.data?.exchangeRate)).toFixed(2);
    }, [balances]),
    exchangeRate: Number(bitcoinPrice?.data?.exchangeRate)
  };
};

export const BalancePlugin = observer(({ color }: { color: string }) => {
  const { Balance, BalanceBody, BalanceLabel, BalanceCount, LogoWrap, BalanceBar, FillBar } = Styles;

  const { balances, loading, error, fiatValue, displayFiat, exchangeRate } = usePageData();
  const fiatValues = {
    combined: Number(((balances.combined / 10 ** 8) * exchangeRate).toFixed(2)),
    onchain: Number(((balances.onchain / 10 ** 8) * exchangeRate).toFixed(2)),
    offchain: Number(((balances.offchain / 10 ** 8) * exchangeRate).toFixed(2))
  };
  const onchainFormatted = `${displayFiat ? "$" : ""}${Intl.NumberFormat("en-US").format(displayFiat ? fiatValues.onchain : balances.onchain)}`;
  const offchainFormatted = `${displayFiat ? "$" : ""}${Intl.NumberFormat("en-US").format(displayFiat ? fiatValues.offchain : balances.offchain)}`;

  const tooltipContent = `⛓️ Onchain: ${onchainFormatted} ⚡ Lightning: ${offchainFormatted}`;
  const { mutate: updateAppSettings } = useUpdateUserAppSettings();
  const onToggleCurrency = () => {
    updateAppSettings({ bip: { displayFiat: !displayFiat } });
  };

  if (error) return <></>;

  const NodeBalance = () => {
    if (displayFiat) {
      return <>{Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(fiatValues?.combined.toFixed(2)))}</>;
    } else {
      return (
        <>
          {balances?.combined >= 0 && (
            <LogoWrap>
              <Satoshi color="black" />
            </LogoWrap>
          )}
          {Intl.NumberFormat("en-US").format(Math.floor(balances?.combined))}
        </>
      );
    }
  };

  return (
    <Balance onClick={onToggleCurrency} style={{ cursor: "pointer" }}>
      <BalanceBody>
        <BalanceLabel>BALANCE</BalanceLabel>
        <Tooltip placement="bottom" content={tooltipContent}>
          <BalanceCount>
            <Loading when={loading}>
              <NodeBalance />
            </Loading>
          </BalanceCount>
        </Tooltip>
      </BalanceBody>
      <BalanceBar>
        <FillBar color={color} />
      </BalanceBar>
    </Balance>
  );
});
