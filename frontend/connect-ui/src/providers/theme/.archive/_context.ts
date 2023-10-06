import { createContext } from 'react';

type Theme = any;
export type StateContextProps = any[]

export type ActionsContextProps = {
  toggleTheme:() => void;
}

export const ThemeActionsContext = createContext<ActionsContextProps>({
  toggleTheme:() => {},
});