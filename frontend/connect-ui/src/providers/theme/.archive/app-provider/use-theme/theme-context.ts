import React from 'react'
import Themes from '../theme'
import { AppUIThemes } from '../theme/presets'

const defaultTheme = Themes.getPresetStaticTheme()

export const ThemeContext: React.Context<AppUIThemes> =
  React.createContext<AppUIThemes>(defaultTheme)

export const useTheme = (): AppUIThemes => React.useContext<AppUIThemes>(ThemeContext)
