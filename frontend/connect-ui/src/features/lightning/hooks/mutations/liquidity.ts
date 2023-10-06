import { useMutation, useQueryClient } from "@tanstack/react-query"
import { requestInbound } from "@lightning/api"
import { useState } from "react"

export enum LiquidityResponses {
  WalletSyncing = "wallet-syncing",
  Failure = "failure",
  Bomb = "bomb",
  Success = "success"
}

export const useRequestLiquidity = () => {
  const [liquidityRes, setLiquidityRes] = useState<LiquidityResponses>(null)
  const queryClient = useQueryClient()

  const { mutate, data, isLoading: requestLiquidityLoading } = useMutation({
    mutationFn: async () => requestInbound(),
    onSuccess: (response) => {
      if (response.data?.message?.startsWith('channels cannot be created before the wallet')) {
        setLiquidityRes(LiquidityResponses.WalletSyncing)
      } else if (response.data?.code === 2) {
        setLiquidityRes(LiquidityResponses.Failure)
      } else if (response.status === 'success') {
        setLiquidityRes(LiquidityResponses.Success)
      } else { 
        setLiquidityRes(LiquidityResponses.Bomb)
      }
      queryClient.invalidateQueries(["heyhowareya"])
    }
  })

  return { mutate, liquidityRes, data, requestLiquidityLoading }
}