import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { generateBscMacAndUpdateDocWithPubkey, getMacaroon, initializeNodeAndStoreMac, unlockNode, updateNodeDoc } from "@lightning/api"
import { useNodeDoc } from "../queries"
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node"

export enum UnlockNodeResponse {
  Unlocked = "unlocked",
  Failed = "failed"
}
type UnlockNodeArgs = { url: string, nodeId: string, password: string }
export const useUnlockNode = () => {
  const [unlockNodeRes, setUnlockNodeRes] = useState<UnlockNodeResponse>(null)
  const {nodeDoc} = useNodeDoc()
  const { mutate, data, isLoading: unlockNodeLoading } = useMutation({
    mutationFn: (args: UnlockNodeArgs) => unlockNode(args.url, args.password, nodeDoc?.data?.nodeId, nodeDoc?.data?.cert),
    onSuccess: (res) => {
      if (res.status === 'unlocked') {
        setUnlockNodeRes(UnlockNodeResponse.Unlocked)
      } else {
        setUnlockNodeRes(UnlockNodeResponse.Failed)
      }
    }
  })

  return { mutate, data, unlockNodeRes, unlockNodeLoading }
}

type InitializeNodeArgs = { url: string, seed: string[], password: string }
export const useInitializeNode = () => {
  const {nodeDoc} = useNodeDoc()
  const { mutate: initializeNodeFunc, data, isLoading, error } = useMutation({
    mutationFn: (args: InitializeNodeArgs) => initializeNodeAndStoreMac(args.url, args.seed, args.password, nodeDoc?.data?.cert, nodeDoc?.data?.nodeId),
  })

  return { initializeNodeFunc, data, isLoading, error }
}

type GenerateBscMacArgs = { url: string, nodeId: string }
export const useGenerateBscMacaroon = () => {
  const {nodeDoc} = useNodeDoc()
  const { mutate: generateBscMacaroon, data: bscMac, isLoading: bscLoading, isIdle, error: bscMacError, isError } = useMutation({
    mutationFn: (args: GenerateBscMacArgs) => generateBscMacAndUpdateDocWithPubkey(args.url, args.nodeId, nodeDoc?.data?.cert),
    // allow RPC server to start up. wait ...
    // override retry. This call can fail due to the node to being ready.
    retry: 4,
    retryDelay: 5000,
  })

  return {
    generateBscMacaroon,
    bscMac,
    // isIdle, // is if it is waiting for a retry 
    bscLoading: bscLoading || isIdle,
    bscMacError,
    bscMacIsError: isError
  }
}

export type UseFetchMacaroonArgs = { password: string, nodeId: string, connect?:boolean}
export const useFetchMacaroon = () => {
  return useMutation({
    mutationFn: (args: UseFetchMacaroonArgs) => getMacaroon(args.password, args.nodeId, args.connect)
  })
}

export type UseUpdateNodeDocArgs = {nodeUpdate: Partial<LightningNodeReference>}
export const useUpdateNodeDoc = () => {
  const queryClient = useQueryClient()
  const {nodeDoc} = useNodeDoc()
  return useMutation({
    mutationFn: (args: UseUpdateNodeDocArgs) => updateNodeDoc(nodeDoc?.data?.nodeId, {...nodeDoc.data, ...args.nodeUpdate}),
    onSuccess: () => queryClient.invalidateQueries(['nodeDoc', nodeDoc?.data?.tenantId]) 
  })
}