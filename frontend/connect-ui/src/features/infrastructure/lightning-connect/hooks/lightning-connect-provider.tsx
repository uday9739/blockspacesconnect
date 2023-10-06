import { useFetchMacaroon, UseFetchMacaroonArgs } from "@src/features/lightning/hooks/mutations"
import { UseMutateFunction } from "@tanstack/react-query"
import { createContext, useContext, useState } from "react"

const LightningConnectContext = createContext(null)

type ProviderState = { auth: {macaroon:string,seed:string[]}, loading: boolean, error: boolean, getMacaroon: UseMutateFunction<{macaroon: string; seed: string[];}, unknown, UseFetchMacaroonArgs, unknown>}

export const LightningConnectProvider = ({children}) => {
  const {data: auth, isLoading: loading, mutate: getMacaroon, isError: error} = useFetchMacaroon()

  const state: ProviderState = {
    auth,
    loading,
    error,
    getMacaroon
  }
  return (
    <LightningConnectContext.Provider value={state}>
      {children}
    </LightningConnectContext.Provider>
  )
}

export const useLightningConnect = () => {
  const context: ProviderState = useContext(LightningConnectContext)
  return context
}

