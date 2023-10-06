import db from "../models/index.js";
import axios from "axios";

import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

import logger from "../services/bscLogger.js";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);


const vaultApiUrl = process.env.VAULT_API_URL;
const connectPath = process.env.VAULT_CONNECT_PATH;
const clientPath = process.env.VAULT_CLIENT_PATH;
const vaultAppSecretId = process.env.VAULT_APP_SECRET_ID;
const vaultAppRoleId = process.env.VAULT_APP_ROLE_ID;
const secretsMetadataPath = `${connectPath}/metadata/${clientPath}`;
const secretsDataPath = `${connectPath}/data/${clientPath}`;
// eslint-disable-next-line no-unused-vars
const { ClientCredentials, mongoose } = db;


const getVaultClientToken = async (user) => {
  logger.debug("started getVaultClientToken()", { module: thisModule });
  const authPath = "auth/jwt/login";
  let vaultClientToken = null;
  const data = {
    jwt: user.access_token,
  };
  const requestOptions = {
    baseURL: vaultApiUrl,
    url: authPath,
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: data,
  };
  await axios
    .request(requestOptions)
    .then(async (response) => {
      logger.debug("getVaultClientToken()", { module: thisModule }, { response: response.data });
      if (response.data && response.data.auth) {
        vaultClientToken = response.data.auth.client_token;
      } else {
        logger.error("getVaultClientToken()", { module: thisModule }, { error: response.data });
        // throw (err);
        throw new Error("failed to get vault client token");
      }
    })
    .catch((err) => {
      logger.error("getVaultClientToken()", { module: thisModule }, { error: err.response.data ? err.response.data : err.message });
      throw err;
    });
  logger.debug("finished getVaultClientToken()", { module: thisModule }, { response: vaultClientToken });
  return vaultClientToken;
};

const getVaultAppToken = async () => {
  logger.debug("started getVaultAppToken()", { module: thisModule });
  const authPath = "auth/approle/login";
  let vaultAppToken = null;
  const data = {
    role_id: vaultAppRoleId,
    secret_id: vaultAppSecretId,
  };
  const requestOptions = {
    baseURL: vaultApiUrl,
    url: authPath,
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: data,
  };
  await axios
    .request(requestOptions)
    .then(async (response) => {
      logger.debug("getVaultAppToken()", "successfully authenticated app with vault", { module: thisModule }, { response: response.data });
      if (response.data && response.data.auth) {
        vaultAppToken = response.data.auth.client_token;
      } else {
        logger.error("getVaultAppToken()", { module: thisModule }, { error: "failed to get vault app token" });
        // throw (err);
        throw new Error("failed to get vault app token");
      }
    })
    .catch((err) => {
      logger.error("getVaultAppToken()", { module: thisModule }, { error: err.response.data ? err.response.data : err.message });
      throw err;
    });
  logger.debug("finished getVaultAppToken()", { module: thisModule }, { response: vaultAppToken });
  return vaultAppToken;
};

