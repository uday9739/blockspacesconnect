import {join} from 'path';

/**
 * Gets the value of an environment variable with a given key from `process.env`.
 * If the environment variable is undefined, an error will be thrown.
 */
export function getEnvRequired(key: string): string {
  if (typeof process.env[key] === 'undefined') {
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return process.env[key] as string;
}

/**
 * Gets the value of an environment variable with a given key from `process.env`,
 * returning undefined if the environment variable is not defined
 */
export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}

/**
 * Gets the value of an environment variable with the given key in `process.env`.
 * If the value for the key is falsey, then `defaultValue` is returned instead.
 */
export function getEnvDefault(key: string, defaultValue: string): string {
  return getEnvOptional(key) || defaultValue;
}

export function getPath(path: string): string {
  return (process.env.NODE_ENV === 'production')
    ? join(process.cwd(), path.replace('src/', 'dist/').slice(0, -3) + '.js')
    : join(process.cwd(), path);
}

export function getPaths(paths: string[]): string[] {
  return paths.map(p => getPath(p));
}

export function getOsPath(key: string): string {
  return getPath(getEnvRequired(key));
}

export function getOsPaths(key: string): string[] {
  return getPaths(getOsEnvArray(key));
}

export function getOsEnvArray(key: string, delimiter: string = ','): string[] {
  if(typeof process.env[key] !== undefined && process.env[key] ) {
    return process.env[key] && process.env[key]?.split(delimiter) || [];
  }else {
    return []
  }
}

export function toNumber(value: string): number {
  return parseInt(value, 10);
}

export function toBool(value: string): boolean {
  return value === 'true';
}

export function normalizePort(port: string): number | string | boolean {
  const parsedPort = parseInt(port, 10);
  if (isNaN(parsedPort)) { // named pipe
    return port;
  }
  if (parsedPort >= 0) { // port number
    return parsedPort;
  }
  return false;
}
