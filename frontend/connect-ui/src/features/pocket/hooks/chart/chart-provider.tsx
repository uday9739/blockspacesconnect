import { observer } from "mobx-react-lite";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { PocketStore } from "./chart-store";

export const PocketContext = createContext<PocketStore>(null)

const PocketUIProvider = observer(({children}: PropsWithChildren) => {
  const [pocketUIStore] = useState<PocketStore>(new PocketStore())

  
  return <PocketContext.Provider value={pocketUIStore}>{children}</PocketContext.Provider>
});

export const usePocketUIStore = () => useContext(PocketContext)

export default PocketUIProvider
