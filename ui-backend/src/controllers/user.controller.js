import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import logger from "../services/bscLogger.js";
import * as path from "path";
import { fileURLToPath } from "url";
import { StatusCodes } from "http-status-codes";
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);

const OAUTH_BASE_URL = process.env.OAUTH_BASE_URL;
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_TENANT_ID = process.env.OAUTH_TENANT_ID;
const OAUTH_SECRET = process.env.OAUTH_SECRET;
const IAM_BASE_URL = process.env.IAM_BASE_URL;
const IAM_APIKEY = process.env.IAM_APIKEY;
const TOKEN_COOKIE_NAME = "__token__";
let IAM_TOKEN = null;

const getIamToken = async () => {
  logger.debug("started getIamToken()", { module: thisModule });
  if (IAM_TOKEN && IAM_TOKEN.access_token && IAM_TOKEN.expiration > Date.now() / 1000 + 1000) {
    return IAM_TOKEN.access_token;
  } else {
    try {
      const parameters = new URLSearchParams();
      parameters.append("grant_type", "urn:ibm:params:oauth:grant-type:apikey");
      parameters.append("apikey", IAM_APIKEY);
      const requestOptions = {
        baseURL: `${IAM_BASE_URL}/identity/token`,
        url: "",
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: parameters,
      };
      axios
        .request(requestOptions)
        .then((response) => {
          logger.debug("getIamToken()", { module: thisModule }, { response: response.data });
          if (!response.data.access_token) {
            logger.error("getIamToken()", { module: thisModule }, { error: "Error getting IAM Token" });
            throw new Error("Error getting IAM Token");
          }
          IAM_TOKEN = response.data;
          logger.debug("finished getIamToken()", { module: thisModule }, { response: IAM_TOKEN });
          return IAM_TOKEN.access_token;
        })
        .catch((err) => {
          logger.error("getIamToken()", { module: thisModule }, { error: err });
          throw new Error(err.message || "Error getting IAM Token");
        });
    } catch (err) {
      logger.error("getIamToken()", { module: thisModule }, { error: err });
      throw err;
    }
  }
};

const addUser = async (email, password, clientId) => {
  logger.debug("started addUser()", { module: thisModule });
  let returnUserProfile = {};
  try {
    await getIamToken().then(async (iamToken) => {
      // First add the user to the registry
      const parameters = new URLSearchParams();
      let data = {
        emails: [
          {
            value: email,
            primary: true,
          },
        ],
        userName: email,
        password: password,
        status: "CONFIRMED",
      };
      parameters.append("shouldCreateProfile", "true");
      parameters.append("language", "en");
      let requestOptions = {
        baseURL: `${OAUTH_BASE_URL}/management/v4/${OAUTH_TENANT_ID}/cloud_directory/sign_up`,
        url: "",
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${iamToken}`,
        },
        data: data,
        params: parameters,
      };
      await axios.request(requestOptions).then(async (response) => {
        logger.debug("addUser()", "lookup", { module: thisModule }, { response: response.data });
        if (!response.data.profileId) {
          logger.error("addUser()", { module: thisModule }, { response: "Error creating user profile" });
          throw new Error("Error creating user profile");
        }
        const profileId = response.data.profileId;
        const clientId = uuidv4();

        // Add the clientId attribute with a generated clientId GUID (this will eventually be done outside of BS:C)
        data = {
          attributes: {
            clientId: clientId,
            orgs: [clientId]
          },
        };
        requestOptions = {
          baseURL: `${OAUTH_BASE_URL}/management/v4/${OAUTH_TENANT_ID}/users/${profileId}/profile`,
          url: "",
          method: "put",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${iamToken}`,
          },
          data: data,
        };
        await axios.request(requestOptions).then(async (response) => {
          logger.debug("addUser()", "add client id", { module: thisModule }, { response: response.data });
          if (response.status != 200) {
            logger.error("addUser()", { module: thisModule }, { response: "Error updating user profile with clientId" });
            throw new Error("Error updating user profile with clientId");
          }
          returnUserProfile = response.data;
        });
      });
    });
    logger.debug("finished addUser()", { module: thisModule }, { response: returnUserProfile });
    return returnUserProfile;
  } catch (err) {
    logger.error("addUser()", { module: thisModule }, { error: err });
    throw err;
  }
};

