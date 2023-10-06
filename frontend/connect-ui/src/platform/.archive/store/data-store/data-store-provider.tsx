// import React, { useState, useContext, createContext, useEffect, PropsWithChildren } from "react";
// import { DataStore } from "../data-store";
// import { useRouter } from "next/router";
// import { observer } from "mobx-react-lite";

// const DataStoreProvider = observer(({ children }: PropsWithChildren) => {
//   const [dataStore] = useState<DataStore>(new DataStore());
//   const router = useRouter();
//   return <DataStoreContext.Provider value={dataStore}>{children}</DataStoreContext.Provider>;
// });

// export const DataStoreContext = createContext<DataStore>(null);
// export const useDataStore = () => useContext(DataStoreContext);
// export default DataStoreProvider;
