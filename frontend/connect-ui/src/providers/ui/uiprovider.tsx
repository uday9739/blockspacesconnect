import React, { useState, useContext, createContext, PropsWithChildren } from "react";
// 3rd party
import { observer } from "mobx-react-lite";
// app code
import { UIStore } from "@ui";

export const UIStoreContext = createContext<UIStore>(null);
export const useUIStore = () => useContext(UIStoreContext);

const UIProvider = observer(({ children }: PropsWithChildren) => {
  const [uiStore] = useState<UIStore>(new UIStore());
  return <UIStoreContext.Provider value={uiStore}>{children}</UIStoreContext.Provider>;
});

export default UIProvider;
