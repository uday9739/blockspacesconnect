import { enableStaticRendering } from "mobx-react-lite";
import React, { createContext, ReactNode, useContext } from "react";
import { RootStore } from "@/platform/hooks";

enableStaticRendering(typeof window === "undefined");

let store: RootStore;

// useRootStore is the method to retrieve the root store of the app
function useRootStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useRootStore must be used within RootStoreProvider");
  }

  return context;
}

// useErrorsStore is the method to retrieve the errors store of the app
export function useErrorsStore() {
  const { errorsStore } = useRootStore();
  return errorsStore;
}

// useErrorsFactory is the method to retrieve the errors factory of the app
export function useErrorsFactory()
{
  const { errorsFactory } = useRootStore();
  return errorsFactory;
}
const StoreContext = createContext<RootStore | undefined>(undefined);
StoreContext.displayName = "StoreContext";

// RootStoreProvider is the root provider of the app
export function RootStoreProvider({ children }: { children: ReactNode }) {
  const store = initializeStore();
  return <StoreContext.Provider value={store}> {children} </StoreContext.Provider>;
}

function initializeStore(): RootStore {
  const _store = store ?? new RootStore();
  // For SSG and SSR always create a new store
  if (typeof window === "undefined") return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
}
