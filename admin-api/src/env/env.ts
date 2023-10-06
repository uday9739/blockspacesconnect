import { config } from "dotenv";
import * as path from "path";
import { getEnvDefault, getEnvRequired } from "./env.utils";

// this is a hack to load package.json w/o copying it to TS output directory; this will break if module type is not commonjs
const packageDotJson = require(path.join(process.cwd(), "package.json"));

// Load .env file or for tests the .env.test file
config();

/**
 * Environment variables
 *
 * When possible, environment variable data should be injected rather than accessed statically,
 * to increase testability.
 *
 * Injection Example:
 * ```
 * constructor(@Inject(ENV_TOKEN) private readonly env: EnvironmentVariables) {}
 * ```
 */
export const env = {
  node: process.env.NODE_ENV || "development",
  isStaging: process.env.NODE_ENV === "staging",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  isDevelopment: process.env.NODE_ENV === "development",
  pid: process.pid,
  ADMIN_PORTAL_DASHBOARD: getEnvRequired("ADMIN_PORTAL_DASHBOARD"),
  sso: {
    GOOGLE_CLIENT_ID: getEnvRequired("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: getEnvRequired("GOOGLE_CLIENT_SECRET"),
    GOOGLE_CALLBACK: getEnvRequired("GOOGLE_CALLBACK"),
  },
  database: {
    mongoConnectString: getEnvRequired("MONGO_CONNECT_STRING"),
    keepAlive: getEnvRequired("MONGO_CONNECTION_KEEP_ALIVE") === "true" ? true : false,
    keepAliveInitialDelay: parseInt(getEnvRequired("MONGO_CONNECTION_KEEP_ALIVE_INITIAL_DELAY"))
  },
  stagingDatabase: {
    mongoConnectString: getEnvRequired("MONGO_CONNECT_STRING_STAGING"),
    keepAlive: getEnvRequired("MONGO_CONNECTION_KEEP_ALIVE") === "true" ? true : false,
    keepAliveInitialDelay: parseInt(getEnvRequired("MONGO_CONNECTION_KEEP_ALIVE_INITIAL_DELAY"))
  },
  productionDatabase: {
    mongoConnectString: getEnvRequired("MONGO_CONNECT_STRING_PRODUCTION"),
    keepAlive: getEnvRequired("MONGO_CONNECTION_KEEP_ALIVE") === "true" ? true : false,
    keepAliveInitialDelay: parseInt(getEnvRequired("MONGO_CONNECTION_KEEP_ALIVE_INITIAL_DELAY"))
  },
};

/** A convenience type used for strongly typing environment variables */
export type EnvironmentVariables = typeof env;

/**
 * A token/key used for injecting environment variables
 *
 * Example:
 * ```
 * constructor(@Inject(ENV_TOKEN) private readonly env: EnvironmentVariables) {}
 * ```
 */
export const ENV_TOKEN = Symbol("env");
