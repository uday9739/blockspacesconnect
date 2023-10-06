// import { observer } from "mobx-react-lite";
// import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
// import { UserStore } from "src/platform/api";

// export const UserStoreContext = createContext<UserStore>(null);

// const UserProvider = observer(({ children }: PropsWithChildren) => {
//   const [userStore] = useState<UserStore>(new UserStore());
//   return <UserStoreContext.Provider value={userStore}>{children}</UserStoreContext.Provider>;
// });

// export const useUserStore = () => useContext(UserStoreContext);

// export default UserProvider;
