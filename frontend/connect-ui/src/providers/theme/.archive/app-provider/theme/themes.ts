import { AppUIThemes } from './presets/index'
import type { DeepPartial } from '../types/types'
import lightTheme from './presets/default'
import darkTheme from './presets/dark'

export type AppUserTheme = DeepPartial<AppUIThemes> & { type: string }

export const isObject = (target: unknown) => target && typeof target === 'object'

export const deepDuplicable = <T extends Record<string, unknown>>(
  source: T,
  target: T,
): T => {
  if (!isObject(target) || !isObject(source)) return source as T

  const sourceKeys = Object.keys(source) as Array<keyof T>
  let result = {} as any
  for (const key of sourceKeys) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
      result[key] = targetValue.concat(sourceValue)
    } else if (isObject(sourceValue) && isObject(targetValue)) {
      result[key] = deepDuplicable(sourceValue as Record<string, unknown>, {
        ...(targetValue as Record<string, unknown>),
      })
    } else if (targetValue) {
      result[key] = targetValue
    } else {
      result[key] = sourceValue
    }
  }
  return result
}

const getPresets = (): Array<AppUIThemes> => {
  return [lightTheme, darkTheme]
}

const getPresetStaticTheme = (): AppUIThemes => {
  return lightTheme
}

const isAvailableThemeType = (type?: string): boolean => {
  if (!type) return false
  const presetThemes = getPresets()
  const hasType = presetThemes.find(theme => theme.type === type)
  return !hasType
}

const isPresetTheme = (
  themeOrType?: AppUserTheme | AppUIThemes | string,
): boolean => {
  if (!themeOrType) return false
  const isType = typeof themeOrType === 'string'
  const type = isType
    ? (themeOrType as string)
    : (themeOrType as Exclude<typeof themeOrType, string>).type
  return !isAvailableThemeType(type)
}

const hasUserCustomTheme = (themes: Array<AppUIThemes> = []): boolean => {
  return !!themes.find(item => isAvailableThemeType(item.type))
}

const create = (base: AppUIThemes, custom: AppUserTheme): AppUIThemes => {
  if (!isAvailableThemeType(custom.type)) {
    throw new Error('Duplicate or unavailable theme type')
  }

  return deepDuplicable(base, custom) as AppUIThemes
}

const createFromDark = (custom: AppUserTheme) => create(darkTheme, custom)
const createFromLight = (custom: AppUserTheme) => create(lightTheme, custom)

const Themes = {
  isPresetTheme,
  isAvailableThemeType,
  hasUserCustomTheme,
  getPresets,
  getPresetStaticTheme,
  create,
  createFromDark,
  createFromLight,
}

export default Themes
