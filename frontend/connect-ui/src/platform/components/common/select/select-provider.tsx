import React, {
  useState, useContext, createContext, useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import { SelectStore } from './store/select-store';

export const SelectContext = createContext<SelectStore>(null);

export const SelectProvider = observer(({ config, children }: any, any) => {
  const [selectStore] = useState<SelectStore>(new SelectStore(config));

  useEffect(() => {
    selectStore.selection = config.selection;
  }, [config.selection]);

  return (
    <SelectContext.Provider value={selectStore}>
      {children}
    </SelectContext.Provider>
  );
});

export const useSelectStore = () => useContext(SelectContext);
