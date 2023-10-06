import React from 'react'
import Themes from '../theme/themes'
import { AppUIThemes } from '../theme/presets'

export type AllThemesConfig = {
  themes: Array<AppUIThemes>
}

const defaultAllThemesConfig = {
  themes: Themes.getPresets(),
}

export const AllThemesContext: React.Context<AllThemesConfig> = React.createContext<AllThemesConfig>(
  defaultAllThemesConfig,
)

export const useAllThemes = (): AllThemesConfig =>
  React.useContext<AllThemesConfig>(AllThemesContext)
