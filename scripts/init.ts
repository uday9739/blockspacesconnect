/**
 * Run this file locally using npm run locally and all the .env files will be updated with vault values.
 * Passing in the option targetEnv=[local,development,staging,production] will build the env file for that hosting enviroment.
 */
import { BscStatusResponse } from "../core/src/legacy/types/BscStatusResponse";
import axios from "../node_modules/axios";
import { copyFileSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as scriptUtils from "./scriptUtils";

const { __filename, __dirname } = scriptUtils.getModulePaths(import.meta.url);
const PROJECT_BASE_DIR = path.resolve(__dirname, "../");

/** Vault response object for use in all .env functions. */
let vaultSecretsResponse: [];

/** Command line options */
type Options = {
  targetEnv: string,
  webContainers: boolean,
  overwrite: boolean,
  vaultUrl: string,
  vaultRoleId: string,
  vaultSecretId: string
};

type VaultParams = {
  baseUrl: string,
  token: string,
  secretsPath: string,
  connectPath: string,
  tokenPath: string,
  appSecretId: string,
  appRoleId: string
}

/** Load Vault Secrets data here for use. */
const DEFAULT_OPTIONS: Options = {
  targetEnv: "Local",
  overwrite: false,
  webContainers: false,
  vaultUrl: "http://23.23.108.243:8200/v1",
  vaultRoleId: "a043e905-51f8-6f35-a0b9-ea8a3593b85e",
  vaultSecretId: "43e815db-e0a9-fc5f-d522-3856ba42c00c"
};

/** get options from command line */
const options: Options = buildOptionsFromCommandLine();

/** parameters to use for making requests to the Vault API */
const vaultParams: VaultParams = getVaultParams();

console.log("Vault params = ", vaultParams)

/** execute main script */
doInit();

/** Main working Function Fires off env build events */
async function doInit(): Promise<void> {

  // Load secrets from Vault for use in subsquent functions.
  console.log("\nGetting Secrets from Vault.");
  await getSecrets().then(async (vaultResponse: BscStatusResponse) => {
    if (vaultResponse.status.toUpperCase() == "SUCCESS") {
      vaultSecretsResponse = vaultResponse.data;
      console.log("\nSuccefully retrieved Secrets from Vault.");
    } else {
      throw new Error("Vault connection failed. doInit getting secrets init.ts");
    }
  });

  // If building local then all .env files need to be updated.

  console.log("Updating docker-compose configuration");
  await updateDockerComposeEnv();

  console.log("\nUpdating .env for frontend/connect-ui");
  await updateFrontendEnv();

  console.log("\nUpdating .env for Core");
  await updateCoreEnv();

  console.log("\nUpdating .env for rproxy");
  await updateRproxyEnv();

  console.log("\nUpdating .env for mongo");
  await updateMongoEnv();

  console.log("\nUpdating .env for postgres");
  await updatePostgresEnv();

  console.log("\nUpdating .env for db-migrations");
  await updateDbMigrationsEnv();

};

/** Provides the parameters needed to make requests to the Vault API */
function getVaultParams(): VaultParams {
  return {
    baseUrl: options.vaultUrl,
    token: "",
    secretsPath: `/environments/data/${options.targetEnv.toLocaleLowerCase()}`,
    connectPath: "connect",
    tokenPath: "auth/approle/login",
    appRoleId: options.vaultRoleId,
    appSecretId: options.vaultSecretId
  }
}

/**
 * Update the db-migrations project with vault values.
 */
async function updateDbMigrationsEnv(): Promise<void> {
  const templatePath = path.join(PROJECT_BASE_DIR, "db-migrations/.env.update");
  const dotEnvPath = path.join(PROJECT_BASE_DIR, "db-migrations/.env");

  if (!options.overwrite && scriptUtils.fileExistsSync(dotEnvPath)) {
    const overwriteEnv = await scriptUtils.promptBoolean(`Do you want to overwrite the .env file for db-migrations?`);
    if (!overwriteEnv) return;
  };

  doEnvUpdate(templatePath, dotEnvPath);
};

/**
 * Update the CORE .env file for use
 *
 * @returns Void
 */
async function updateCoreEnv(): Promise<void> {
  const templatePath = path.join(PROJECT_BASE_DIR, "core/.env.update");
  const dotEnvPath = path.join(PROJECT_BASE_DIR, "core/.env");

  if (!options.overwrite && scriptUtils.fileExistsSync(dotEnvPath)) {
    const overwriteEnv = await scriptUtils.promptBoolean(`Do you want to overwrite the .env file for Core?`);
    if (!overwriteEnv) return;
  };

  doEnvUpdate(templatePath, dotEnvPath);
};

/**
 * Update the ROOT env file (.env.local.docker or .env.local.default)
 *
 * @returns Void
 */
async function updateDockerComposeEnv(): Promise<void> {
  const dotEnvTemplate = ".env.update";
  const templatePath = path.join(PROJECT_BASE_DIR, dotEnvTemplate);
  const dotEnvPath = path.join(PROJECT_BASE_DIR, ".env");

  if (!options.overwrite && scriptUtils.fileExistsSync(dotEnvPath)) {
    const overwriteEnv = await scriptUtils.promptBoolean(`Do you want to overwrite the .env file for docker-compose?`);
    if (!overwriteEnv) return;
  }

  doEnvUpdate(templatePath, dotEnvPath);
};

/**
 * Update the frontend .env file
 *
 * @returns Void
 */
async function updateFrontendEnv(): Promise<void> {
  const templatePath = path.join(PROJECT_BASE_DIR, "frontend/connect-ui/.env.update");
  const dotEnvPath = path.join(PROJECT_BASE_DIR, "frontend/connect-ui/.env");

  if (!options.overwrite && scriptUtils.fileExistsSync(dotEnvPath)) {
    const overwriteEnv = await scriptUtils.promptBoolean(`Do you want to overwrite the .env file for the Frontend?`);
    if (!overwriteEnv) return;
  };

  doEnvUpdate(templatePath, dotEnvPath);
};


/**
 * Update the Nginx (rproxy) .env file 
 *
 * @returns Void
 */
async function updateRproxyEnv(): Promise<void> {
  const templatePath = path.join(PROJECT_BASE_DIR, "nginx/.env.update");
  const dotEnvPath = path.join(PROJECT_BASE_DIR, "nginx/.env");

  if (!options.overwrite && scriptUtils.fileExistsSync(dotEnvPath)) {
    const overwriteEnv = await scriptUtils.promptBoolean(`Do you want to overwrite the .env file for rproxy?`);
    if (!overwriteEnv) return;
  };

  doEnvUpdate(templatePath, dotEnvPath);
};

/**
 * Update the Mongo .env file
 *
 * @returns Void
 */
async function updateMongoEnv(): Promise<void> {
  const templatePath = path.join(PROJECT_BASE_DIR, "mongodb/.env.update");
  const dotEnvPath = path.join(PROJECT_BASE_DIR, "mongodb/.env");

  if (!options.overwrite && scriptUtils.fileExistsSync(dotEnvPath)) {
    const overwriteEnv = await scriptUtils.promptBoolean(`Do you want to overwrite the .env file for mongo?`);
    if (!overwriteEnv) return;
  };

  doEnvUpdate(templatePath, dotEnvPath);
};

/**
 * Update the Postgres .env file 
 *
 * @returns Void
 */
async function updatePostgresEnv(): Promise<void> {
  const templatePath = path.join(PROJECT_BASE_DIR, "postgres/.env.update");
  const dotEnvPath = path.join(PROJECT_BASE_DIR, "postgres/.env");

  if (!options.overwrite && scriptUtils.fileExistsSync(dotEnvPath)) {
    const overwriteEnv = await scriptUtils.promptBoolean(`Do you want to overwrite the .env file for postgres?`);
    if (!overwriteEnv) return;
  };

  doEnvUpdate(templatePath, dotEnvPath);
};

/**
 * Contact Vault and get all Global secrets.
 *
 * @returns BscStatusReponse
 */
async function getSecrets(): Promise<BscStatusResponse> {
  let _result: BscStatusResponse = {
    status: "Failed",
    data: ["getVaultCredential: Something unexpected happened. Check vault, viscosity, your network."],
  };

  await getVaultClientToken().then(async (_vaultResults: BscStatusResponse) => {
    if (_vaultResults.status.toUpperCase() == "SUCCESS") {
      await axios
        .request({
          baseURL: vaultParams.baseUrl,
          url: vaultParams.secretsPath,
          method: "get",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Vault-Token": _vaultResults.data.toString(),
          },
        })
        .then((response) => {
          _result = { status: "Success", data: response.data.data.data };
        })
        .catch((err) => {
          _result = { status: "Failed", data: [err] };
        });
    } else {
      throw new Error("Vault connection failed. getVaultClientToken of init.ts")
    }
  });

  return _result;
};

