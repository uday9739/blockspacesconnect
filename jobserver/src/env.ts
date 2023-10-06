import {config} from "dotenv";
import * as path from "path";
import * as pkg from "../package.json";
import {getOsEnv} from "./env/EnvironmentUtility";

/** Load .env file or for tests the .env.test file. */
config({path: path.join(process.cwd(), `.env${process.env.NODE_ENV === "test" ? ".test" : ""}`)});

/** Environment variables */
export const env = {
  node: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  isDevelopment: process.env.NODE_ENV === "development",
  pid: process.pid,
  app: {
    name: getOsEnv("APP_NAME"),
    version: (pkg as any).version,
    description: (pkg as any).description,
    url: getOsEnv("BLOCKSPACES_SERVICES_URL"),
    port: getOsEnv("BLOCKSPACES_SERVICES_PORT"),
  },
  backend: {
    backendGrpcUrl: getOsEnv("SERVER_URL"),
    backendGrpcPort: getOsEnv("SERVER_PORT"),
  },
  vault: {
    vaultApiUrl: getOsEnv("VAULT_API_URL"),
    vaultConnectPath: getOsEnv("VAULT_CONNECT_PATH"),
    vaultClientPath: getOsEnv("VAULT_CLIENT_PATH"),
    vaultAppSecreteId: getOsEnv("VAULT_APP_SECRET_ID"),
    vaultAppRoleId: getOsEnv("VAULT_APP_ROLE_ID"),
  },
  appId: {
    oauthBaseUrl: getOsEnv("OAUTH_BASE_URL"),
    oauthClientId: getOsEnv("OAUTH_CLIENT_ID"),
    oauthTenantId: getOsEnv("OAUTH_TENANT_ID"),
    oauthSecret: getOsEnv("OAUTH_SECRET"),
    iamBaseUrl: getOsEnv("IAM_BASE_URL"),
    iamApiKey: getOsEnv("IAM_APIKEY"),
  },
  jobService: {
    agendaDbConnectString: getOsEnv("AGENDA_CONNECT_STRING"),
    agendaProcessInterval: getOsEnv("AGENDA_PROCESS_INTERVAL"),
    port: getOsEnv("JOBSERVER_PORT"),
    url: getOsEnv("JOBSERVER_URL"),
  },
  database: {
    mongoConnectString: getOsEnv("MONGO_CONNECT_STRING"),
    casbinDbConnectString: getOsEnv("CASBIN_DB_CONNECT_STRING"),
  },
  policyManager: {
    casbinModel: getOsEnv("CASBIN_MODEL_FILE"),
  },
  log: {
    level: getOsEnv("LOG_LEVEL"),
    log4jsConfigFile: getOsEnv("LOG4JS_CONFIG"),
  },
};
