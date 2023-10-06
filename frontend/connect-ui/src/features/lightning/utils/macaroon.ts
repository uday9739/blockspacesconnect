import { localStorageHelper } from "@platform/utils";

/**
 * Removes the macaroon from local storage.
 */
export function removeMacaroonFromStorage(nodeId: string) {
  return localStorageHelper.removeItem(`macaroon-${nodeId}`);
}

/**
 * Gets the macaroon from local storage.
 */
export function getMacaroonFromStorage(nodeId: string): string {
  return localStorageHelper.getItem(`macaroon-${nodeId}`);
}

/**
 * Sets the macaroon to local storage.
 */
export function setMacaroonToStorage(mac: string, nodeId: string) {
  return localStorageHelper.setItem(`macaroon-${nodeId}`, mac)
}