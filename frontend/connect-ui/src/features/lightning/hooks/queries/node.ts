import { useQuery, useQueryClient } from "@tanstack/react-query";
import { heyhowareya, getInfo, getNodeDoc, getNodeBalance, getChannelsList, generateSeedPhrase, claimNodeForUser, getWalletBalance, getLndVersion } from "@lightning/api";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { LightningNodeReference, LightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";
import { NodeBalance, NodeInfo } from "@blockspaces/shared/models/spaces/Lightning";
import { useMemo } from "react";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { extractTenantId } from "@lightning/utils";

export const useHeyhowareya = () => {
  const { data: nodeHealth, isLoading: nodeHealthLoading, error: nodeHealthError, refetch, remove: invalidateCache } = useQuery<ApiResult<LightningOnboardingStep> | any>({ queryKey: ["heyhowareya"], queryFn: heyhowareya });
  return { nodeHealth, nodeHealthLoading, nodeHealthError, refetch, invalidateCache };
};

export const useGetInfo = () => {
  const { data: nodeInfo, isLoading, error } = useQuery<ApiResult<NodeInfo> | any>({ queryKey: ["get-info"], queryFn: getInfo });

  return { nodeInfo, isLoading, error };
};

export const useNodeDoc = (): { nodeDoc: ApiResult<LightningNodeReference>, nodeDocLoading: boolean, nodeDocError: any, isSuccess: boolean } => {
  const tenantId = extractTenantId()
  const { data: nodeDoc, isLoading: nodeDocLoading, error: nodeDocError, isSuccess } = useQuery<ApiResult<LightningNodeReference> | any>(["node-doc", tenantId], () => getNodeDoc(tenantId), { enabled: tenantId !== null && tenantId !== undefined });

  return { nodeDoc, nodeDocLoading, nodeDocError, isSuccess };
};

export const useNodeBalance = (): { nodeBalance: ApiResult<NodeBalance>, balanceLoading: boolean, balanceError: any } => {
  const tenantId = extractTenantId()
  const { data: nodeBalance, isLoading: balanceLoading, error: balanceError } = useQuery<ApiResult<NodeBalance> | any>(["node-balance", tenantId], () => getNodeBalance(tenantId), { enabled: tenantId !== null && tenantId !== undefined });

  return { nodeBalance, balanceLoading, balanceError };
};

export const useChannelReserve = () => {
  const { nodeDoc } = useNodeDoc()
  const queryInfo = useQuery<any>(["channel-reserve"], () => getChannelsList(true), { enabled: nodeDoc != null });

  return {
    ...queryInfo,
    reserveLoading: queryInfo.isLoading,
    reserveError: queryInfo.error,
    channelReserve: useMemo(
      () => queryInfo?.data?.channels?.find(channel => channel.channel_point === nodeDoc.data.incomingChannelId)?.local_chan_reserve_sat,
      [queryInfo.data]
    )
  }
}

export const useGenerateSeed = (apiEndpoint: string) => {
  const { nodeDoc } = useNodeDoc()
  const { data: seed, isLoading: genSeedLoading, error: genSeedError, refetch: generateSeed } = useQuery(["gen-seed"], () => generateSeedPhrase(apiEndpoint, nodeDoc?.data?.cert), {
    enabled: apiEndpoint !== (null || undefined)
  })

  return {
    seed,
    genSeedLoading,
    genSeedError,
    generateSeed
  }
}

export const useClaimNode = () => {
  const queryClient = useQueryClient()
  const { data: user } = useGetCurrentUser();
  const { data: claimedNode, isLoading: claimNodeLoading, error: claimNodeError } = useQuery(["claim-node"], () => claimNodeForUser(), {onSuccess: () => queryClient.invalidateQueries(["node-doc", user?.activeTenant?.tenantId])})

  return {
    claimedNode,
    claimNodeLoading,
    claimNodeError
  }
}

export const useWalletBalance = () => {
  return useQuery(["wallet-balance"], () => getWalletBalance())
}

export const useCombinedBalances = () => {
  const { data: user } = useGetCurrentUser();
  const tenantId = user?.activeTenant?.tenantId;
  const { data: nodeBalance, isLoading: balanceLoading, error: balanceError } = useQuery<ApiResult<NodeBalance> | any>(["node-balance", tenantId], () => getNodeBalance(tenantId), { enabled: tenantId !== null && tenantId !== undefined });
  const { data: walletBalance, isLoading: walletLoading, error: walletError } = useQuery(['wallet-balance'], () => getWalletBalance());

  return {
    balancesLoading: balanceLoading && walletLoading,
    balances: {
      onchain: walletBalance,
      offchain: nodeBalance,
      combined: Number(walletBalance?.data?.confirmed_balance) + Number(nodeBalance?.data?.balance)
    },
    error: balanceError ?? walletError ?? null
  };
}

export const useLndVersion = () => {
  return useQuery(["lnd-version"], () => getLndVersion())
}