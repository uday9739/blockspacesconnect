/*
* WARNING!!!!! This is script is intended for us in local host development environment only.
* In order to invoke script you must pass it as parameters the appRoleId and appSecretId.
* It is advised that these values be set as environment variabels in your local machine as VAULT_APP_SECRET_ID and VAULT_APP_ROLE_ID
* The best practice is to call the script via npm run bsc:fetch-secrets which will execute the script below and as defined is ./package.json
* "bsc:fetch-secrets": "node --loader ts-node/esm --experimental-specifier-resolution=node ./scripts/fetch-secrets.ts --appSecretId=$VAULT_APP_SECRET_ID --appRoleId=$VAULT_APP_ROLE_ID",
* */

import axios from "../node_modules/axios";
import { writeFileSync } from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as scriptUtils from "./scriptUtils";
import mergeFiles from '../node_modules/merge-files';

export type BscStatusReponse = {
  status: string
  data: any
};

const { __dirname } = scriptUtils.getModulePaths(import.meta.url);
const PROJECT_BASE_DIR = path.resolve(__dirname, "../");

/** Vault response object for use in all .env functions. */
let vaultSecretsResponse: [];

type VaultParams = {
  baseUrl: string,
  token: string,
  secretsPath: string,
  connectPath: string,
  tokenPath: string,
  appSecretId: string,
  appRoleId: string
}


doInit();


async function doInit(): Promise<void> {

  const argv: any = yargs(hideBin(process.argv)).argv;
  if (argv.appRoleId && argv.appSecretId) {

    let vaultParams = setVaultParams(argv.appRoleId, argv.appSecretId)
    console.log("\nGetting Secrets from Vault.");

    try {
      await axios.get("https://vault.blockspaces.dev", { timeout: 5000 });
    } catch (err) {
      console.log(`https://vault.blockspaces.dev is unreachable. Is the server online?`)
      return
    }

    await getSecrets(vaultParams).then(async (vaultResponse: BscStatusReponse) => {
      if (vaultResponse.status.toUpperCase() == "SUCCESS") {
        vaultSecretsResponse = vaultResponse.data;
        console.log("\nSuccessfully retrieved Secrets from Vault.");
      } else {
        throw new Error("Vault connection failed. doInit getting secrets init.ts");
      }
    });

    const targetPath = path.join(PROJECT_BASE_DIR, "core/.env.secrets");
    let envFile = ''
    for (const key of Object.keys(vaultSecretsResponse) as any) {
      envFile += `${key}=${vaultSecretsResponse[key]}\n`
    }

    writeFileSync(targetPath, envFile);

    const status = await mergeFiles([PROJECT_BASE_DIR + "/core/.env.local", PROJECT_BASE_DIR + "/core/.env.secrets"], PROJECT_BASE_DIR + "/core/.env");
    if (!status) {
      console.log(`Error: Unable to write merge environment variables into .env file`)
    } else {
      console.log(`Environment variables have been merged into ${PROJECT_BASE_DIR}/core/.env`)
    }

  } else {
    console.log("Error: Parameters missing. You must pass set the following environment variables")
    console.log("export NODE_ENV=local")
    console.log("export VAULT_APP_ROLE_ID=<role from Bitwarden>")
    console.log("export VAULT_APP_SECRET_ID=<secret from Bitwarden>")
  }
}

/**
 * Provides the parameters needed to make requests to the Vault API.
 *
 * @returns VaultParams
 */
function setVaultParams(vaultRoleId: string, vaultSecretId: string): VaultParams {

  let envVaultParams: VaultParams = {
    baseUrl: "https://vault.blockspaces.dev/v1",
    token: "",
    secretsPath: `/environments/data/local`,
    connectPath: "connect",
    tokenPath: "auth/approle/login",
    appSecretId: "",
    appRoleId: "",
  }

  envVaultParams.appSecretId = vaultSecretId
  envVaultParams.appRoleId = vaultRoleId

  return envVaultParams
}


/**
 * Contact Vault and get all Global secrets.
 *
 * @returns BscStatusReponse
 */
async function getSecrets(vaultParams: VaultParams): Promise<BscStatusReponse> {
  let _result: BscStatusReponse = {
    status: "Failed",
    data: ["getVaultCredential: Something unexpected happened. Check vault, viscosity, your network."],
  };

  await getVaultClientToken(vaultParams).then(async (_vaultResults: BscStatusReponse) => {
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
}

/**
 * Get the Vault Secret AppRole Token
 *
 * @returns BscStatusReponse
 */
async function getVaultClientToken(vaultParams: VaultParams): Promise<BscStatusReponse> {
  let _result: BscStatusReponse = {
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
}