const clientCredentialsController = {
  // Create and Save a new credential as a Vault Secret
  create: async (req, res) => {
    logger.debug("started create()", { module: thisModule });
    const secretData = { data: req.body.secrets };
    const clientId = req.user.clientId;
    const connector = req.params.connector;
    const credentialId = uuidv4();
    const label = req.body.label || "New";
    const description = req.body.description || "";

    // Create a Blockflow
    const newClientCredentials = new ClientCredentials({
      credentialId: credentialId,
      clientId: clientId,
      connectorId: connector,
      label: label,
      description: description,
    });

    // Save Client Credentials definition in the database
    newClientCredentials
      .save()
      .then((data) => {
        logger.debug("create()", "client credentials", { module: thisModule }, { response: data });
      })
      .catch((err) => {
        logger.error("create()", "newClientCredentials.save()", { module: thisModule }, { response: err.message ? err.message : "Some error occurred while creating the credentials." });
        res.status(500).send({
          message: err.message || "Some error occurred while creating the credentials.",
        });
      });

    const secretPath = `${secretsDataPath}/${clientId}/${connector}/${credentialId}`;
    logger.debug("create()", "SECRET PATH", { module: thisModule }, { response: secretPath });
    // console.log('SECRET PATH', secretPath)
    await getVaultClientToken(req.user)
      .then(async (vaultClientToken) => {
        if (vaultClientToken) {
          const requestOptions = {
            baseURL: vaultApiUrl,
            url: secretPath,
            method: "post",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Vault-Token": vaultClientToken,
            },
            data: secretData,
          };
          try {
            await axios
              .request(requestOptions)
              .then((response) => {
                // logger.debug("create()", "client credentials", {module: thisModule}, {response: response.data});
                logger.debug("finished create()", { module: thisModule }, { response: response.data });
                res.status(200).send({ message: `Successfully created credentials in ${secretPath}`, data: newClientCredentials });
              })
              .catch((err) => {
                logger.error("create()", "client credentials", { module: thisModule }, { error: err.message ? err.message : "Error creating client credentials" });
                res.status(err.response.status).send({ message: err.message || "Error creating client credentials" });
              });
          } catch (err) {
            logger.error("create()", "client credentials", { module: thisModule }, { error: err.message ? err.message : "Error creating client credentials" });
            res.status(err.response.status).send({ message: err.message || "Error creating client credentials" });
          }
        } else {
          logger.error("create()", { module: thisModule }, { error: "Error creating client credentials, no vault client token for user" });
          res.status(500).send({ message: "Error creating credentials, no vault client token for user" });
        }
      })
      .catch((err) => {
        logger.error("create()", { module: thisModule }, { error: err.message ? err.message : "Error creating client credentials, no vault client token for user" });
        res.status(500).send({ message: "Error creating credentials, no vault client token for user" });
      });
  },

  // Create and Save a new credential as a Vault Secret
  update: async (req, res) => {
    logger.debug("started update()", { module: thisModule });
    const secretData = { data: req.body.secrets };
    const clientId = req.user.clientId;
    const connector = req.params.connector;
    const credentialId = req.params.credentialId;
    const label = req.body.label;
    const description = req.body.description || "";

    const updatedClientCredentials = {
      label: label,
      description: description,
    };

    ClientCredentials.findOneAndUpdate({ credentialId: credentialId, clientId: clientId }, updatedClientCredentials, { new: true })
      .then((data) => {
        if (!data) {
          logger.debug("finished update()", { module: thisModule }, { response: `Cannot update Client Credentials definition with id=${credentialId}. Maybe Credential was not found!` });
          res.status(404).send({
            message: `Cannot update Client Credentials definition with id=${credentialId}. Maybe Credential was not found!`,
          });
        } else {
          logger.debug("finished update()", { module: thisModule }, { response: data.data });
          res.status(200).send({ message: "Client Credential definition was updated successfully." });
        }
      })
      .catch((err) => {
        logger.error("update()", { module: thisModule }, { error: err.message ? err.message : "Error updating Client Credential definition with id=" + credentialId });
        res.status(500).send({
          message: "Error updating Client Credential definition with id=" + credentialId,
        });
      });

    const secretPath = `${secretsDataPath}/${clientId}/${connector}/${credentialId}`;
    await getVaultClientToken(req.user)
      .then(async (vaultClientToken) => {
        if (vaultClientToken) {
          const requestOptions = {
            baseURL: vaultApiUrl,
            url: secretPath,
            method: "post",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Vault-Token": vaultClientToken,
            },
            data: secretData,
          };
          await axios
            .request(requestOptions)
            .then((response) => {
              // logger.debug("create client credentials", {module: thisModule}, {response: response.data});
              logger.debug("finished update()", { module: thisModule }, { response: response.data });
              res.status(200).send({ message: `Successfully created credentials in ${secretPath}` });
            })
            .catch((err) => {
              logger.error("update()", "create client credentials", { module: thisModule }, { error: err.message ? err.message : "Error creating client credentials" });
              res.status(err.response.status).send({ message: err.message || "Error creating client credentials" });
            });
        } else {
          logger.error("update()", { module: thisModule }, { error: "Error creating client credentials, no vault client token for user" });
          res.status(500).send({ message: "Error creating credentials, no vault client token for user" });
        }
      })
      .catch((err) => {
        logger.error("update()", { module: thisModule }, { error: "Error creating client credentials, no vault client token for user" });
        res.status(500).send({ message: "Error creating credentials, no vault client token for user" });
      });
  },

  // Read a credential as a Vault Secret
  read: async (req, res) => {
    logger.debug("started read()", { module: thisModule });
    const clientId = req.user.clientId;
    const connector = req.params.connector;
    const credentialId = req.params.credentialId;

    let credentialData = {};
    ClientCredentials.find({ credentialId: credentialId, clientId: clientId })
      .exec()
      .then((data) => {
        if (!data) {
          logger.error("read()", { module: thisModule }, { error: "Did not find a Credential with credentialId " + credentialId });
          res.status(404).send({ message: "Did not find a Credential with credentialId " + credentialId });
        } else if (!Array.isArray(data)) {
          logger.error("read()", { module: thisModule }, { error: "Did not find a Credential with credentialId " + credentialId });
          res.status(404).send({ message: "Did not find a Credential with credentialId " + credentialId });
        } else if (Array.isArray(data) && data.length < 1) {
          logger.error("read()", { module: thisModule }, { error: "Did not find a Credential with credentialId " + credentialId });
          res.status(404).send({ message: "Did not find a Credential with credentialId " + credentialId });
        } else if (Array.isArray(data) && data.length > 1) {
          logger.error("read()", { module: thisModule }, { error: "Found more than one Credential with credentialId " + credentialId });
          res.status(404).send({ message: "Found more than one Credential with credentialId " + credentialId });
        } else {
          credentialData = data[0];
        }
      })
      .catch((err) => {
        logger.error("read()", { module: thisModule }, { error: err.message ? err.message : "Error retrieving Credential with credentialId=" + credentialId });
        res.status(500).send({ message: "Error retrieving Credential with credentialId=" + credentialId });
      });

    const secretPath = `${secretsDataPath}/${clientId}/${connector}/${credentialId}`;
    await getVaultClientToken(req.user)
      .then(async (vaultClientToken) => {
        if (vaultClientToken) {
          const requestOptions = {
            baseURL: vaultApiUrl,
            url: secretPath,
            method: "get",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Vault-Token": vaultClientToken,
            },
          };
          await axios
            .request(requestOptions)
            .then((response) => {
              // logger.debug("read()", "client credentials", {module: thisModule}, {response: response.data});
              const data = {
                credentialId: credentialId,
                label: credentialData.label,
                description: credentialData.description,
                credential: response.data.data.data,
              };
              logger.debug("finished read()", { module: thisModule }, { response: data });
              res.status(200).send({ message: `Successfully read credentials in ${secretPath}`, data: data });
            })
            .catch((err) => {
              logger.error("read()", "client credentials", { module: thisModule }, { error: err.message ? err.message : "Error reading client credentials" });
              res.status(err.response.status).send({ message: `Error reading client credentials: ${err}` });
            });
        } else {
          logger.error("read()", { module: thisModule }, { error: "Error getting Vault Token" });
          res.status(500).send({ message: "Error getting Vault Token" });
        }
      })
      .catch((err) => {
        logger.error("read()", { module: thisModule }, { error: "Error getting Vault Token" });
        res.status(500).send({ message: "Error getting Vault Token" });
      });
  },

  // Read a credential as a Vault Secret for BlockSpaces Connect Engine
  use: async (req, res) => {
    logger.debug("started use()", { module: thisModule });
    const clientId = req.body.clientId;
    const connector = req.body.connector;
    const credentialId = req.body.credentialId;

    let credentialData = {};
    ClientCredentials.find({ credentialId: credentialId, clientId: clientId })
      .exec()
      .then(async (data) => {
        if (!data) {
          logger.error("use()", "client credentials", { module: thisModule }, { error: "Did not find a Credential with credentialId " + credentialId });
          res.status(404).send({ message: "Did not find a Credential with credentialId " + credentialId });
        } else if (!Array.isArray(data)) {
          logger.error("use()", "client credentials", { module: thisModule }, { error: "Did not find a Credential with credentialId " + credentialId });
          res.status(404).send({ message: "Did not find a Credential with credentialId " + credentialId });
        } else if (Array.isArray(data) && data.length < 1) {
          logger.error("use()", "client credentials", { module: thisModule }, { error: "Did not find a Credential with credentialId " + credentialId });
          res.status(404).send({ message: "Did not find a Credential with credentialId " + credentialId });
        } else if (Array.isArray(data) && data.length > 1) {
          logger.error("use()", "client credentials", { module: thisModule }, { error: "Found more than one Credential with credentialId " + credentialId });
          res.status(404).send({ message: "Found more than one Credential with credentialId " + credentialId });
        } else {
          credentialData = data[0];
          const secretPath = `${secretsDataPath}/${clientId}/${connector}/${credentialId}`;
          await getVaultAppToken(req.user)
            .then(async (vaultAppToken) => {
              if (vaultAppToken) {
                const requestOptions = {
                  baseURL: vaultApiUrl,
                  url: secretPath,
                  method: "get",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Vault-Token": vaultAppToken,
                  },
                };
                await axios
                  .request(requestOptions)
                  .then((response) => {
                    // logger.debug("use()", "client credentials", {module: thisModule}, {response: response.data});
                    const data = {
                      credentialId: credentialId,
                      label: credentialData.label,
                      description: credentialData.description,
                      credential: response.data.data.data,
                    };
                    logger.debug("finished use()", { module: thisModule }, { response: data });
                    res.status(200).send({ message: `Successfully read credentials in ${secretPath}`, data: data });
                  })
                  .catch((err) => {
                    logger.error("use()", "client credentials", { module: thisModule }, { error: err.message ? err.message : "Error reading client credentials" });
                    res.status(err.response.status).send({ message: `Error reading client credentials: ${err}` });
                  });
              } else {
                logger.error("use()", { module: thisModule }, { error: "Error getting Vault Token" });
                res.status(500).send({ message: "Error getting Vault Token" });
              }
            })
            .catch((err) => {
              logger.error("use()", { module: thisModule }, { error: err.message ? err.message : "Error getting Vault Token" });
              res.status(500).send({ message: "Error getting Vault Token" });
            });
        }
      })
      .catch((err) => {
        logger.error("use()", "client credentials", { module: thisModule }, { error: err.message ? err.message : "Error retrieving Credential with credentialId=" + credentialId });
        res.status(500).send({ message: "Error retrieving Credential with credentialId=" + credentialId });
      });
  },

  // List a set of credentials from the Vault for a given connector
  list: async (req, res) => {
    logger.debug("started list()", { module: thisModule });
    const clientId = req.user.clientId;
    const connector = req.params.connector;

    let returnCredentials = {};
    await ClientCredentials.find({ connectorId: connector, clientId: clientId })
      .exec()
      .then((data) => {
        if (!data) {
          logger.debug("finished list()", { module: thisModule }, { response: `Did not find any Credentials for Connector ${connector}` });
          res.status(200).send({ message: `Did not find any Credentials for Connector ${connector}`, data: [] });
        } else if (Array.isArray(data) && data.length < 1) {
          logger.debug("finished list()", { module: thisModule }, { response: `Did not find any Credentials for Connector ${connector}` });
          res.status(200).send({ message: `Did not find any Credentials for Connector ${connector}`, data: [] });
        } else {
          returnCredentials = data.map((credential) => {
            const returnCredential = {
              credentialId: credential.credentialId,
              connectorId: credential.connectorId,
              label: credential.label,
            };
            return returnCredential;
          });
          logger.debug("finished list()", { module: thisModule }, { response: returnCredentials });
          res.status(200).send({ message: "Successfully retrieved the list of credentials", data: returnCredentials });
        }
      })
      .catch((err) => {
        logger.error("list()", { module: thisModule }, { error: err.message ? err.message : "Error retrieving Credentials" });
        res.status(500).send({ message: "Error retrieving Credentials" });
      });
  },

  // Delete a credential from the vault
  delete: async (req, res) => {
    logger.debug("started delete()", { module: thisModule });
    const clientId = req.user.clientId;
    const connector = req.params.connector;
    const credentialId = req.params.credentialId;

    ClientCredentials.findOneAndRemove({ credentialId: credentialId, clientId: clientId })
      .then((data) => {
        if (!data) {
          logger.error("delete()", { module: thisModule }, { error: `Cannot delete Credential with id=${credentialId}. Maybe Credential was not found!` });
          res.status(404).send({
            message: `Cannot delete Credential with id=${credentialId}. Maybe Credential was not found!`,
          });
        }
      })
      .catch((err) => {
        logger.error("delete()", { module: thisModule }, { error: `Error deleting client credentials, no vault client token for user` });
        res.status(err.response.status).send({
          message: `Could not delete Credential with id=${credentialId}. Error: ${err}`,
        });
      });

    let requestOptions = {
      baseURL: "http://localhost:3000/api",
      url: "blockflow/removeCredentials",
      method: "put",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${req.user.access_token}`
      },
      data: {
        credentialId: credentialId,
      },
    };
    await axios
      .request(requestOptions)
      .then((response) => {
        if (response) {
          logger.debug("finished delete()", { module: thisModule }, { response: response.data });
          // res.status(200).send({ message: `Successfully deleted credentials ${credentialId} from blockflows ` });
        } else {
          logger.error("delete()", "removeCredentials()", { module: thisModule }, { error: `Error deleting client credentials ${credentialId} from blockflows` });
          res.status(500).send({ message: `Error deleting client credentials ${credentialId} from blockflows` });
        }
      })
      .catch((err) => {
        logger.error("delete()", "client credentials", { module: thisModule }, { error: err.message ? err.message : "Error deleting client credentials" });
        res.status(err.response.status).send({ message: err.message || "Error deleting client credentials" });
      });

    const secretPath = `${secretsMetadataPath}/${clientId}/${connector}/${credentialId}`;
    await getVaultClientToken(req.user)
      .then(async (vaultClientToken) => {
        if (vaultClientToken) {
          requestOptions = {
            baseURL: vaultApiUrl,
            url: secretPath,
            method: "delete",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Vault-Token": vaultClientToken,
            },
          };
          await axios
            .request(requestOptions)
            .then((response) => {
              if (response) {
                // logger.debug("delete()", "client credentials", {module: thisModule}, {response: response.data});
                logger.debug("finished delete()", { module: thisModule }, { response: response });
                res.status(200).send({ message: `Successfully deleted credentials in ${secretPath}` });
              } else {
                logger.error("delete()", "getVaultClientToken()", { module: thisModule }, { error: `Error deleting client credentials in ${secretPath}` });
                res.status(500).send({ message: `Error deleting client credentials in ${secretPath}` });
              }
            })
            .catch((err) => {
              logger.error("delete()", "client credentials", { module: thisModule }, { error: err.message ? err.message : "Error deleting client credentials" });
              res.status(err.response.status).send({ message: err.message || "Error deleting client credentials" });
            });
        } else {
          logger.error("delete()", { module: thisModule }, { error: `Error deleting client credentials, no vault client token for user` });
          res.status(500).send({ message: "Error deleting credentials, no vault client token for user" });
        }
      })
      .catch((err) => {
        logger.error("delete()", { module: thisModule }, { error: err.message ? err.message : `Error deleting client credentials, no vault client token for user` });
        res.status(500).send({ message: "Error deleting credentials, no vault client token for user" });
      });
  },
};

export default clientCredentialsController;
