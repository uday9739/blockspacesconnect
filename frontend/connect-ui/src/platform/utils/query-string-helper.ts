/**
 * Returns a parsed query string parameter value as a string
 *
 * If the value is an array, the value of the 1st index of the array will be returned
 */
export function getString(value: string | string[]): string {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.length) return value[0];

  return null;
}

/**
 * Returns a parsed query string parameter value as a number.
 */
export function getNumber(value: string | string[]) {
  return parseInt(getString(value));
}

/**
 * Returns a parsed query string parameter value as a boolean.
 *
 * The string "true" will be converted to true, while "false" or "0" will be converted to false.
 * All other values will be converted using the {@link Boolean} constructor
 */
export function getBoolean(value: string | string[]) {
  const paramValue = getString(value)?.toLowerCase();

  if (paramValue === "true") return true;
  if (paramValue === "false" || paramValue === "0") return false;

  return Boolean(paramValue);
}