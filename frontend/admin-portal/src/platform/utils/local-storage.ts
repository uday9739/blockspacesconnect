const localStorageAvailable: boolean = typeof localStorage !== "undefined";

export type LocalStorageHelper = {
  // remap the Storage interface, removing the index signature "[x: string]: any"
  [K in keyof Storage as string extends K ? never : K]: Storage[K]
}

/**
 * A wrapper around {@link localStorage} that is safe to use on the client and server
 *
 * On the server, this library will not provide any type of local storage mechanism, but will
 * simply prevent the operations from failing. Non-void functions will return the same value
 * that they would on the client if no data were available (null, undefined, etc). Void returning
 * functions will be a NO-OP
 */
const localStorageHelper: LocalStorageHelper = {
  get length(): number {
    return localStorageAvailable ? localStorage.length : 0;
  },

  clear(): void {
    localStorageAvailable && localStorage.clear();
  },

  getItem(key: string): string | null {
    return localStorageAvailable ? localStorage.getItem(key) : null;
  },

  key(index: number): string | null {
    return localStorageAvailable ? localStorage.key(index) : null;
  },

  removeItem(key: string): void {
    localStorageAvailable && localStorage.removeItem(key)
  },

  setItem(key: string, value: string): void {
    localStorageAvailable && localStorage.setItem(key, value);
  }
}

export default localStorageHelper