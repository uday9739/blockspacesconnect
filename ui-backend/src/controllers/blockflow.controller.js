/* eslint-disable linebreak-style */
import db from "../models/index.js";
import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
import path from "path";

// eslint-disable-next-line no-unused-vars
const { Blockflow, mongoose } = db;

import logger from "../services/bscLogger.js";
// import * as os from "os";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);


const blockflowController = {
  // Create and Save a new Blockflow
  create: (req, res) => {
    logger.debug("started create()", { module: thisModule });
    // Create a Blockflow
    const newBlockflow = new Blockflow({
      id: req.body.id,
      name: req.body.name,
      parentId: req.body.parentId,
      clientId: req.user.clientId,
      type: req.body.type,
      isAuthFlow: req.body.isAuthFlow,
      steps: req.body.steps,
      mappings: req.body.mappings,
    });

    // Save blockflow definition in the database
    newBlockflow
      .save()
      .then((data) => {
        logger.debug("finished create()", { module: thisModule }, { response: data });
        res.status(200).send(data);
      })
      .catch((err) => {
        logger.error("create()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while creating the blockflow." });
        res.status(500).send({
          message: err.message || "Some error occurred while creating the blockflow.",
        });
      });
  },

  // Retrieve all blockflow definitions of a Client from the database.
  findAllClientBlockflows: (req, res) => {
    logger.debug("started findAllClientBlockflows()", { module: thisModule });
    const { clientId } = req.user;
    // logger.debug('blockflowController.js', 'findAllClientBlockFlows', req.user, clientId);
    logger.debug("findAllClientBlockFlows()", { module: thisModule }, { response: { user: req.user, clientId: clientId } });
    Blockflow.find({ clientId: clientId })
      .then((data) => {
        logger.debug("finished findAllClientBlockflows()", { module: thisModule });
        res.status(200).send(data);
      })
      .catch((err) => {
        logger.error("findAllClientBlockflows()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while retrieving client blockflow details." });
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving client blockflow details.",
        });
      });
  },

  // Find a single Client Blockflow definition with an id
  findOne: (req, res) => {
    logger.debug("started findOne()", { module: thisModule });
    const id = req.params.id;

    Blockflow.find({ id: id })
      .then((data) => {
        if (!data) {
          logger.debug("finished findOne()", { module: thisModule }, { response: data[0] });
          res.status(404).send({ message: "Did not find a BlockFlow with id " + id });
        } else if (!Array.isArray(data)) {
          logger.debug("finished findOne()", { module: thisModule }, { response: "Did not find a BlockFlow with id " + id });
          res.status(404).send({ message: "Did not find a BlockFlow with id " + id });
        } else if (Array.isArray(data) && data.length < 1) {
          logger.debug("finished findOne()", { module: thisModule }, { response: "Did not find a BlockFlow with id " + id });
          res.status(404).send({ message: "Did not find a BlockFlow with id " + id });
        } else if (Array.isArray(data) && data.length > 1) {
          logger.debug("finished findOne()", { module: thisModule }, { response: "Found more than one BlockFlow with id " + id });
          res.status(404).send({ message: "Found more than one BlockFlow with id " + id });
        } else {
          logger.debug("finished findOne()", { module: thisModule }, { response: data[0] });
          res.send(data[0]);
        }
      })
      .catch((err) => {
        logger.debug("finished findOne()", { module: thisModule }, { error: err.message ? err.message : "Error retrieving Client blockflow definition with id=" + id });
        res.status(500).send({
          message: "Error retrieving Client blockflow definition with id=" + id,
        });
      });
  },

  // Update a Client blockflow definition by the id in the request
  update: (req, res) => {
    logger.debug("started update()", { module: thisModule });
    const id = req.params.id;

    Blockflow.findOneAndUpdate({ id: id }, req.body, { new: true })
      .then((data) => {
        if (!data) {
          logger.debug("finished findOne()", { module: thisModule }, { response: `Cannot update Client blockflow definition with id=${id}. Maybe Credential was not found!` });
          res.status(404).send({
            message: `Cannot update Client blockflow definition with id=${id}. Maybe Credential was not found!`,
          });
        } else {
          logger.debug("finished findOne()", { module: thisModule });
          res.status(200).send({ message: "Client blockflow definition was updated successfully." });
        }
      })
      .catch((err) => {
        logger.error("findOne()", { module: thisModule }, { error: err.message ? err.message : "Error updating Client blockflow definition with id=" + id });
        res.status(500).send({
          message: "Error updating Client blockflow definition with id=" + id,
        });
      });
  },

  // Delete a Client blockflow definition with the specified id in the request
  delete: (req, res) => {
    logger.debug("started delete()", { module: thisModule });
    const id = req.params.id;
    const { clientId } = req.user;

    Blockflow.findOneAndRemove({ id, clientId })
      .then((data) => {
        if (!data) {
          logger.debug("finished delete()", { module: thisModule }, { response: `Cannot delete Client blockflow definition with id=${id}. Maybe Client Credential was not found!` });
          res.status(404).send({ message: `Cannot delete Client blockflow definition with id=${id}. Maybe Client Credential was not found!` });
        } else {
          logger.debug("finished delete()", { module: thisModule });
          res.status(200).send({ message: "Client blockflow definition was deleted successfully!" });
        }
      })
      .catch((err) => {
        logger.error("started delete()", { module: thisModule }, { error: err.message ? err.message : "Could not delete Client blockflow definition with id=" + id });
        res.status(500).send({
          message: err.message || "Could not delete Client blockflow definition with id=" + id,
        });
      });
  },

  // Delete all Client blockflow definitions from the database.
  deleteAll: (req, res) => {
    logger.debug("started deleteAll()", { module: thisModule });
    const { clientId } = req.user;
    Blockflow.deleteMany({ clientId: clientId })
      .then((data) => {
        logger.debug("finished deleteAll()", { module: thisModule });
        res.status(200).send({ message: `${data.deletedCount} Client blockflow definitions were deleted successfully!` });
      })
      .catch((err) => {
        logger.error("deleteAll()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while removing all client blockflow definitions." });
        res.status(500).send({
          message: err.message || "Some error occurred while removing all client blockflow definitions.",
        });
      });
  },

  // Delete all Client blockflow definitions from the database.
  removeCredentials: (req, res) => {
    logger.debug("started removeCredentials()", { module: thisModule });
    const { clientId } = req.user;
    const credentialId = req.body.credentialId;
    Blockflow.find({
      clientId: clientId,
      steps: {
        $elemMatch: {
          $elemMatch: {
            "credentials.credentialId": credentialId,
          },
        },
      },
    })
      .then((data) => {
        logger.debug("finished removeCredentials()", { module: thisModule }, { response: `found blockflows with credentialId=${credentialId}. Data = ${data}` });
        data.map((blockflow) => {
          blockflow.steps.map((step, stepIndex) => {
            step.map((connection, connectionIndex) => {
              if (connection.credentials.credentialId === credentialId) {
                const blockflowToUpdate = blockflow;
                blockflowToUpdate.steps[stepIndex][connectionIndex].credentials.credentialId = "";
                Blockflow.findOneAndUpdate({ id: blockflowToUpdate.id }, blockflowToUpdate, { new: true })
                  .then((blockflowUpdated) => {
                    if (!blockflowUpdated) {
                      logger.debug(
                        "finished findOne()",
                        { module: thisModule },
                        { response: `Cannot remove credentials for blockflow definition with id=${blockflowToUpdate.id}. Maybe Credential was not found!` }
                      );
                      res.status(404).send({
                        message: `Cannot update Client blockflow definition with id=${blockflowToUpdate.id}. Maybe Credential was not found!`,
                      });
                    }
                  })
                  .catch((err) => {
                    logger.error("findOne()", { module: thisModule }, { error: err.message ? err.message : `Error removing credentials for Client blockflow definition with id= ${blockflowToUpdate.id}` });
                    res.status(500).send({
                      message: `Error removing credentials for Client blockflow definition with id= ${blockflowToUpdate.id}`,
                    });
                  });
              }
            });
          });
        });
        res.status(200).send({ message: `Credentials removed from Client blockflow successfully!` });
      })
      .catch((err) => {
        logger.error("removeCredentials()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while removing all client blockflow definitions." });
        res.status(500).send({
          message: err.message || "Some error occurred while removing all client blockflow definitions.",
        });
      });
  },

  test: (req, res) => {
    logger.debug("started test()", { module: thisModule });
    const blockFlowId = req.params.id;
    const initialData = req.body.initialData || {};
    const PROTO_PATH = process.env.PROTO_PATH;

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

    const dataToSend = Buffer.from(JSON.stringify(initialData));
    const metadata = new grpc.Metadata();
    metadata.add("authorization", `Bearer 1234`);
    //metadata.set('deadline', deadline);
    const message = {
      id: blockFlowId,
      data: dataToSend,
    };
    // logger.debug('blockflow.controller.cjs', 'sending message', message, metadata);
    logger.debug("test()", "testing blockflow", { module: thisModule }, { response: message });

    client.send(
      message,
      metadata,
      {
        deadline: deadline,
      },
      (err, response) => {
        if (err) {
          logger.error("test()", { module: thisModule }, { error: err.message ? err.message : "error testing blockflow Id: " + blockFlowId });
          res.status(500).json({code:err.code,details:JSON.parse(err.details)});
        } else {
          logger.debug("finished test()", { module: thisModule });
          res.status(200).send(JSON.parse(response.data)[0].data);
        }
      }
    );
  },
};

export default blockflowController;
