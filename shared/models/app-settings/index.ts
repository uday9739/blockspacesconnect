export interface AppSettings {
  defaultPage?: string,
  bip?: {
    displayFiat: boolean
  },
  endpoints?: Object,
  pocket?: Object
  platform?: Object,
}

export const getDefaultAppSettings = (): AppSettings => {
  return {
    defaultPage: '/connect',
    bip: {
      displayFiat: false,
    }
  }
}