const findUser = async (email) => {
  logger.debug("started findUser()", { module: thisModule });
  try {
    await getIamToken().then(async (iamToken) => {
      const parameters = new URLSearchParams();
      parameters.append("email", email);
      const requestOptions = {
        baseURL: `${OAUTH_BASE_URL}/management/v4/${OAUTH_TENANT_ID}/users`,
        url: "",
        method: "get",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${iamToken}`,
        },
        params: parameters,
      };
      await axios
        .request(requestOptions)
        .then(async (response) => {
          logger.debug("findUser()", "lookup", { module: thisModule }, { response: response.data });
          const users = response.data.users;
          logger.debug("finished findUser()", { module: thisModule }, { response: users });
          return users;
        })
        .catch((err) => {
          logger.error("findUser()", { module: thisModule }, { error: err.response.data });
          throw new Error(err.message || "Error finding user by email");
        });
    });
  } catch (err) {
    logger.error("findUser()", { module: thisModule }, { error: err });
    throw err;
  }
};

function getCookieOptions(baseUrl) {
  return {
    path: baseUrl.match(/\/[^\/]*/)[0],
    httpOnly: true,
    secure: true,
    sameSite: true
  }
}

const userController = {
  getCurrent: (req, res) => {
    logger.debug("retrieving current user (req.user)", { module: thisModule });
    res.status(200).send(req.user);
  },

  register: async (req, res) => {
    logger.debug("started register()", { module: thisModule });
    // create new user in AppID
    const { email, password, passwordConfirm } = req.body;

    if (!email || !password || !passwordConfirm) {
      logger.debug("finished register()", { module: thisModule }, { response: "You are missing required fields" });
      return res.status(400).send({ message: "You are missing required fields" });
    } else if (password !== passwordConfirm) {
      logger.debug("finished register()", { module: thisModule }, { response: "Passwords must match" });
      return res.status(400).send({ message: "Passwords must match" });
    }
    try {
      await findUser(email).then(async (existingUserList) => {
        if (existingUserList && existingUserList.length > 0) {
          logger.debug("finished register()", { module: thisModule }, { response: "An account with this email already exists" });
          res.status(400).send({ message: "An account with this email already exists" });
        }

        const clientId = uuidv4();
        await addUser(email, password, clientId).then(async (userProfile) => {
          logger.debug("finished register()", { module: thisModule }, { response: userProfile });
          res.status(200).send({ message: "Successfully created user", data: userProfile });
        });
      });
    } catch (err) {
      logger.error("register()", { module: thisModule }, { error: err.message });
      res.status(500).send({ message: err.message || "Some error occurred while registering the user." });
    }
  },

  logIn: (req, res) => {
    logger.debug("started logIn()", { module: thisModule });
    // Login user with AppID
    try {
      const createCookies = Boolean(req.body.cookies);

      const parameters = new URLSearchParams();
      parameters.append("scope", "openid profile email appid_custom attributes");
      const data = new URLSearchParams();
      data.append("grant_type", "password");
      data.append("username", req.body.email);
      data.append("password", req.body.password);
      const encryptedAuth = Buffer.from(`${OAUTH_CLIENT_ID}:${OAUTH_SECRET}`, "utf8").toString("base64");
      const requestOptions = {
        baseURL: `${OAUTH_BASE_URL}/oauth/v4/${OAUTH_TENANT_ID}/token`,
        url: "",
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encryptedAuth}`,
        },
        data: data,
        parameters: parameters,
      };
      axios
        .request(requestOptions)
        .then((response) => {
          // logger.debug("login", {module: thisModule}, {billing: {billableEvent: "connectBlockflow"}}, {context: {transactionId: "123456"}});
          logger.debug("logIn()", { module: thisModule }, { response: response.data });
          const accessToken = jwt.decode(response.data.access_token);
          const clientId = accessToken.clientId;

          if (createCookies) {
            res.cookie(TOKEN_COOKIE_NAME, response.data.access_token, {
              ...getCookieOptions(req.baseUrl),
              expires: accessToken.exp ? new Date(accessToken.exp * 1000) : 0,
            })
          }

          logger.debug("finished logIn()", { module: thisModule });
          res.status(200).send({ email: req.body.email, clientId: clientId, token: response.data });
        })
        .catch((err) => {
          logger.error("logIn()", { module: thisModule }, { error: err.message ? err.message : "Error logging user in" });
          res.status(500).send({ message: err.message || "Error logging user in" });
        });
    } catch (err) {
      logger.error("logIn()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while validating user." });
      res.status(500).send({ message: err.message || "Some error occurred while validating user." });
    }
  },

  logout: (req, res) => {
    logger.debug("logging out user/invalidating cookies");
    res.clearCookie(TOKEN_COOKIE_NAME, getCookieOptions(req.baseUrl));
    return res.sendStatus(StatusCodes.OK);
  }
};
getIamToken();

export default userController;
