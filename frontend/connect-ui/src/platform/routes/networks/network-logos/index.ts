import { NetworkId } from '@blockspaces/shared/models/networks/Network'
import Pocket from './pocket'
import Lightning from './lightning'
import config from "@config"

export const NetworkLogos = {
  [NetworkId.POCKET]: Pocket,
  [NetworkId.LIGHTNING]: Lightning
}

export const getAddNetworksLogoUri = (networkId: string) => `${config.STATIC_FILES_BASE_URL}my-networks-${networkId}.svg`;
export const getMyNetworksLogoUri = (networkId: string) => `${config.STATIC_FILES_BASE_URL}my-networks-${networkId}.svg`;
export const getSideNavNetworksLogoUri = (networkId: string) => `${config.STATIC_FILES_BASE_URL}my-networks-${networkId}.svg`