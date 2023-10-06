/* eslint-disable linebreak-style,prefer-const */
import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";

import path from "path";
import logger from "../services/bscLogger.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);


const tranformationsController = {
  // Add two numbers and produce the result
  numberAdd: (req, res) => {
    logger.debug("started numberAdd()", { module: thisModule });
    const field1 = req.body.field1;
    const field2 = req.body.field2;
    let result = 0;
    if (!Number.isNaN(field1) && !Number.isNaN(field2)) {
      result = field1 + field2;
      logger.debug("finished numberAdd()", { module: thisModule }, { response: result });
      res.status(200).send({ message: "Successful", result: result });
    } else {
      logger.error("numberAdd()", { module: thisModule }, { error: "Field 1 and Field 2 must both be numeric" });
      res.status(500).send({ message: "Field 1 and Field 2 must both be numeric" });
    }
  },

  // Subtract field2 from field1
  numberSubtract: (req, res) => {
    logger.debug("started numberSubtract()", { module: thisModule });
    const field1 = req.body.field1;
    const field2 = req.body.field2;
    let result = 0;
    if (!Number.isNaN(field1) && !Number.isNaN(field2)) {
      result = field1 - field2;
      logger.debug("finished numberSubtract()", { module: thisModule }, { response: result });
      res.status(200).send({ message: "Successful", result: result });
    } else {
      logger.error("numberSubtract()", { module: thisModule }, { error: "Field 1 and Field 2 must both be numeric" });
      res.status(500).send({ message: "Field 1 and Field 2 must both be numeric" });
    }
  },

  // Multiply field1 and field2
  numberMultiply: (req, res) => {
    logger.debug("started numberMultiply()", { module: thisModule });
    const field1 = req.body.field1;
    const field2 = req.body.field2;
    let result = 0;
    if (!Number.isNaN(field1) && !Number.isNaN(field2)) {
      result = field1 * field2;
      logger.debug("finished numberMultiply()", { module: thisModule }, { response: result });
      res.status(200).send({ message: "Successful", result: result });
    } else {
      logger.error("numberMultiply()", { module: thisModule }, { error: "Field 1 and Field 2 must both be numeric" });
      res.status(500).send({ message: "Field 1 and Field 2 must both be numeric" });
    }
  },

  // Divide field1 by field2
  numberDivide: (req, res) => {
    logger.debug("started numberDivide()", { module: thisModule });
    const field1 = req.body.field1;
    const field2 = req.body.field2;
    let result = 0;
    if (!Number.isNaN(field1) && !Number.isNaN(field2)) {
      if (field2 !== 0) {
        result = field1 / field2;
        logger.debug("finished numberMultiply()", { module: thisModule }, { response: result });
        res.status(200).send({ message: "Successful", result: result });
      } else {
        logger.error("numberDivide()", { module: thisModule }, { error: "The divisor Field 2 cannot be 0" });
        res.status(500).send({ message: "The divisor Field 2 cannot be 0" });
      }
    } else {
      logger.error("numberDivide()", { module: thisModule }, { error: "Field 1 and Field 2 must both be numeric" });
      res.status(500).send({ message: "Field 1 and Field 2 must both be numeric" });
    }
  },

  // Convert numeric field to a String
  numberToString: (req, res) => {
    logger.debug("started numberToString()", { module: thisModule });
    const field1 = req.body.field1;
    let result = 0;
    if (!Number.isNaN(field1)) {
      result = field1.toString();
      logger.debug("finished numberMultiply()", { module: thisModule }, { response: result });
      res.status(200).send({ message: "Successful", result: result });
    } else {
      logger.error("numberToString()", { module: thisModule }, { error: "Field 1 and Field 2 must both be numeric" });
      res.status(500).send({ message: "Field 1 and Field 2 must both be numeric" });
    }
  },

  // Concatenate list of strings with an optional spacer
  stringConcatenate: (req, res) => {
    logger.debug("started stringConcatenate()", { module: thisModule });
    const strings = req.body.strings;
    const spacer = req.body.spacer || "";
    if (!strings && Array.isArray(strings)) {
      logger.error("stringConcatenate()", { module: thisModule }, { error: "Must supply a list of strings" });
      res.status(500).send({ message: "Must supply a list of strings" });
    }
    if (spacer && typeof spacer !== "string") {
      logger.error("numberToString()", { module: thisModule }, { error: "Spacer must be a string" });
      res.status(500).send({ message: "Spacer must be a string" });
    }
    let result = strings.join(spacer);
    logger.debug("finished stringConcatenate()", { module: thisModule }, { response: result });
    res.status(200).send({ message: "Successful", result: result });
  },

  // Split a string from the starting position to the optional ending position
  stringSubstring: (req, res) => {
    logger.debug("started stringSubstring()", { module: thisModule });
    const string = req.body.string;
    const starting = req.body.starting || 0;
    const numChars = req.body.numChars;
    if (!string) {
      logger.error("stringSubstring()", { module: thisModule }, { error: "Must supply a string" });
      res.status(500).send({ message: "Must supply a string" });
    }
    let result = string.substr(starting, numChars);
    logger.debug("finished stringSubstring()", { module: thisModule }, { response: result });
    res.status(200).send({ message: "Successful", result: result });
  },

  // Split a string from the starting position to the optional ending position return an array of strings
  stringSplit: (req, res) => {
    logger.debug("started stringSplit()", { module: thisModule });
    const string = req.body.string;
    const split = req.body.split;
    if (!string) {
      logger.error("stringSplit()", { module: thisModule }, { error: "Must supply a string" });
      res.status(500).send({ message: "Must supply a string" });
    }
    let result = string.split(split);
    logger.debug("finished stringSplit()", { module: thisModule }, { response: result });
    res.status(200).send({ message: "Successful", result: result });
  },

  // Upper Case a string
  stringToUpperCase: (req, res) => {
    logger.debug("started stringToUpperCase()", { module: thisModule });
    const string = req.body.string;
    if (!string) {
      logger.error("stringToUpperCase()", { module: thisModule }, { error: "Must supply a string" });
      res.status(500).send({ message: "Must supply a string" });
    }
    let result = string.toUpperCase();
    logger.debug("finished stringToUpperCase()", { module: thisModule }, { response: result });
    res.status(200).send({ message: "Successful", result: result });
  },

  // Lower Case a string
  stringToLowerCase: (req, res) => {
    logger.debug("started stringToLowerCase()", { module: thisModule });
    const string = req.body.string;
    if (!string) {
      logger.error("stringToLowerCase()", { module: thisModule }, { error: "Must supply a string" });
      res.status(500).send({ message: "Must supply a string" });
    }
    let result = string.toLowerCase();
    logger.debug("finished stringToLowerCase()", { module: thisModule }, { response: result });
    res.status(200).send({ message: "Successful", result: result });
  },

  // Convert a string to a number
  stringToNumber: (req, res) => {
    logger.debug("started stringToNumber()", { module: thisModule });
    const string = req.body.string;
    if (!string) {
      logger.error("stringToNumber()", { module: thisModule }, { error: "Must supply a string" });
      res.status(500).send({ message: "Must supply a string" });
    }
    // eslint-disable-next-line no-undef
    let result = Number.parseFloat(string);
    logger.debug("finished stringToNumber()", { module: thisModule }, { response: result });
    res.status(200).send({ message: "Successful", result: result });
  },

  // Convert an array to a string
  arrayIteration: async (req, res) => {
    const array = req.body.array;
    const blockflowId = req.body.blockflowId;
    // eslint-disable-next-line no-unused-vars
    const initialData = {};
    const PROTO_PATH = process.env.PROTO_PATH;
    let responseArray = [];

    if (!array) {
      res.status(500).send({ message: "Must supply an array" });
    }
    if (!blockflowId) {
      res.status(500).send({ message: "Must supply a blockflowId" });
    }

    const protoDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      arrays: true,
    });

    const packageDefinition = grpc.loadPackageDefinition(protoDefinition).blockspaces;
    const client = new packageDefinition.Connect(process.env.SERVER_URL + ":" + process.env.SERVER_PORT, grpc.credentials.createInsecure());
    const deadline = new Date().setSeconds(new Date().getSeconds() + 300)


    const arrayLoopPromises = await array.map(async (instance) => {
      // eslint-disable-next-line no-async-promise-executor
      const responseItem = new Promise(async (resolve, reject) => {
        let initialData = {
          supplierId: instance,
        };
        const dataToSend = Buffer.from(JSON.stringify(initialData));
        let metadata = new grpc.Metadata();
        metadata.add("authorization", `Bearer 1234`);
        let message = {
          id: blockflowId,
          data: dataToSend,
        };
        logger.debug(thisModule, "sending message", message, metadata);
        await client.send(
          message,
          metadata,
          {
            deadline: deadline,
          },
          (err, response) => {
            if (err) {
              if (err.response.status == '404') {
                resolve(null)
              } else {
                reject(err);
              }
            } else {
              resolve(JSON.parse(response.data).companyName);
            }
          }
        );
      });
      return responseItem;
    });
    try {
      responseArray = await (await Promise.all(arrayLoopPromises));
      logger.debug(thisModule, "transformation Iteration", { response: responseArray });
      res.status(200).send({ message: "Successful", result: responseArray });
    } catch (err) {
      res.status(500).send(err);
    }
  },

  // Convert an array to a string
  arrayFilter: (req, res) => {
    logger.debug("started arrayFilter()", { module: thisModule });
    const string = req.body.string;
    if (!string) {
      logger.error("arrayFilter()", { module: thisModule }, { error: "Must supply a string" });
      res.status(500).send({ message: "Must supply a string" });
    }
    // eslint-disable-next-line no-undef
    let result = number.parseNumber(string);
    logger.debug("finished arrayFilter()", { module: thisModule }, { response: result });
    res.status(200).send({ message: "Successful", result: result });
  },
};

export default tranformationsController;
