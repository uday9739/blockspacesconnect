import jwt from "jsonwebtoken";
import path from "path";

import logger from "../services/bscLogger.js";
import { fileURLToPath } from "url";
import express from "express";
import { StatusCodes } from "http-status-codes";

const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);

/**
 * Tries to fetch the access token from the HTTP headers or cookies
 * @param {express.Request} req express.js request object
 */
function getAccessToken(req) {
    let accessToken = req.header("Authorization");

    if (accessToken) {
        // strip "Bearer " and just return the encoded token
        return accessToken.substring(7);
    }

    if (req.cookies) {
        return req.cookies["__token__"];
    }

    return null;
}

/**
 * Authenticates a user using a JWT access token provided via the Authorization header or a cookie
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const authenticateUser = (req, res, next) => {
    logger.debug("started authenticateUser()", { module: thisModule });
    req.user = {};

    const accessToken = getAccessToken(req);

    if (!accessToken) {
        res.status(StatusCodes.UNAUTHORIZED)
            .contentType("text/plain")
            .send("The request must include an access token");

        return;
    }

    const publicKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiJMX73qZ" +
        "VvtJKT1eA3M0FhD2YjLq/xfE0/9JM8MO2JUB1NwfILN8kfNhUmH61bFoHH4uva/brW8BJhUAWKWfoRWp" +
        "JN5GFvr+0Vbl0A7CLo+y06JH6D1iMWX1sup6Hj6deWbkDMTUOsKRSF6Tw9AJzC9ItkXMkdsxB+JEK/xq" +
        "yXqmAERJGVgzeJcHsN85JTGLcA1X3+rSTZqXAMjVH8+AyHAFo6TKHtHvll4XA3vXQeQKcrk2M7P770hc" +
        "y73HfwI+kFZfi2fBa2wBk5RUUgnPvr4jk9G5l9FrdcP2ktpTQsPA0Y9hzT9OQnuX/z4KNd5RlX0SzsQ8" +
        "gSq29JmoXPOMgQIDAQAB\n-----END PUBLIC KEY-----";
    try {
        const tokenData = jwt.verify(accessToken, publicKey);

        req.user = {
            email: tokenData.userName,
            clientId: tokenData.clientId,
            access_token: accessToken
        };
        logger.debug("finished authenticateUser()", { module: thisModule });

        next();
    } catch (err) {
        logger.error("authenticateUser()", {
            module: thisModule
        }, {
            error: err.message
                ? err.message
                : `Error authenticating user ${req.user}`
        });

        res.status(StatusCodes.UNAUTHORIZED)
            .contentType("text/plain")
            .send(err.message || "invalid access token");
    }
};

export default authenticateUser;