/**
 * Get the Vault Secret AppRole Token
 *
 * @returns BscStatusReponse
 */
async function getVaultClientToken(): Promise<BscStatusResponse> {
  let _result: BscStatusResponse = {
    status: "Failed",
    data: ["getVaultClientToken: Something unexpected happened. Check vault, viscosity, your network."],
  };
  try {
    await axios
      .request({
        baseURL: vaultParams.baseUrl,
        url: vaultParams.tokenPath,
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: {
          "secret_id": vaultParams.appSecretId,
          "role_id": vaultParams.appRoleId
        },
      })
      .then(async (response) => {
        if (response.data && response.data.auth) {
          _result = { status: "Success", data: response.data.auth.client_token };
        } else {
          _result = { status: "Failed", data: [response] };
        }
      })
      .catch((err) => {
        _result = { status: "Failed", data: [err] };
      });
  } catch (error) {
    _result = { status: "Failed", data: ["getVaultClientToken: " + error] };
  }
  return _result;
};

/**
 * worker function using Vault results to update .env
 *
 * @param application .env template Path
 * @param application .env file Path
 */
function doEnvUpdate(templatePath: string, dotEnvPath: string) {
  let dotEnvContents = readFileSync(templatePath).toString();
  for (var key in vaultSecretsResponse) {
    if (vaultSecretsResponse.hasOwnProperty(key)) {
      dotEnvContents = updateEnvVariableInString(dotEnvContents, key, vaultSecretsResponse[key]);
    }
  }
  writeFileSync(dotEnvPath, dotEnvContents);
}

/**
 * RegExp replace env property value with a vault value
 *
 * @param stringWithEnvVariables the env file as string
 * @param name env property name
 * @param value env property value
 * @returns
 */
function updateEnvVariableInString(stringWithEnvVariables: string, name: string, value: any): string {
  const envVarRegex = new RegExp(`^${name}=.*$`, "m");
  return stringWithEnvVariables.replace(envVarRegex, `${name}=${value}`);
};

/**
 * Process command line options into Type Options
 *
 * @returns type Options
 */
function buildOptionsFromCommandLine(): Options {
  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 [options]")
    .options({
      "targetEnv": {
        type: "string",
        description: "Target Enviroment for building .env file",
        default: DEFAULT_OPTIONS.targetEnv
      },
      "overwrite": {
        type: "boolean",
        default: DEFAULT_OPTIONS.overwrite,
        description: "Overwrite existing .env files by default"
      },
      "web-containers": {
        type: "boolean",
        default: DEFAULT_OPTIONS.webContainers,
        description: "specifies that web apps (backend, ui-backend, frontend) are run in containers"
      },
      "vault-url": {
        type: "string",
        requiresArg: false,
        description: "base url for Vault API"
      },
      "vault-role-id": {
        type: "string",
        requiresArg: false,
        description: "id of Vault app role"
      },
      "vault-secret-id": {
        type: "string",
        requiresArg: false,
        description: "id of Vault app secret"
      }
    })
    .strictCommands()
    .parse();

  const options: Options = Object.assign({}, DEFAULT_OPTIONS, argv);

  return options;
};
